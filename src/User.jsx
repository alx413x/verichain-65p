// src/User.jsx
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, FileText, AlertCircle, X, Clock, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const User = () => {
  const { isConnected, isCustomer, productRegistry, ownershipManager, warrantyManager, account, latestEvent } = useContracts();

  // --- 1. State management ---
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. Modal state ---
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [claimReason, setClaimReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferError, setTransferError] = useState('');

  // --- 3. Load products from blockchain ---
  useEffect(() => {
    if (productRegistry && ownershipManager && warrantyManager && account && isCustomer) {
      loadProducts();
    }
  }, [productRegistry, ownershipManager, warrantyManager, account, isCustomer]);

  // --- Auto-refresh when relevant events occur ---
  useEffect(() => {
    if (!latestEvent || !isCustomer) return;
    
    const { type, data } = latestEvent;
    
    // Refresh products when customer receives products or submits claims
    if (type === 'OwnershipTransferred' && data.to === account) {
      console.log('User: Auto-refreshing due to OwnershipTransferred event (product received)');
      loadProducts();
    } else if (type === 'ClaimSubmitted' && data.claimant === account) {
      console.log('User: Auto-refreshing due to ClaimSubmitted event');
      loadProducts();
    } else if (type === 'ClaimReviewed') {
      console.log('User: Auto-refreshing due to ClaimReviewed event');
      loadProducts();
    }
  }, [latestEvent, isCustomer, account]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const ownedProducts = await ownershipManager.getProductsByOwner(account);
      
      // Load icon map from localStorage
      const iconMap = JSON.parse(localStorage.getItem('productIcons') || '{}');
      
      const productsData = await Promise.all(
        ownedProducts.map(async (serialNumber) => {
          const details = await productRegistry.getProductDetails(serialNumber);
          
          // Calculate warranty status
          const now = Math.floor(Date.now() / 1000);
          const warrantyExpiration = Number(details.warranty.expiration);
          const isExpired = warrantyExpiration > 0 && now > warrantyExpiration;
          const warrantyStartDate = Number(details.warranty.startDate);
          
          return {
            id: serialNumber,
            serialNumber: serialNumber,
            model: details.model,
            image: iconMap[serialNumber] || '📦', // Use saved icon or default
            purchaseDate: warrantyStartDate > 0 ? new Date(warrantyStartDate * 1000).toLocaleDateString() : 'N/A',
            warrantyExp: warrantyExpiration > 0 ? new Date(warrantyExpiration * 1000).toLocaleDateString() : 'No Warranty',
            status: isExpired ? 'Expired' : 'Active',
            description: `Serial: ${serialNumber}`,
            warrantyDays: warrantyExpiration > 0 ? Math.floor((warrantyExpiration - warrantyStartDate) / 86400) : 0,
            maxClaims: Number(details.warranty.maxCount) || 0,
            usedClaims: Number(details.warranty.claimCount) || 0,
            claimsRemaining: (Number(details.warranty.maxCount) || 0) - (Number(details.warranty.claimCount) || 0)
          };
        })
      );
      
      setMyProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- 4. Handle warranty claim ---
  const openClaimModal = (product) => {
    setSelectedProduct(product);
    setIsClaimModalOpen(true);
  };

  const openPassportModal = (product) => {
    setSelectedProduct(product);
    setIsPassportModalOpen(true);
  };

  const openTransferModal = (product) => {
    setSelectedProduct(product);
    setIsTransferModalOpen(true);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    
    if (!claimReason.trim()) {
      alert('Please provide a reason for the claim');
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit warranty claim
      const tx = await warrantyManager.submitClaim(
        selectedProduct.serialNumber,
        claimReason
      );
      await tx.wait();

      // Reload products
      await loadProducts();
      
      setIsClaimModalOpen(false);
      setClaimReason('');
      alert(`Warranty claim submitted for ${selectedProduct.model}. Please check Service Center for status.`);
      setSubmitting(false);
    } catch (err) {
      console.error('Claim submission failed:', err);
      alert(`Claim submission failed: ${err.message}`);
      setSubmitting(false);
    }
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    
    // Simple Ethereum address validation (0x + 40 hex characters)
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (!ethAddressRegex.test(transferAddress)) {
      setTransferError('Please enter a valid Ethereum address');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Transfer ownership
      const tx = await ownershipManager.transferOwnership(
        selectedProduct.serialNumber,
        transferAddress
      );
      await tx.wait();
      
      // Reload products
      await loadProducts();
      
      alert(`Transfer request submitted successfully!

Product: ${selectedProduct.model}
Serial: ${selectedProduct.serialNumber}
Recipient Address: ${transferAddress}`);
      setIsTransferModalOpen(false);
      setTransferRecipient('');
      setTransferAddress('');
      setTransferError('');
      setSubmitting(false);
    } catch (err) {
      console.error('Transfer failed:', err);
      alert(`Transfer failed: ${err.message}`);
      setTransferError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black relative overflow-x-hidden">


      {/* ================= Main Content ================= */}
      <main className="max-w-[1512px] mx-auto px-[123px] pt-12 pb-20">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[40px] font-bold mb-2">My Digital Passports</h1>
          <p className="text-[25px] font-medium text-black/70">Manage your product ownership and warranties</p>
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-2 w-full h-[400px] bg-white rounded-lg flex items-center justify-center shadow-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your products...</p>
              </div>
            </div>
          ) : myProducts.length === 0 ? (
            <div className="col-span-2 w-full h-[400px] bg-white rounded-lg flex flex-col items-center justify-center text-gray-400 text-xl shadow-sm">
              <p>No products found</p>
              <p className="text-sm mt-2">Products you own will appear here</p>
            </div>
          ) : (
            myProducts.map((product) => (
            // Card is clickable to open passport modal
            <div 
              key={product.id} 
              onClick={() => openPassportModal(product)}
              className="bg-white w-full rounded-[20px] shadow-md p-8 flex flex-col items-start gap-6 hover:shadow-lg transition-all animate-fade-in cursor-pointer"
            >
              
              {/* Product Image Placeholder */}
              <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl flex items-center justify-center text-[80px]">
                {product.image}
              </div>

              {/* Info Area */}
              <div className="flex-1 flex flex-col justify-between w-full gap-4">
                
                {/* Top: Title & Status */}
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h2 className="text-[35px] font-bold text-black">{product.model}</h2>
                    <p className="text-[20px] text-gray-500 font-mono">{product.serialNumber}</p>
                    <p className="text-[18px] text-gray-400 mt-1">{product.description}</p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-6 py-2 rounded-full text-[20px] font-bold border ${
                    product.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                    product.status === 'Claiming' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {product.status === 'Active' ? 'Protected' : 
                     product.status === 'Claiming' ? 'In Review' : 'Expired'}
                  </span>
                </div>

                {/* Middle: Details Grid */}
                <div className="grid grid-cols-2 gap-6 mt-4 p-4 bg-[#F9FAFB] rounded-xl border border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm font-bold uppercase">Purchase Date</p>
                    <p className="text-[22px] font-medium">{product.purchaseDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-bold uppercase">Warranty Expires</p>
                    <p className="text-[22px] font-medium text-[#0C86DE]">{product.warrantyExp}</p>
                  </div>
                </div>

                {/* Bottom: Action Buttons */}
                <div className="space-y-3">
                  {/* Claim Warranty Button - First */}
                  {product.status === 'Active' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking button
                        isCustomer && openClaimModal(product);
                      }}
                      disabled={!isCustomer}
                      className={`w-full h-[60px] rounded-xl text-[22px] font-bold transition-colors flex items-center justify-center gap-2 ${
                        isCustomer 
                          ? 'bg-[#0C86DE] text-white hover:bg-blue-700 shadow-md cursor-pointer' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Shield size={24} /> Claim Warranty
                    </button>
                  )}

                  {product.status === 'Claiming' && (
                    <button 
                      disabled 
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-[60px] bg-gray-100 text-gray-400 rounded-xl text-[22px] font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Clock size={24} /> Claim Processing...
                    </button>
                  )}
                  
                  {/* Transfer Ownership Button - Second */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking button
                      openTransferModal(product);
                    }}
                    disabled={!isCustomer}
                    className={`w-full h-[60px] rounded-xl text-[22px] font-bold transition-colors flex items-center justify-center gap-2 ${
                      isCustomer
                        ? 'bg-white border-2 border-[#0C86DE] text-[#0C86DE] hover:bg-blue-50'
                        : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={24} /> Transfer Ownership
                  </button>
                </div>

              </div>
            </div>
          ))
          )}
        </div>

        {/* ← Back to Home 链接 (根据设计稿添加) */}
        <div className="mt-12 w-full flex justify-end">
            <Link to="/" className="flex items-center gap-2 text-[#0C86DE] text-[30px] lg:text-[40px] font-medium hover:underline">
                <ArrowLeft size={40} /> Back to Home
            </Link>
        </div>

      </main>

      {/* ================= Warranty Claim Modal (保持不变) ================= */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl p-8 animate-scale-up">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[30px] font-bold flex items-center gap-3">
                <AlertCircle className="text-[#0C86DE]" size={35} />
                Warranty Claim
              </h2>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={32} />
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="font-bold text-blue-800">Product: {selectedProduct?.model}</p>
              <p className="text-blue-600 text-sm font-mono">SN: {selectedProduct?.serialNumber}</p>
            </div>

            <form onSubmit={handleSubmitClaim} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[20px] font-bold text-gray-700">Reason for Claim</label>
                <textarea 
                  required
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Describe the issue with your product..."
                  className="w-full h-[150px] p-4 text-[18px] border border-gray-300 rounded-xl focus:outline-none focus:border-[#0C86DE] focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-[70px] bg-[#0C86DE] text-white text-[25px] font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= View Passport Modal ================= */}
      {isPassportModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsPassportModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-[700px] rounded-2xl shadow-2xl p-8 animate-scale-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="mb-6">
              <h2 className="text-[30px] font-bold flex items-center gap-3">
                <FileText className="text-[#0C86DE]" size={35} />
                Digital Passport
              </h2>
            </div>

            {/* Passport Content */}
            <div className="space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl flex items-center justify-center text-[80px] border-2 border-gray-200">
                  {selectedProduct.image}
                </div>
              </div>

              {/* Product Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <h3 className="text-[28px] font-bold text-black mb-2">{selectedProduct.model}</h3>
                <p className="text-[18px] text-gray-600">{selectedProduct.description}</p>
              </div>

              {/* Serial Number */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-gray-600 text-[14px] font-bold uppercase mb-2">Serial Number</p>
                <p className="text-[22px] font-mono font-bold text-black">{selectedProduct.serialNumber}</p>
              </div>

              {/* Purchase Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600 text-[14px] font-bold uppercase mb-2">Purchase Date</p>
                  <p className="text-[20px] font-bold text-black">{selectedProduct.purchaseDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600 text-[14px] font-bold uppercase mb-2">Warranty Expiry</p>
                  <p className="text-[20px] font-bold text-[#0C86DE]">{selectedProduct.warrantyExp}</p>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600 text-[14px] font-bold uppercase mb-2">Status</p>
                <span className={`inline-block px-6 py-2 rounded-full text-[18px] font-bold border ${
                  selectedProduct.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                  selectedProduct.status === 'Claiming' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {selectedProduct.status === 'Active' ? '✅ Protected' : 
                   selectedProduct.status === 'Claiming' ? '⚠️ In Review' : 'Expired'}
                </span>
              </div>

              {/* Warranty Info */}
              {selectedProduct.claimsRemaining !== undefined && selectedProduct.maxClaims > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-gray-600 text-[14px] font-bold uppercase mb-2">Warranty Claims</p>
                  <p className="text-[20px] font-bold text-blue-600">
                    {selectedProduct.claimsRemaining} / {selectedProduct.maxClaims} claim(s) remaining
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= Transfer Ownership Modal ================= */}
      {isTransferModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl p-8 animate-scale-up">
            
            <h2 className="text-[28px] font-bold text-black mb-6">Transfer Ownership</h2>

            <form onSubmit={handleSubmitTransfer} className="flex flex-col gap-5">
              {/* Product Info */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-gray-600 uppercase">Product</label>
                <p className="text-[18px] font-normal text-black">{selectedProduct?.model}</p>
              </div>

              {/* Serial Number */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-gray-600 uppercase">Serial</label>
                <p className="text-[18px] font-mono text-black">{selectedProduct?.serialNumber}</p>
              </div>

              {/* Recipient Address */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-gray-600 uppercase">Recipient Address</label>
                <input 
                  required
                  type="text"
                  value={transferAddress}
                  onChange={(e) => {
                    setTransferAddress(e.target.value);
                    setTransferError('');
                  }}
                  placeholder="0x123456..."
                  className={`w-full h-[45px] px-4 text-[16px] border rounded-lg focus:outline-none transition-all ${
                    transferError 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-[#0C86DE] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {transferError && (
                  <p className="text-[14px] text-red-600 font-medium">{transferError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setTransferRecipient('');
                    setTransferAddress('');
                    setTransferError('');
                  }}
                  className="flex-1 h-[45px] bg-gray-100 text-gray-700 rounded-lg text-[16px] font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-[45px] bg-[#5B9FDB] text-white rounded-lg text-[16px] font-bold hover:bg-[#4A8BC4] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} /> {submitting ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default User;