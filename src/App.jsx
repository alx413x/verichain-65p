import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { ContractsProvider, useContracts } from './contexts/ContractsContext';
import { ToastProvider } from './contexts/ToastContext';

// 引入各个页面组件
import Home from './Home';
import Manufacturer from './Manufacturer';
import ServiceCenter from './ServiceCenter'; 
import Retailer from './Retailer';
import User from './User';
import ProductPassport from './ProductPassport';
import ConnectedDashboard from './ConnectedDashboard';

// ======================= 1. 统一导航栏组件 =======================
const NavigationBar = () => {
  const { isConnected, account, connect } = useContracts();
  const location = useLocation();
  const path = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 格式化钱包地址显示
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 处理钱包连接
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
    }
  };

  // 处理断开连接
  const handleDisconnect = () => {
    window.location.reload();
  };

  // 导航链接组件
  const NavLink = ({ to, children }) => {
    const isActive = to === '/' ? path === to : path.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`text-[25px] font-medium transition-colors ${
          isActive ? 'text-[#0C86DE] border-b-2 border-[#0C86DE]' : 'text-black hover:text-[#0C86DE]'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="w-full h-[100px] border-b border-black/10 bg-[#F9FAFB] px-8 lg:px-16 sticky top-0 z-50 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <img src="/vite.svg" alt="VeriChain Logo" className="h-16 w-auto" />
        <span className="text-[32px] lg:text-[40px] font-medium leading-tight hidden sm:block">
          VeriChain Passport
        </span>
      </div>

      {/* Desktop Menu - Removed isConnected check so links are always visible */}
      <div className="hidden xl:flex items-center gap-10">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/user">User</NavLink>
        <NavLink to="/retailer">Retailer</NavLink>
        <NavLink to="/manufacturer">Manufacturer</NavLink>
        <NavLink to="/service">Service Center</NavLink>
      </div>

      {/* Wallet Action Area */}
      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-[20px] py-2 px-4 shadow-sm">
            <Wallet size={24} className="text-[#0C86DE]" />
            <span className="text-[18px] font-mono font-medium text-gray-800 hidden md:block">
              {formatAddress(account)}
            </span>
            <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
            <button 
              onClick={handleDisconnect}
              className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
              title="Disconnect"
            >
              <LogOut size={20} />
              <span className="text-[16px] font-bold hidden md:block">Exit</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConnect}
            className="bg-[#0C86DE] text-white px-6 py-3 rounded-[20px] text-[20px] font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
          >
            <Wallet size={24} />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button className="xl:hidden text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
           {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown - Removed isConnected check */}
      {isMobileMenuOpen && (
        <div className="absolute top-[100px] left-0 w-full bg-white shadow-lg flex flex-col p-4 gap-4 xl:hidden border-b border-gray-200">
          <Link to="/" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/user" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>User</Link>
          <Link to="/retailer" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Retailer</Link>
          <Link to="/manufacturer" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Manufacturer</Link>
          <Link to="/service" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Service Center</Link>
        </div>
      )}
    </nav>
  );
};

// ======================= 2. 主要应用逻辑 =======================
const AppContent = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ConnectedDashboard />} />
        <Route path="/user" element={<User />} />
        <Route path="/retailer" element={<Retailer />} />
        <Route path="/manufacturer" element={<Manufacturer />} />
        <Route path="/service" element={<ServiceCenter />} />
        <Route path="/passport" element={<ProductPassport />} />
      </Routes>
    </div>
  );
};

// ======================= 3. 根组件 =======================
function App() {
  return (
    <BrowserRouter>
      <ContractsProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ContractsProvider>
    </BrowserRouter>
  );
}

export default App;