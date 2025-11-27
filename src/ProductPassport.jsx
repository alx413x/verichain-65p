import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, Clock, Copy, Check } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ProductPassport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState(null);
  
  // 获取从首页传过来的产品数据，如果没有数据（直接访问链接），则显示默认或返回
  const product = location.state?.product;

  // Helper function to shorten address
  const shortenAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl mb-4">No product data found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Back to Home</button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => navigate('/')}
    >
      <div 
        className="bg-white w-full max-w-[900px] rounded-2xl shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/vite.svg" alt="dApp Logo" className="h-8 w-auto" />
            <h2 className="text-[28px] font-bold text-gray-900">Product Passport</h2>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
        
          {/* Product Image and Basic Info */}
          <div className="flex gap-6 items-start">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 w-[180px] h-[180px] rounded-xl flex items-center justify-center flex-shrink-0">
              <div className="text-[80px]">{product.image || '⌚'}</div>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-[24px] font-bold text-gray-900">{product.model}</h3>
                <p className="text-[16px] text-gray-500 mt-1">Serial: {product.sn}</p>
              </div>
              
              {/* Manufacturer Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-gray-500 mb-1">Manufacturer</p>
                    <p className="text-[16px] font-mono font-medium text-gray-900">
                      {shortenAddress(product.manufacturer)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(product.manufacturer, 'manufacturer')}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy full address"
                  >
                    {copiedField === 'manufacturer' ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Current Owner Address */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-blue-600 mb-1">Current Owner</p>
                    <p className="text-[16px] font-mono font-medium text-gray-900">
                      {shortenAddress(product.owner)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(product.owner, 'owner')}
                    className="p-2 hover:bg-blue-200 rounded-md transition-colors"
                    title="Copy full address"
                  >
                    {copiedField === 'owner' ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-blue-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-gray-900">Warranty Status</h3>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                product.warrantyStatus === 'Active' ? 'bg-green-100 text-green-700' : 
                product.warrantyStatus === 'Expired' ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {product.warrantyStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-500 mb-1">Expiration Date</p>
                <p className="text-[16px] font-semibold text-gray-900">{product.warrantyEnd}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 mb-1">Claims Remaining</p>
                <p className="text-[16px] font-semibold text-gray-900">{product.claimsLeft}</p>
              </div>
            </div>
          </div>

          {/* Product Provenance Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-[20px] font-bold text-gray-900 mb-6">Product History</h3>
            
            <div className="space-y-4">
              {(product.history || []).map((event, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-gray-900">{event.desc}</p>
                    <p className="text-[13px] text-gray-500 mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <a 
              href={`https://sepolia.etherscan.io/address/${product.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-end gap-2 text-blue-600 text-[14px] font-medium mt-6 hover:underline"
            >
              View on Etherscan <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPassport;