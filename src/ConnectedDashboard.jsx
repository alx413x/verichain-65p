import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Store, Factory, Wrench, Shield, CheckCircle } from 'lucide-react';

const ConnectedDashboard = () => {
  const navigate = useNavigate();
  
  // 角色卡片数据，用于快速跳转到各角色页面
  const roles = [
    { title: 'User Passport Manager', description: 'View, register, and manage your owned products and warranties.', icon: <UserIcon size={40} />, path: '/user', color: 'border-blue-500' },
    { title: 'Retailer Inventory', description: 'Manage inventory, record sales, and transfer products to customers.', icon: <Store size={40} />, path: '/retailer', color: 'border-green-500' },
    { title: 'Manufacturer Portal', description: 'Mint new product passports and track product lifecycles.', icon: <Factory size={40} />, path: '/manufacturer', color: 'border-yellow-500' },
    { title: 'Service Center Claims', description: 'Review, approve, or reject warranty and service claims.', icon: <Wrench size={40} />, path: '/service', color: 'border-red-500' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-[#F9FAFB] font-sans text-black relative">
      <main className="max-w-7xl mx-auto px-8 py-12">
        
        <div className="text-center mb-12 bg-white p-8 rounded-2xl shadow-lg border-t-8 border-[#0C86DE]">
          <CheckCircle size={60} className="text-[#0C86DE] mx-auto mb-4" />
          <h1 className="text-[40px] font-bold text-gray-800 mb-2">Wallet Connected Successfully!</h1>
          <p className="text-[25px] font-medium text-gray-700">请选择您当前想要操作的门户角色：</p>
        </div>

        {/* 角色卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div 
              key={role.path}
              onClick={() => navigate(role.path)}
              className={`bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer border-t-8 ${role.color}`}
            >
              <div className="text-[#0C86DE] mb-4">{role.icon}</div>
              <h2 className="text-[30px] font-bold mb-2 text-gray-900">{role.title}</h2>
              <p className="text-[18px] text-gray-500 mb-4">{role.description}</p>
              <button 
                className="mt-4 text-[#0C86DE] font-bold flex items-center gap-1 text-[20px] hover:underline"
              >
                进入门户 →
              </button>
            </div>
          ))}
          
          {/* 添加一个返回首页搜索的卡片 */}
          <div 
            onClick={() => navigate('/')}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer border-t-8 border-gray-400 lg:col-span-2 flex items-center justify-center"
          >
            <Shield size={30} className="text-gray-600 mr-4" />
            <h2 className="text-[25px] font-bold text-gray-700">公共产品信息查询（Public Search）</h2>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ConnectedDashboard;