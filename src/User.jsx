// src/User.jsx
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, FileText, AlertCircle, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const User = () => {
  const { isConnected, isCustomer, productRegistry, ownershipManager, warrantyManager, account } = useContracts();

  // --- 1. State management ---
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. Modal state ---
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [claimReason, setClaimReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- 3. Load products from blockchain ---
  useEffect(() => {
    if (productRegistry && ownershipManager && warrantyManager && account && isCustomer) {
      loadProducts();
    }
  }, [productRegistry, ownershipManager, warrantyManager, account, isCustomer]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const ownedProducts = await ownershipManager.getProductsByOwner(account);
      
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
            image: '📦',
            purchaseDate: warrantyStartDate > 0 ? new Date(warrantyStartDate * 1000).toLocaleDateString() : 'N/A',
            warrantyExp: warrantyExpiration > 0 ? new Date(warrantyExpiration * 1000).toLocaleDateString() : 'No Warranty',
            status: isExpired ? 'Expired' : 'Active',
            description: `Serial: ${serialNumber}`,
            warrantyDays: warrantyExpiration > 0 ? Math.floor((warrantyExpiration - warrantyStartDate) / 86400) : 0,
            claimsRemaining: Number(details.warranty.remainingCount)
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
            // 调整卡片宽度和样式以匹配设计稿尺寸（如 472px 宽）
            <div key={product.id} className="bg-white w-full rounded-[20px] shadow-md p-8 flex flex-col items-start gap-6 hover:shadow-lg transition-all animate-fade-in">
              
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
                <div className="flex gap-4 mt-4">
                  <button className="flex-1 h-[60px] bg-white border-2 border-[#0C86DE] text-[#0C86DE] rounded-xl text-[22px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <FileText size={24} /> View Passport
                  </button>
                  
                  {product.status === 'Active' && (
                    <button 
                      onClick={() => isCustomer && openClaimModal(product)}
                      disabled={!isCustomer}
                      className={`flex-1 h-[60px] rounded-xl text-[22px] font-bold transition-colors flex items-center justify-center gap-2 ${
                        isCustomer 
                          ? 'bg-[#0C86DE] text-white hover:bg-blue-700 shadow-md cursor-pointer' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Shield size={24} /> Claim Warranty
                    </button>
                  )}

                  {product.status === 'Claiming' && (
                    <button disabled className="flex-1 h-[60px] bg-gray-100 text-gray-400 rounded-xl text-[22px] font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <Clock size={24} /> Claim Processing...
                    </button>
                  )}
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

    </div>
  );
};

// 引入 ArrowLeft 图标，用于 Back to Home 链接
import { ArrowLeft } from 'lucide-react';

export default User;