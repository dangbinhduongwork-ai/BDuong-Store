import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Shield, 
  User, 
  Layers, 
  CheckCircle2,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AuthModal } from '../common/AuthModal';

interface NavbarProps {
  currentView: 'home' | 'orders' | 'admin';
  setCurrentView: (view: 'home' | 'orders' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, settings, isDarkMode, toggleDarkMode, orders, logout } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Orders count for badge
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Store Name */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div 
              className="w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: 'var(--accent-color, #0071E3)' }}
            >
              <Layers className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {settings.store_name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={2} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-normal -mt-0.5 tracking-wide">
                Digital License & Auto Deliver
              </p>
            </div>
          </div>

          {/* Right Controls - Grouped right next to Account */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Orders Button - Next to Account */}
            <button
              onClick={() => setCurrentView('orders')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                currentView === 'orders'
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5'
              }`}
              title="Đơn Hàng Của Tôi"
            >
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Đơn Hàng</span>
              {completedOrdersCount > 0 && (
                <span 
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm ${
                    currentView === 'orders' ? 'bg-white text-accent' : 'text-white'
                  }`}
                  style={currentView === 'orders' ? {} : { backgroundColor: 'var(--accent-color, #0071E3)' }}
                >
                  {completedOrdersCount}
                </span>
              )}
            </button>

            {/* Minimized Admin Dashboard Button (Only visible to admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 border ${
                  currentView === 'admin'
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'border-accent/30 bg-accent-subtle text-accent hover:bg-accent/20'
                }`}
                title="Trang Quản Trị Hệ Thống"
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="hidden sm:inline">Quản Trị</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors"
              title={isDarkMode ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
              )}
            </button>

            {/* Auth / Profile Button */}
            {user ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-subtle text-accent hover:bg-accent/20 transition-all text-xs font-semibold"
                >
                  <div 
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--accent-color, #0071E3)' }}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:inline">
                    {user.email}
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-gray-400 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full btn-accent font-semibold text-xs shadow-sm"
              >
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-black/5 dark:border-white/5 px-2 bg-white/70 dark:bg-black/70 backdrop-blur-md">
          <button
            onClick={() => setCurrentView('home')}
            className={`text-xs font-medium py-1.5 px-3 rounded-full transition-all ${
              currentView === 'home' ? 'bg-accent text-white font-semibold' : 'text-gray-500'
            }`}
          >
            Cửa Hàng
          </button>
          <button
            onClick={() => setCurrentView('orders')}
            className={`text-xs font-medium py-1.5 px-3 rounded-full flex items-center space-x-1 transition-all ${
              currentView === 'orders' ? 'bg-accent text-white font-semibold' : 'text-gray-500'
            }`}
          >
            <span>Đơn Hàng</span>
            {completedOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {completedOrdersCount}
              </span>
            )}
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`text-xs font-medium py-1.5 px-3 rounded-full flex items-center space-x-1 transition-all ${
                currentView === 'admin' ? 'bg-accent text-white font-semibold' : 'text-accent'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Quản Trị</span>
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
