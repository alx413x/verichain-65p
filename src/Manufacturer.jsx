import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowRightLeft, X, CheckCircle, Box, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const Manufacturer = () => {
  const { 
    account, 
    isManufacturer, 
    productRegistry, 
    ownershipManager,
    isConnected 
  } = useContracts();

  // --- 1. 状态管理 ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // --- 2. Load products from blockchain ---
  useEffect(() => {
    if (productRegistry && ownershipManager && account && isManufacturer) {
      loadProducts();
    }
  }, [productRegistry, ownershipManager, account, isManufacturer]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const ownedProducts = await ownershipManager.getProductsByOwner(account);
      
      const productsData = await Promise.all(
        ownedProducts.map(async (serialNumber) => {
          const details = await productRegistry.getProductDetails(serialNumber);
          return {
            id: serialNumber,
            serialNumber: serialNumber,
            model: details.model,
            date: new Date(Number(details.timestamp) * 1000).toLocaleDateString(),
            status: 'In Stock',
            warranty: details.warranty.expiration > 0 ? 
              Math.floor((Number(details.warranty.expiration) - Number(details.warranty.startDate)) / 86400) : '0',
            claims: details.warranty.maxCount.toString()
          };
        })
      );
      
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- 3. 逻辑处理 ---

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.serialNumber || !registerForm.model) return;

    try {
      setLoading(true);
      
      // 1. Register product
      const tx1 = await productRegistry.registerProduct(
        registerForm.serialNumber,
        registerForm.model
      );
      await tx1.wait();

      // 2. Create warranty if specified
      if (registerForm.warranty && registerForm.allowedClaims) {
        const tx2 = await productRegistry.createWarranty(
          registerForm.serialNumber,
          registerForm.warranty,
          registerForm.allowedClaims
        );
        await tx2.wait();
      }

      // 3. Sync ownership
      const tx3 = await ownershipManager.syncOwnership(registerForm.serialNumber);
      await tx3.wait();

      setIsRegisterOpen(false);
      setRegisterForm({ serialNumber: '', model: '', warranty: '', allowedClaims: '' });
      triggerSuccessPopup('Product Registered Successfully!');
      
      // Reload products
      await loadProducts();
      setLoading(false);
    } catch (err) {
      console.error('Registration failed:', err);
      alert(`Registration failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Transfer Logic
  const toggleProductSelection = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(itemId => itemId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleTransfer = async () => {
    // Validation
    if (!transferAddress.startsWith('0x') || transferAddress.length !== 42) {
      setAddressError('Please enter a valid Ethereum address');
      return;
    }
    if (selectedProductIds.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    try {
      setLoading(true);
      setAddressError('');

      // Transfer each selected product
      for (const serialNumber of selectedProductIds) {
        const tx = await ownershipManager.transferOwnership(serialNumber, transferAddress);
        await tx.wait();
      }

      setIsTransferOpen(false);
      setTransferAddress('');
      setSelectedProductIds([]);
      triggerSuccessPopup(`Transferred ${selectedProductIds.length} product(s) successfully!`);
      
      // Reload products
      await loadProducts();
      setLoading(false);
    } catch (err) {
      console.error('Transfer failed:', err);
      alert(`Transfer failed: ${err.message}`);
      setLoading(false);
    }
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
            onClick={() => isManufacturer && setIsRegisterOpen(true)}
            disabled={loading || !isManufacturer}
            className="flex items-center justify-center gap-3 px-[52px] py-[24px] bg-[#0C86DE] rounded-[20px] text-[#F9FAFB] text-[25px] font-medium hover:bg-blue-600 transition-shadow shadow-md min-w-[387px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={30} />
            Register New Product
          </button>

          <button 
            onClick={() => isManufacturer && setIsTransferOpen(true)}
            disabled={loading || products.length === 0 || !isManufacturer}
            className="flex items-center justify-center gap-3 px-[52px] py-[24px] bg-[#089E23] rounded-[20px] text-[#F9FAFB] text-[25px] font-medium hover:bg-green-700 transition-shadow shadow-md min-w-[387px] disabled:opacity-50 disabled:cursor-not-allowed"
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
            {loading ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex flex-col items-center justify-center text-gray-400 text-xl shadow-sm">
                <p>No products registered yet.</p>
                <p className="text-sm mt-2">Click "Register New Product" to get started</p>
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
                <button type="button" onClick={() => setIsRegisterOpen(false)} className="flex-1 h-[50px] bg-[#F3F4F6] text-gray-600 text-[15px] font-medium rounded-md hover:bg-gray-200 transition-colors" disabled={loading}>Cancel</button>
                <button type="submit" className="flex-1 h-[50px] bg-[#2563EB] text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors leading-tight px-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                  {loading ? 'Processing...' : 'Mint Product Passport'}
                </button>
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
                disabled={loading}
                className="flex-1 h-[55px] bg-gray-100 text-gray-700 text-[18px] font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button 
                onClick={handleTransfer}
                disabled={loading || selectedProductIds.length === 0}
                className="flex-1 h-[55px] bg-[#8EA5FF] text-white text-[18px] font-medium rounded-lg hover:bg-[#7a92f0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedProductIds.length > 0 ? '#8EA5FF' : undefined }}
              >
                <ArrowRightLeft size={20} /> 
                {loading ? 'Transferring...' : `转移 ${selectedProductIds.length} 个产品`}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Manufacturer;