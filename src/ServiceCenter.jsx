import React, { useState, useEffect } from 'react';
import { Wallet, Check, X, AlertCircle, Eye, X as XClose } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const ServiceCenter = () => {
  const { isConnected, isServiceCenter, warrantyManager, productRegistry, account, latestEvent } = useContracts();

  // --- 1. State management ---
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. Modal state ---
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 2. Load claims from blockchain ---
  useEffect(() => {
    if (warrantyManager && productRegistry && account) {
      loadClaims();
    }
  }, [warrantyManager, productRegistry, account]);

  // --- Auto-refresh when relevant events occur ---
  useEffect(() => {
    if (!latestEvent) return;
    
    const { type } = latestEvent;
    
    // Refresh claims list when new claims submitted or reviewed
    if (type === 'ClaimSubmitted') {
      console.log('ServiceCenter: Auto-refreshing due to ClaimSubmitted event');
      loadClaims();
    } else if (type === 'ClaimReviewed') {
      console.log('ServiceCenter: Auto-refreshing due to ClaimReviewed event');
      loadClaims();
    }
  }, [latestEvent]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      
      // Get all warranty claims
      const allClaims = await warrantyManager.listAllWarrantyClaims();
      console.log('Raw claims from contract:', allClaims);
      
      const claimsData = await Promise.all(
        allClaims.map(async (claim, index) => {
          try {
            // Get product details
            const productDetails = await productRegistry.getProductDetails(claim.serialNumber);
            
            // Format status
            let status = 'Pending';
            if (claim.status === 1n) status = 'Approved';
            else if (claim.status === 2n) status = 'Rejected';
            
            return {
              id: index,
              claimId: Number(claim.claimIndex), // Use the actual claim index from the contract
              serialNumber: claim.serialNumber,
              customer: claim.claimant,
              address: `${claim.claimant.slice(0, 6)}...${claim.claimant.slice(-4)}`,
              reason: claim.reason || 'No reason provided',
              status: status,
              date: new Date(Number(claim.submitDate) * 1000).toLocaleDateString(),
              model: productDetails.model
            };
          } catch (err) {
            console.error(`Error loading claim ${index}:`, err);
            return null;
          }
        })
      );
      
      // Filter out null entries
      const validClaims = claimsData.filter(claim => claim !== null);
      console.log('Processed claims:', validClaims);
      setClaims(validClaims);
      setLoading(false);
    } catch (err) {
      console.error('Error loading claims:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- 3. Handle claim actions ---
  const handleApprove = async (claimId, serialNumber) => {
    try {
      setProcessing(true);
      // reviewClaim(serialNumber, claimIndex, approve, reviewReason)
      const tx = await warrantyManager.reviewClaim(serialNumber, claimId, true, 'Approved by service center');
      await tx.wait();
      
      // Reload claims
      await loadClaims();
      setProcessing(false);
    } catch (err) {
      console.error('Approve failed:', err);
      alert(`Approve failed: ${err.message}`);
      setProcessing(false);
    }
  };

  const handleReject = async (claimId, serialNumber) => {
    try {
      setProcessing(true);
      // reviewClaim(serialNumber, claimIndex, approve, reviewReason)
      const tx = await warrantyManager.reviewClaim(serialNumber, claimId, false, 'Rejected by service center');
      await tx.wait();
      
      // Reload claims
      await loadClaims();
      setProcessing(false);
    } catch (err) {
      console.error('Reject failed:', err);
      alert(`Reject failed: ${err.message}`);
      setProcessing(false);
    }
  };

  // --- 4. Handle view details ---
  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedClaim(null), 300);
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black relative overflow-x-hidden">

      {/* ================= Main Content ================= */}
      <main className="max-w-[1512px] mx-auto px-8 lg:px-[137px] pt-12 pb-20">
        
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[40px] font-bold mb-2">Service Center Portal</h1>
          <p className="text-[25px] font-medium text-black/70">Review and process warranty claims</p>
        </div>

        {/* Section Header */}
        <div className="mb-6 pl-4 border-l-4 border-[#0C86DE]">
          <h2 className="text-[40px] font-bold text-black">Warranty Claims</h2>
        </div>

        {/* ================= Claims Table ================= */}
        <div className="w-full">
          <div className="bg-white w-full h-[93px] flex items-center px-8 lg:px-[50px] shadow-sm mb-4 rounded-t-lg border-b border-gray-100">
            <div className="w-1/5 text-[25px] font-bold text-black">Product S/N</div>
            <div className="w-1/4 text-[25px] font-bold text-black text-center">Customer Address</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Status</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Date</div>
            <div className="w-1/5 text-[25px] font-bold text-black text-right pr-8">Actions</div>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading claims...</p>
                </div>
              </div>
            ) : claims.length === 0 ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex items-center justify-center text-gray-400 text-xl shadow-sm">
                No warranty claims found.
              </div>
            ) : (
              claims.map((item) => (
                <div key={item.id} className="bg-white w-full h-[126px] flex items-center px-8 lg:px-[50px] shadow-sm rounded-lg animate-fade-in hover:shadow-md transition-shadow">
                  <div className="w-1/5 text-[25px] font-normal text-black">{item.serialNumber}</div>
                  <div className="w-1/4 text-[25px] font-normal text-black text-center font-mono text-gray-600">{item.address}</div>
                  <div className="w-1/6 flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-[20px] font-bold border ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      item.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-1/6 text-[25px] font-normal text-black text-center">{item.date}</div>
                  <div className="w-1/5 flex justify-end gap-4 pr-4">
                    <button 
                      onClick={() => handleViewDetails(item)} 
                      className="px-4 py-2 rounded-lg bg-[#0C86DE] text-white text-[18px] font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-sm"
                    >
                      <Eye size={20} />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ================= Claim Details Modal ================= */}
      {isModalOpen && selectedClaim && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-6">
              <h2 className="text-[32px] font-bold text-black">Claim Details</h2>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6">
              {/* Product Information */}
              <div className="mb-8">
                <h3 className="text-[24px] font-bold text-black mb-4 pb-2 border-b border-gray-200">Product Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[16px] font-medium text-gray-600 mb-1">Product Model</p>
                    <p className="text-[20px] font-normal text-black">{selectedClaim.model}</p>
                  </div>
                  <div>
                    <p className="text-[16px] font-medium text-gray-600 mb-1">Serial Number</p>
                    <p className="text-[20px] font-mono text-black font-bold">{selectedClaim.serialNumber}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-8">
                <h3 className="text-[24px] font-bold text-black mb-4 pb-2 border-b border-gray-200">Customer Information</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-[16px] font-medium text-gray-600 mb-1">Customer Address</p>
                    <p className="text-[18px] font-mono text-black">{selectedClaim.customer}</p>
                  </div>
                </div>
              </div>

              {/* Claim Information */}
              <div className="mb-8">
                <h3 className="text-[24px] font-bold text-black mb-4 pb-2 border-b border-gray-200">Claim Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[16px] font-medium text-gray-600 mb-1">Claim Reason</p>
                    <p className="text-[20px] font-normal text-black">{selectedClaim.reason}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[16px] font-medium text-gray-600 mb-1">Claim Date</p>
                      <p className="text-[20px] font-normal text-black">{selectedClaim.date}</p>
                    </div>
                    <div>
                      <p className="text-[16px] font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-block px-4 py-2 rounded-full text-[18px] font-bold border ${
                        selectedClaim.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                        selectedClaim.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {selectedClaim.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-8 py-6 flex gap-4">
              {selectedClaim.status === 'Pending' && isServiceCenter && (
                <>
                  <button 
                    onClick={() => {
                      handleReject(selectedClaim.claimId, selectedClaim.serialNumber);
                      closeModal();
                    }}
                    disabled={processing}
                    className="flex-1 py-4 rounded-lg bg-red-600 text-white text-[20px] font-bold hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <X size={24} /> Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleApprove(selectedClaim.claimId, selectedClaim.serialNumber);
                      closeModal();
                    }}
                    disabled={processing}
                    className="flex-1 py-4 rounded-lg bg-green-600 text-white text-[20px] font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <Check size={24} /> Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCenter;