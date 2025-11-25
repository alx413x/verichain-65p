import React, { useState, useEffect } from 'react';
import { Wallet, Check, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const ServiceCenter = () => {
  const { isConnected, isServiceCenter, warrantyManager, productRegistry, account } = useContracts();

  // --- 1. State management ---
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. Load claims from blockchain ---
  useEffect(() => {
    if (warrantyManager && productRegistry && account && isServiceCenter) {
      loadClaims();
    }
  }, [warrantyManager, productRegistry, account, isServiceCenter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      
      // Get all warranty claims
      const allClaims = await warrantyManager.listAllWarrantyClaims();
      
      const claimsData = await Promise.all(
        allClaims.map(async (claim) => {
          try {
            // Get product details
            const productDetails = await productRegistry.getProductDetails(claim.serialNumber);
            
            // Format status
            let status = 'Pending';
            if (claim.status === 1n) status = 'Approved';
            else if (claim.status === 2n) status = 'Rejected';
            
            return {
              id: Number(claim.claimId),
              claimId: Number(claim.claimId),
              serialNumber: claim.serialNumber,
              customer: claim.customer,
              address: `${claim.customer.slice(0, 6)}...${claim.customer.slice(-4)}`,
              reason: claim.reason || 'No reason provided',
              status: status,
              date: new Date(Number(claim.timestamp) * 1000).toLocaleDateString(),
              model: productDetails.model
            };
          } catch (err) {
            console.error(`Error loading claim ${claim.claimId}:`, err);
            return null;
          }
        })
      );
      
      // Filter out null entries
      const validClaims = claimsData.filter(claim => claim !== null);
      setClaims(validClaims);
      setLoading(false);
    } catch (err) {
      console.error('Error loading claims:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- 3. Handle claim actions ---
  const handleApprove = async (claimId) => {
    try {
      setProcessing(true);
      const tx = await warrantyManager.approveClaim(claimId);
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

  const handleReject = async (claimId) => {
    try {
      setProcessing(true);
      const tx = await warrantyManager.rejectClaim(claimId);
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
          <h2 className="text-[40px] font-bold text-black">Pending Warranty Claims</h2>
        </div>

        {/* ================= Claims Table ================= */}
        <div className="w-full">
          <div className="bg-white w-full h-[93px] flex items-center px-8 lg:px-[50px] shadow-sm mb-4 rounded-t-lg border-b border-gray-100">
            <div className="w-1/6 text-[25px] font-bold text-black">Claim ID</div>
            <div className="w-1/5 text-[25px] font-bold text-black">Product S/N</div>
            <div className="w-1/4 text-[25px] font-bold text-black text-center">Customer</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Status</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Date</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-right pr-8">Actions</div>
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
                <div key={item.id} className="bg-white w-full min-h-[126px] flex items-center px-8 lg:px-[50px] shadow-sm rounded-lg animate-fade-in hover:shadow-md transition-shadow py-4">
                  <div className="w-1/6 text-[25px] font-normal text-black">#{item.claimId}</div>
                  <div className="w-1/5 text-[20px] font-normal text-black">
                    <div className="font-mono">{item.serialNumber}</div>
                    <div className="text-[16px] text-gray-500">{item.model}</div>
                  </div>
                  <div className="w-1/4 text-center">
                    <div className="text-[18px] font-mono text-gray-600">{item.address}</div>
                    {item.reason && (
                      <div className="text-[14px] text-gray-500 mt-1 italic">Reason: {item.reason}</div>
                    )}
                  </div>
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
                  <div className="w-1/6 flex justify-end gap-4 pr-4">
                    {item.status === 'Pending' ? (
                      isServiceCenter ? (
                        <>
                          <button 
                            onClick={() => handleReject(item.claimId)}
                            disabled={processing}
                            className="w-[50px] h-[50px] rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={30} />
                          </button>
                          <button 
                            onClick={() => handleApprove(item.claimId)}
                            disabled={processing}
                            className="w-[50px] h-[50px] rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={30} />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-[14px] font-medium italic">Requires SERVICE_CENTER role</span>
                      )
                    ) : (
                      <span className="text-gray-400 text-[18px] font-medium italic">Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceCenter;