import React, { useState } from 'react';
import { Wallet, Plus, ArrowRightLeft, X, CheckCircle, Box, CheckSquare, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

const Manufacturer = () => {
  // --- 1. 状态管理 ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false); // Transfer modal state
  
  // Success Popup State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Data State
  const [products, setProducts] = useState([
    // Initial mock data so transfer modal isn't empty
    { id: 101, serialNumber: 'SN001', model: 'Apple Watch Series 9', date: '2025-10-10', status: 'In Stock', warranty: '365', claims: '2' },
    { id: 102, serialNumber: 'SN002', model: 'Apple Watch Series 9', date: '2025-10-11', status: 'In Stock', warranty: '365', claims: '2' },
    { id: 103, serialNumber: 'SN003', model: 'Samsung Galaxy Watch 6', date: '2025-10-12', status: 'In Stock', warranty: '365', claims: '2' },
  ]);

  // Register Form
  const [registerForm, setRegisterForm] = useState({
    serialNumber: '',
    model: '',
    warranty: '',
    allowedClaims: ''
  });

  // Transfer Form
  const [transferAddress, setTransferAddress] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [addressError, setAddressError] = useState('');

  // --- 2. 逻辑处理 ---

  // Helper: Success Popup
  const triggerSuccessPopup = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); }, 3000);
  };

  // Register Logic
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!registerForm.serialNumber || !registerForm.model) return;

    const newProduct = {
      id: Date.now(),
      serialNumber: registerForm.serialNumber,
      model: registerForm.model,
      date: new Date().toLocaleDateString(),
      status: 'In Stock',
      warranty: registerForm.warranty,
      claims: registerForm.allowedClaims
    };

    setProducts([...products, newProduct]);
    setIsRegisterOpen(false);
    setRegisterForm({ serialNumber: '', model: '', warranty: '', allowedClaims: '' });
    triggerSuccessPopup('Product Registered Successfully!');
  };

  // Transfer Logic
  const toggleProductSelection = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(itemId => itemId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleTransfer = () => {
    // Validation
    if (!transferAddress.startsWith('0x') || transferAddress.length < 5) {
      setAddressError('请输入有效的以太坊地址'); // "Please enter valid ETH address"
      return;
    }
    if (selectedProductIds.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    // Reset Error
    setAddressError('');

    // Update status (Mock logic)
    const updatedProducts = products.map(p => 
      selectedProductIds.includes(p.id) ? { ...p, status: 'Transferred' } : p
    );
    setProducts(updatedProducts);

    // Close & Success
    setIsTransferOpen(false);
    setTransferAddress('');
    setSelectedProductIds([]);
    triggerSuccessPopup('Transfer Success!!');
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black relative overflow-x-hidden">

      {/* ================= Success Popup ================= */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[200] animate-bounce-in">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-[25px] font-bold border-2 border-white/20">
            <CheckCircle size={30} className="text-white" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <main className="max-w-[1512px] mx-auto px-8 lg:px-[116px] pt-12 pb-20">
        
        <div className="mb-8">
          <h1 className="text-[40px] font-bold mb-2">Manufacturer Portal</h1>
          <p className="text-[25px] font-medium text-black/70">Register and manage your products</p>
        </div>

        <div className="flex flex-wrap gap-8 mb-12">
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center justify-center gap-3 px-[52px] py-[24px] bg-[#0C86DE] rounded-[20px] text-[#F9FAFB] text-[25px] font-medium hover:bg-blue-600 transition-shadow shadow-md min-w-[387px]"
          >
            <Plus size={30} />
            Register New Product
          </button>

          <button 
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center justify-center gap-3 px-[52px] py-[24px] bg-[#089E23] rounded-[20px] text-[#F9FAFB] text-[25px] font-medium hover:bg-green-700 transition-shadow shadow-md min-w-[387px]"
          >
            <ArrowRightLeft size={30} />
            Transfer to retailer
          </button>
        </div>

        {/* ================= Product Table ================= */}
        <div className="w-full">
          <div className="bg-white w-full h-[93px] flex items-center px-8 lg:px-[111px] shadow-sm mb-4 rounded-t-lg">
            <div className="w-1/4 text-[30px] lg:text-[40px] font-normal text-black text-center">Serial Number</div>
            <div className="w-1/4 text-[30px] lg:text-[40px] font-normal text-black text-center">Model</div>
            <div className="w-1/6 text-[30px] lg:text-[40px] font-normal text-black text-center">Date</div>
            <div className="w-1/6 text-[30px] lg:text-[40px] font-normal text-black text-center">Status</div>
          </div>

          <div className="flex flex-col gap-4">
            {products.length === 0 ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex flex-col items-center justify-center text-gray-400 text-xl shadow-sm">
                <p>No products registered yet.</p>
              </div>
            ) : (
              products.map((item) => (
                <div key={item.id} className="bg-white w-full h-[93px] flex items-center px-8 lg:px-[111px] shadow-sm rounded-lg animate-fade-in">
                  <div className="w-1/4 text-[25px] font-bold text-black text-center">{item.serialNumber}</div>
                  <div className="w-1/4 text-[25px] font-bold text-black text-center">{item.model}</div>
                  <div className="w-1/6 text-[25px] font-bold text-black text-center">{item.date}</div>
                  <div className="w-1/6 flex justify-center">
                    <span className={`px-4 py-1 rounded-full text-[20px] font-bold border ${item.status === 'In Stock' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ================= Modal 1: Register New Product ================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-xl shadow-2xl relative flex flex-col p-6 animate-scale-up">
            <h2 className="text-[22px] font-bold mb-6 text-gray-900">Register New Product</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-600">Serial Number</label>
                <input type="text" name="serialNumber" value={registerForm.serialNumber} onChange={handleInputChange} className="w-full h-[40px] px-3 text-[15px] bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-800" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-600">Model Name</label>
                <input type="text" name="model" value={registerForm.model} onChange={handleInputChange} className="w-full h-[40px] px-3 text-[15px] bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-800" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-600">Warranty Duration (days)</label>
                <input type="text" name="warranty" value={registerForm.warranty} onChange={handleInputChange} className="w-full h-[40px] px-3 text-[15px] bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-800" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-600">Allowed Claims</label>
                <input type="number" name="allowedClaims" value={registerForm.allowedClaims} onChange={handleInputChange} className="w-full h-[40px] px-3 text-[15px] bg-white border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" />
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsRegisterOpen(false)} className="flex-1 h-[50px] bg-[#F3F4F6] text-gray-600 text-[15px] font-medium rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-[50px] bg-[#2563EB] text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors leading-tight px-2">Mint Product Passport</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Modal 2: Transfer to Retailer (Matches Image) ================= */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl relative flex flex-col p-6 animate-scale-up">
            
            {/* Title */}
            <h2 className="text-[22px] font-bold mb-6 text-gray-900">转移产品给零售商</h2>

            {/* Wallet Address Input */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[14px] font-bold text-gray-600">零售商钱包地址</label>
              <input 
                type="text" 
                value={transferAddress}
                onChange={(e) => {
                  setTransferAddress(e.target.value);
                  if (addressError) setAddressError('');
                }}
                placeholder="0x..."
                className={`w-full h-[50px] px-4 text-[16px] border rounded-md focus:outline-none transition-colors ${
                  addressError ? 'border-red-500 text-red-900' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {addressError && (
                <p className="text-red-500 text-[13px]">{addressError}</p>
              )}
            </div>

            {/* Product List Section */}
            <div className="mb-6">
              <p className="text-[14px] font-bold text-gray-600 mb-3">
                选择要转移的产品 ({selectedProductIds.length} 已选择)
              </p>
              
              <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                {products.filter(p => p.status === 'In Stock').map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <div 
                      key={product.id} 
                      onClick={() => toggleProductSelection(product.id)}
                      className={`flex items-center p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`}
                    >
                      {/* Checkbox Icon */}
                      <div className={`mr-4 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                        {isSelected ? <CheckSquare size={24} fill="currentColor" className="text-blue-600 bg-white" /> : <Square size={24} />}
                      </div>
                      
                      {/* Product Icon */}
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 mr-4">
                         <Box size={20} />
                      </div>

                      {/* Text Info */}
                      <div className="flex flex-col">
                        <span className="font-bold text-[16px] text-gray-900">{product.model}</span>
                        <span className="text-[13px] text-gray-500">序列号: {product.serialNumber}</span>
                      </div>
                    </div>
                  );
                })}
                {products.filter(p => p.status === 'In Stock').length === 0 && (
                   <div className="p-6 text-center text-gray-400">No products available to transfer.</div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => setIsTransferOpen(false)}
                className="flex-1 h-[55px] bg-gray-100 text-gray-700 text-[18px] font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleTransfer}
                className="flex-1 h-[55px] bg-[#8EA5FF] text-white text-[18px] font-medium rounded-lg hover:bg-[#7a92f0] transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#8EA5FF' }} // Matches the light blue in screenshot
              >
                <ArrowRightLeft size={20} /> 
                转移 {selectedProductIds.length} 个产品
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Manufacturer;