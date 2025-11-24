import React from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ProductPassport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 获取从首页传过来的产品数据，如果没有数据（直接访问链接），则显示默认或返回
  const product = location.state?.product;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl mb-4">No product data found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black pb-20">
      
      {/* Top Bar: Back Button */}
      <div className="max-w-[1512px] mx-auto pt-8 px-8 lg:px-[73px]">
        <Link to="/" className="flex items-center gap-2 text-[#0C86DE] text-[30px] lg:text-[40px] font-medium hover:underline">
          <ArrowLeft size={40} /> Back to Home
        </Link>
      </div>

      <main className="max-w-[1512px] mx-auto mt-8 px-8 lg:px-[73px] flex flex-col lg:flex-row gap-12">
        
        {/* === Left Column: Image & Basic Info === */}
        <div className="flex flex-col gap-8 w-full lg:w-[45%]">
          
          {/* Product Image Card */}
          <div className="bg-white w-full h-[381px] rounded-lg shadow-md flex items-center justify-center p-4 relative">
             {/* Image Placeholder */}
             <div className="text-[100px]">{product.image || '⌚'}</div>
          </div>

          {/* Product Details Card */}
          <div className="bg-white w-full py-8 px-12 rounded-lg shadow-sm border-b border-black/50">
            <h2 className="text-[30px] font-bold mb-8">Product Information</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[25px] font-medium">Model:</span>
                <span className="text-[25px] font-bold">{product.model}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[25px] font-medium">Serial Number:</span>
                <span className="text-[25px] font-bold">{product.sn}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-[25px] font-medium">Manufacturer:</span>
                <span className="text-[25px] font-bold">{product.manufacturer}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === Right Column: Owner, Warranty, History === */}
        <div className="flex flex-col gap-8 w-full lg:w-[55%]">
          
          {/* 1. Current Owner Card */}
          <div className="bg-white w-full p-10 rounded-lg shadow-sm">
            <h3 className="text-[30px] font-bold mb-2">Current Owner</h3>
            <p className="text-[25px] font-medium text-[#000] break-all font-mono">
              {product.owner}
            </p>
          </div>

          {/* 2. Warranty Status Card */}
          <div className="bg-white w-full p-10 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[30px] font-bold">Warranty Status</h3>
              {/* Status Badge (Image 15 replacement) */}
              <div className={`px-6 py-2 rounded-full text-white text-xl font-bold ${product.warrantyStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                {product.warrantyStatus}
              </div>
            </div>
            
            <div className="space-y-4 pl-4">
              <div className="flex items-center gap-4 text-[25px]">
                 <span className="font-normal w-[200px]">Status:</span>
                 <span className="font-bold text-green-600 flex items-center gap-2">
                   <CheckCircle /> Valid
                 </span>
              </div>
              <div className="flex items-center gap-4 text-[25px]">
                 <span className="font-normal w-[200px]">End Date:</span>
                 <span className="font-bold">{product.warrantyEnd}</span>
              </div>
              <div className="flex items-center gap-4 text-[25px]">
                 <span className="font-normal w-[200px]">Claims Remaining:</span>
                 <span className="font-bold">{product.claimsLeft}</span>
              </div>
            </div>
          </div>

          {/* 3. Product Provenance (Timeline) */}
          <div className="bg-white w-full p-10 rounded-lg shadow-sm relative">
            <h3 className="text-[30px] font-bold mb-8">Product Provenance</h3>
            
            <div className="relative space-y-8 pl-4 before:absolute before:left-[108px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
              
              {/* Timeline Items */}
              {product.history.map((event, index) => (
                <div key={index} className="flex items-start gap-8 relative">
                  <span className="w-[100px] text-[15px] text-gray-500 pt-1 text-right">
                    {event.date}
                  </span>
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 z-10 shadow-[0_0_0_4px_white]"></div>
                  <span className="text-[15px] font-bold pt-1">
                    {event.desc}
                  </span>
                </div>
              ))}

            </div>

            <a href="#" className="flex items-center justify-end gap-2 text-[#0C86DE] text-[30px] font-bold mt-8 hover:underline">
              View on Etherscan <ExternalLink size={30} />
            </a>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProductPassport;