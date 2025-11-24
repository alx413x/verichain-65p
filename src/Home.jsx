import React, { useState } from 'react';
import { Search, Wallet, AlertCircle } from 'lucide-react'; // 引入 AlertCircle 图标
import { useNavigate, Link } from 'react-router-dom';

// --- 1. 模拟区块链数据库 ---
const MOCK_DATABASE = [
  {
    sn: 'SN-111',
    model: 'Apple Watch Series 9',
    manufacturer: 'Apple Inc.',
    owner: '0x123456789abcdef',
    image: '⌚',
    warrantyStatus: 'Active',
    warrantyEnd: 'Dec 12, 2025',
    claimsLeft: '2/3',
    history: [
      { date: 'Sep 5, 2025', desc: 'Manufactured by Apple Inc.' },
      { date: 'Sep 15, 2025', desc: 'Transferred to authorized retailer' },
      { date: 'Sep 25, 2025', desc: 'Sold to owner 0x1234...def (Warranted)' },
      { date: 'Oct 5, 2025', desc: 'Served by Apple Authorized Service Center' },
    ]
  },
  {
    sn: 'SN-222',
    model: 'iPhone 16 Pro',
    manufacturer: 'Apple Inc.',
    owner: '0x987654321fedcba',
    image: '📱',
    warrantyStatus: 'Active',
    warrantyEnd: 'Nov 01, 2026',
    claimsLeft: '1/1',
    history: [
      { date: 'Oct 1, 2025', desc: 'Manufactured by Apple Inc.' },
      { date: 'Oct 10, 2025', desc: 'Sold to owner' },
    ]
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showError, setShowError] = useState(false); // 控制弹窗显示

  // --- 2. 搜索处理函数 ---
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // 在模拟数据库中查找
    const foundProduct = MOCK_DATABASE.find(
      item => item.sn.toLowerCase() === searchQuery.toLowerCase()
    );

    if (foundProduct) {
      // 如果找到了，跳转到 Passport 页面，并把数据传过去
      navigate('/passport', { state: { product: foundProduct } });
    } else {
      // 如果没找到，显示错误弹窗
      setShowError(true);
      
      // 3秒后自动消失
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  // 支持按回车键搜索
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-black relative overflow-x-hidden">
      
      {/* =================== 错误弹窗 (Popup) =================== */}
      {showError && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce-in">
          <div className="bg-red-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-[20px] font-bold">
            <AlertCircle size={30} className="text-white" />
            <div>
              <p>Product Not Found</p>
              <p className="text-sm font-normal opacity-90">No record found for "{searchQuery}" on blockchain.</p>
            </div>
          </div>
        </div>
      )}


      {/* ================= Hero Section ================= */}
      <main className="w-full min-h-[calc(100vh-100px)] bg-[#3170ED]/15 pt-20 pb-20 flex flex-col items-center">
        <div className="text-center max-w-6xl px-4 space-y-6 mb-12">
          <h1 className="text-[40px] lg:text-[60px] font-bold leading-tight">
            Verify Your Product Journey on Blockchain
          </h1>
          <p className="text-[24px] lg:text-[40px] font-medium text-black/50 leading-tight max-w-5xl mx-auto">
            Track complete provenance, ownership history, and warranty status with full transparency
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-[633px] h-[63px] mb-16 px-4">
          <div className="w-full h-full bg-white rounded-full shadow-sm flex items-center px-6 gap-4 border border-black/5 hover:shadow-md transition-shadow">
            
            {/* 点击图标也可以搜索 */}
            <Search className="text-black w-6 h-6 cursor-pointer" onClick={handleSearch}/>
            
            <input 
              type="text" 
              placeholder="Search Serial Number (Try: SN-111)" 
              className="flex-1 h-full outline-none text-[18px] text-gray-600 placeholder-gray-400 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} // 绑定回车键
            />

            {/* 清空按钮 */}
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black">
                x
              </button>
            )}
          </div>
        </div>

        <div className="text-center mb-8 px-4">
          <p className="text-[14px] font-bold text-black">
            Explore User Journey Learn how to verify and manage your products on our platform
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[44px] gap-y-[40px] max-w-6xl px-4">
          <DashboardCard title="Retailer Portal" desc="Manage your product inventory and sales" onClick={() => navigate('/retailer')}/>
          <DashboardCard title="User Dashboard" desc="Manage your product ownership" onClick={() => navigate('/user')}/>
          <DashboardCard title="Manufacturer Portal" desc="Register and manage products" onClick={() => navigate('/manufacturer')}/>
          <DashboardCard title="Service Center" desc="Process warranty claims" onClick={() => navigate('/service')}/>
        </div>
      </main>
    </div>
  );
};

// 更新后的 Card 组件，支持 onClick 跳转
const DashboardCard = ({ title, desc, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-full md:w-[539px] h-[139px] bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex flex-col justify-center px-8 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
    >
      <h3 className="text-[25px] font-bold text-black mb-1">{title}</h3>
      <p className="text-[15px] font-medium text-black/70">{desc}</p>
    </div>
  );
};

export default Home;