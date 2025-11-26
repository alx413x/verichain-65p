import React, { useState } from 'react';
import { Search, Wallet, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useContracts } from './contexts/ContractsContext';

const Home = () => {
  const navigate = useNavigate();
  const { productRegistry } = useContracts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showError, setShowError] = useState(false);
  const [searching, setSearching] = useState(false);

  // --- Search handler with blockchain integration ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    if (!productRegistry) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setSearching(true);
      
      // Try to get product from blockchain
      const productDetails = await productRegistry.getProductDetails(searchQuery.trim());
      
      // Load icon from localStorage
      const iconMap = JSON.parse(localStorage.getItem('productIcons') || '{}');
      const productIcon = iconMap[searchQuery.trim()] || '📦';
      
      // Calculate warranty status
      const now = Math.floor(Date.now() / 1000);
      const warrantyExpiration = Number(productDetails.warranty.expiration);
      const warrantyStartDate = Number(productDetails.warranty.startDate);
      const isExpired = warrantyExpiration > 0 && now > warrantyExpiration;
      const hasWarranty = warrantyStartDate > 0;
      
      // Calculate claims
      const maxClaims = Number(productDetails.warranty.maxCount) || 0;
      const usedClaims = Number(productDetails.warranty.claimCount) || 0;
      const claimsRemaining = maxClaims - usedClaims;
      
      // If product exists, navigate to passport page
      if (productDetails && productDetails.exists) {
        navigate('/passport', { 
          state: { 
            product: {
              sn: searchQuery.trim(),
              serialNumber: searchQuery.trim(),
              model: productDetails.model,
              manufacturer: productDetails.manufacturer,
              owner: productDetails.owner,
              image: productIcon,
              warrantyStatus: hasWarranty ? (isExpired ? 'Expired' : 'Active') : 'No Warranty',
              warrantyEnd: warrantyExpiration > 0 ? new Date(warrantyExpiration * 1000).toLocaleDateString() : 'N/A',
              claimsLeft: hasWarranty ? `${claimsRemaining}/${maxClaims}` : 'N/A',
              history: [
                {
                  date: new Date(Number(productDetails.timestamp) * 1000).toLocaleDateString(),
                  desc: 'Product Registered'
                },
                ...(hasWarranty ? [{
                  date: new Date(warrantyStartDate * 1000).toLocaleDateString(),
                  desc: 'Warranty Activated'
                }] : [])
              ]
            }
          } 
        });
      } else {
        showNotFoundError();
      }
      setSearching(false);
    } catch (err) {
      console.error('Search error:', err);
      showNotFoundError();
      setSearching(false);
    }
  };

  const showNotFoundError = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  // Support Enter key for search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !searching) {
      handleSearch();
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-black relative overflow-x-hidden">
      
      {/* =================== Error Popup =================== */}
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
            
            {/* Click icon to search */}
            <Search className="text-black w-6 h-6 cursor-pointer" onClick={handleSearch}/>
            
            <input 
              type="text" 
              placeholder="Search Serial Number (e.g., PHONE-001)" 
              className="flex-1 h-full outline-none text-[18px] text-gray-600 placeholder-gray-400 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={searching}
            />

            {/* Clear button */}
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black">
                x
              </button>
            )}
            
            {searching && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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