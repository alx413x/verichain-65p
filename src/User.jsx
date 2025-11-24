// src/User.jsx (修改后)
import React, { useState } from 'react';
import { Wallet, Shield, FileText, AlertCircle, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const User = () => {
  // --- 1. 模拟用户拥有的产品数据 ---
  const [myProducts, setMyProducts] = useState([
    {
      id: 1,
      serialNumber: 'SN-111',
      model: 'Apple Watch Series 9',
      image: '⌚', // 这里的 emoji 模拟产品图片
      purchaseDate: '2024-01-15',
      warrantyExp: '2026-01-15',
      status: 'Active', // Active, Claiming, Expired
      description: 'Space Gray Aluminum Case with Midnight Sport Band'
    },
    {
      id: 2,
      serialNumber: 'SN-222',
      model: 'iPhone 16 Pro',
      image: '📱',
      purchaseDate: '2024-10-01',
      warrantyExp: '2025-10-01',
      status: 'Active',
      description: 'Titanium Black, 256GB'
    }
  ]);

  // --- 2. 弹窗状态 ---
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [claimReason, setClaimReason] = useState('');

  // --- 3. 处理保修申请 ---
  const openClaimModal = (product) => {
    setSelectedProduct(product);
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    // 更新产品状态为 "Claiming"
    const updatedProducts = myProducts.map(p => 
      p.id === selectedProduct.id ? { ...p, status: 'Claiming' } : p
    );
    setMyProducts(updatedProducts);
    setIsClaimModalOpen(false);
    setClaimReason('');
    alert(`Warranty claim submitted for ${selectedProduct.model}. Please check Service Center status.`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black relative overflow-x-hidden">


      {/* ================= Main Content ================= */}
      <main className="max-w-[1512px] mx-auto px-[123px] pt-12 pb-20">
        
        {/* Header (根据设计稿修改文本和样式) */}
        <div className="mb-12">
          {/* 对应设计稿的 "My Digital Passports" */}
          <h1 className="text-[40px] font-bold mb-2">My Digital Passports</h1>
          {/* 对应设计稿的 "Manage your product ownership and warranties" */}
          <p className="text-[25px] font-medium text-black/70">Manage your product ownership and warranties</p>
        </div>

        {/* Product List (Card Style) */}
        {/* 为了匹配设计稿中 image 4 和 image 10 的并排结构，将 flex-col 改为 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {myProducts.map((product) => (
            // 调整卡片宽度和样式以匹配设计稿尺寸（如 472px 宽）
            <div key={product.id} className="bg-white w-full rounded-[20px] shadow-md p-8 flex flex-col items-start gap-6 hover:shadow-lg transition-all animate-fade-in">
              
              {/* Product Image Placeholder (200x200 保持不变) */}
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
                    {product.status === 'Active' ? '✅ Protected' : 
                     product.status === 'Claiming' ? '⚠️ In Review' : 'Expired'}
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
                      onClick={() => openClaimModal(product)}
                      className="flex-1 h-[60px] bg-[#0C86DE] text-white rounded-xl text-[22px] font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
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
          ))}
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
                className="w-full h-[70px] bg-[#0C86DE] text-white text-[25px] font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                Submit Claim Request
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