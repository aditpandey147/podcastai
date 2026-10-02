import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#020713] border-b border-[#10294a] sticky top-0 z-30">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-[#edf4ff]">
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <span className="hidden sm:inline-block w-1 h-1 bg-[#10294a] rounded-full"></span>
            <span className="hidden sm:inline-block text-xs text-[#8198b6]">{currentTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#0a1a32] transition-colors"
              >
                <div className="w-7 h-7 bg-[#6b38ed] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <i className={`fa-solid fa-chevron-down text-[#9ab0cc] text-[10px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#05152b] rounded-xl border border-[#173b67] shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#102b4c]">
                    <p className="text-sm font-medium text-[#edf4ff] truncate">{user?.name}</p>
                    <p className="text-xs text-[#8198b6] truncate mt-0.5">{user?.email}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5 ${
                      user?.planName && user?.planName !== 'Free' 
                        ? 'bg-[#6b38ed]/25 text-[#a080ff] border border-[#6b38ed]/40' 
                        : 'bg-[#64748b]/25 text-[#cbd5e1] border border-[#64748b]/40'
                    }`}>
                      {user?.planName || 'Free'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#b7c9df] hover:bg-[#0a1a32] hover:text-[#edf4ff] transition-colors"
                    >
                      <i className="fa-solid fa-gear text-[#9ab0cc] text-xs w-4"></i>
                      Settings
                    </button>
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => { navigate('/admin/dashboard'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#b7c9df] hover:bg-[#0a1a32] hover:text-[#edf4ff] transition-colors"
                      >
                        <i className="fa-solid fa-shield text-red-400 text-xs w-4"></i>
                        Admin Panel
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#102b4c] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f87171] hover:text-red-400 hover:bg-[#3b0d0d] transition-colors"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4"></i>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;