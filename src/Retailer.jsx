import React, { useState } from 'react';
import { Wallet, Plus, ShoppingCart, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Retailer = () => {
  // --- 辅助函数：获取今天的日期 (YYYY-MM-DD) ---
  const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- 1. 初始数据 ---
  const [inventory, setInventory] = useState([
    {
      id: 1,
      serialNumber: 'SN-111',
      model: 'Apple Watch Series 9',
      status: 'In Stock',
      addedDate: '2025-10-15',
      soldDate: '-',
      customerAddress: '-'
    },
    {
      id: 2,
      serialNumber: 'SN-222',
      model: 'iPhone 16 Pro',
      status: 'Sold',
      addedDate: '2025-10-01',
      soldDate: '2025-11-01',
      customerAddress: '0x1234...5678'
    }
  ]);

  // --- 2. 弹窗状态 ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- 3. 表单数据 (都包含日期字段，默认为今天) ---
  const [registerForm, setRegisterForm] = useState({ 
    serialNumber: '', 
    model: '',
    addedDate: getTodayString() // 默认今天
  });

  const [sellForm, setSellForm] = useState({ 
    serialNumber: '', 
    customerAddress: '',
    addDate: getTodayString() // 默认今天
  });

  // --- 4. 逻辑处理 ---

  const triggerSuccessPopup = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); }, 3000);
  };
  
  // 进货逻辑 (Add Inventory)
  const handleRegister = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      serialNumber: registerForm.serialNumber,
      model: registerForm.model,
      status: 'In Stock',
      addedDate: registerForm.addedDate, // 使用表单中的日期
      soldDate: '-',
      customerAddress: '-'
    };
    setInventory([...inventory, newItem]);
    // 重置表单 (日期重置为今天)
    setRegisterForm({ serialNumber: '', model: '', addedDate: getTodayString() });
    setIsRegisterOpen(false);
    triggerSuccessPopup('Add success!!');
  };

  // 销售逻辑 (Register Sale)
  const handleSell = (e) => {
    e.preventDefault();
    const updatedInventory = inventory.map(item => {
      if (item.serialNumber === sellForm.serialNumber) {
        return {
          ...item,
          status: 'Sold',
          soldDate: sellForm.addDate, // 使用表单中的日期
          customerAddress: sellForm.customerAddress
        };
      }
      return item;
    });
    setInventory(updatedInventory);
    // 重置表单 (日期重置为今天)
    setSellForm({ serialNumber: '', customerAddress: '', addDate: getTodayString() });
    setIsSellOpen(false);
    triggerSuccessPopup('Sold success!!');
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
      <main className="max-w-[1512px] mx-auto px-8 lg:px-[47px] pt-12 pb-20">
        
        {/* Title */}
        <div className="ml-[83px] mb-8">
          <h1 className="text-[40px] font-bold mb-2">Retailer Portal</h1>
          <p className="text-[25px] font-medium text-black/70">Manage your product inventory and sales</p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-wrap gap-8 justify-center lg:justify-start lg:ml-[83px] mb-16">
          <div onClick={() => setIsRegisterOpen(true)} className="w-[678px] h-[190px] bg-white shadow-md rounded-lg flex flex-col justify-center px-[75px] gap-2 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group">
            <h2 className="text-[40px] font-bold group-hover:text-[#0C86DE] transition-colors flex items-center gap-4"><Plus size={40} /> Register Product</h2>
            <p className="text-[25px] font-medium text-black/70">Add new product to inventory</p>
          </div>

          <div onClick={() => setIsSellOpen(true)} className="w-[678px] h-[190px] bg-white shadow-md rounded-lg flex flex-col justify-center px-[75px] gap-2 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group">
            <h2 className="text-[40px] font-bold group-hover:text-green-600 transition-colors flex items-center gap-4"><ShoppingCart size={40} /> Sell Product</h2>
            <p className="text-[25px] font-medium text-black/70">Transfer ownership to customer</p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="w-full px-8 lg:px-[83px]">
          <h3 className="text-[40px] font-bold mb-6">Product Inventory</h3>
          <div className="bg-white w-full h-[93px] flex items-center shadow-sm mb-4 rounded-t-lg px-8">
            <div className="w-[15%] text-[25px] font-bold">Serial Number</div>
            <div className="w-[20%] text-[25px] font-bold text-center">Model</div>
            <div className="w-[15%] text-[25px] font-bold text-center">Status</div>
            <div className="w-[15%] text-[25px] font-bold text-center">Added Date</div>
            <div className="w-[15%] text-[25px] font-bold text-center">Sold Date</div>
            <div className="w-[20%] text-[25px] font-bold text-center">Customer Address</div>
          </div>

          <div className="flex flex-col gap-4">
            {inventory.map((item) => (
              <div key={item.id} className="bg-white w-full h-[93px] flex items-center shadow-sm rounded-lg px-8 hover:shadow-md transition-shadow">
                <div className="w-[15%] text-[25px] font-normal">{item.serialNumber}</div>
                <div className="w-[20%] text-[25px] font-normal text-center">{item.model}</div>
                <div className="w-[15%] flex justify-center">
                  <span className={`px-4 py-1 rounded-full text-[20px] font-bold border ${item.status === 'In Stock' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="w-[15%] text-[25px] font-normal text-center">{item.addedDate}</div>
                <div className="w-[15%] text-[25px] font-normal text-center text-gray-500">{item.soldDate}</div>
                <div className="w-[20%] text-[25px] font-normal text-center text-gray-500 truncate px-2">{item.customerAddress}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ================= Modal 1: Add Inventory (Added Date Field) ================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl p-8 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[30px] font-bold">Add to Inventory</h2>
              <button onClick={() => setIsRegisterOpen(false)}><X size={30} className="text-gray-400 hover:text-black"/></button>
            </div>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-[20px] font-bold mb-2">Serial Number</label>
                <input type="text" required className="w-full h-[50px] px-4 border rounded-lg text-[20px]" 
                  value={registerForm.serialNumber}
                  onChange={(e) => setRegisterForm({...registerForm, serialNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[20px] font-bold mb-2">Model Name</label>
                <input type="text" required className="w-full h-[50px] px-4 border rounded-lg text-[20px]" 
                   value={registerForm.model}
                   onChange={(e) => setRegisterForm({...registerForm, model: e.target.value})}
                />
              </div>
              {/* 新增：Added Date */}
              <div>
                <label className="block text-[20px] font-bold mb-2">Added Date</label>
                <input 
                   type="date" 
                   required 
                   className="w-full h-[50px] px-4 border rounded-lg text-[20px]" 
                   value={registerForm.addedDate}
                   onChange={(e) => setRegisterForm({...registerForm, addedDate: e.target.value})}
                />
              </div>
              <button type="submit" className="mt-4 w-full h-[60px] bg-[#0C86DE] text-white text-[25px] font-bold rounded-lg hover:bg-blue-600">Confirm Add</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= Modal 2: Register Sale (Editable Date) ================= */}
      {isSellOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl p-8 animate-scale-up">
            <h2 className="text-[24px] font-bold text-[#111827] mb-6">Register New Product</h2>

            <form onSubmit={handleSell} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-gray-600">Serial Number</label>
                <input type="text" required className="w-full h-[45px] px-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={sellForm.serialNumber}
                  onChange={(e) => setSellForm({...sellForm, serialNumber: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-gray-600">Customer Address</label>
                <input type="text" required placeholder="0x..." className="w-full h-[45px] px-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={sellForm.customerAddress}
                  onChange={(e) => setSellForm({...sellForm, customerAddress: e.target.value})}
                />
              </div>

              {/* ADD Date - 默认今天，但可编辑 */}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-gray-600">ADD Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full h-[45px] px-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={sellForm.addDate}
                  onChange={(e) => setSellForm({...sellForm, addDate: e.target.value})}
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setIsSellOpen(false)} className="flex-1 h-[45px] bg-[#F3F4F6] text-[#374151] text-[16px] font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-[45px] bg-[#2563EB] text-white text-[16px] font-medium rounded-lg hover:bg-blue-700 transition-colors">Register Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Retailer;