import React, { useState } from 'react';
import { Wallet, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCenter = () => {
  // --- 1. 模拟数据状态 ---
  const [claims, setClaims] = useState([
    {
      id: 1,
      serialNumber: 'SN-111',
      address: '0x1234...5678',
      status: 'Pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      serialNumber: 'SN-222',
      address: '0x8888...9999',
      status: 'Pending',
      date: '2024-11-20'
    }
  ]);

  // --- 2. 处理操作 ---
  const handleStatusChange = (id, newStatus) => {
    setClaims(claims.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-sans text-black relative overflow-x-hidden">

      {/* ================= Main Content ================= */}
      <main className="max-w-[1512px] mx-auto px-8 lg:px-[137px] pt-12 pb-20">
        
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[40px] font-bold mb-2">Service Center Portal</h1>
          <p className="text-[25px] font-medium text-black/70">Review and process warranty claims</p>
        </div>

        {/* Section Header */}
        <div className="mb-6 pl-4 border-l-4 border-[#0C86DE]">
          <h2 className="text-[40px] font-bold text-black">Pending Warranty Claims</h2>
        </div>

        {/* ================= Claims Table ================= */}
        <div className="w-full">
          <div className="bg-white w-full h-[93px] flex items-center px-8 lg:px-[50px] shadow-sm mb-4 rounded-t-lg border-b border-gray-100">
            <div className="w-1/5 text-[25px] font-bold text-black">Product S/N</div>
            <div className="w-1/4 text-[25px] font-bold text-black text-center">Customer Address</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Status</div>
            <div className="w-1/6 text-[25px] font-bold text-black text-center">Date</div>
            <div className="w-1/5 text-[25px] font-bold text-black text-right pr-8">Actions</div>
          </div>

          <div className="flex flex-col gap-4">
            {claims.length === 0 ? (
              <div className="w-full h-[200px] bg-white rounded-lg flex items-center justify-center text-gray-400 text-xl shadow-sm">
                No pending claims.
              </div>
            ) : (
              claims.map((item) => (
                <div key={item.id} className="bg-white w-full h-[126px] flex items-center px-8 lg:px-[50px] shadow-sm rounded-lg animate-fade-in hover:shadow-md transition-shadow">
                  <div className="w-1/5 text-[25px] font-normal text-black">{item.serialNumber}</div>
                  <div className="w-1/4 text-[25px] font-normal text-black text-center font-mono text-gray-600">{item.address}</div>
                  <div className="w-1/6 flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-[20px] font-bold border ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      item.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-1/6 text-[25px] font-normal text-black text-center">{item.date}</div>
                  <div className="w-1/5 flex justify-end gap-4 pr-4">
                    {item.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleStatusChange(item.id, 'Rejected')} className="w-[50px] h-[50px] rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"><X size={30} /></button>
                        <button onClick={() => handleStatusChange(item.id, 'Approved')} className="w-[50px] h-[50px] rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"><Check size={30} /></button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-[18px] font-medium italic">Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceCenter;