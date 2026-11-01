import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Shield, 
  User, 
  Layers, 
  CheckCircle2, 
  LogOut, 
  ShoppingBag,
  Home,
  Headphones
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

  // Orders count for badge (ONLY completed orders belonging to this user)
  const myCompletedOrdersCount = React.useMemo(() => {
    if (user) {
      const userEmail = (user.email || '').toLowerCase().trim();
      return orders.filter(
        (o) =>
          o.status === 'completed' &&
          ((o.user_id && o.user_id === user.id) ||
            (o.customer_email && o.customer_email.toLowerCase().trim() === userEmail))
      ).length;
    }
    try {
      const localCodes: string[] = JSON.parse(localStorage.getItem('bduong_my_order_codes') || '[]');
      if (localCodes.length > 0) {
        return orders.filter((o) => o.status === 'completed' && localCodes.includes(o.order_code)).length;
      }
    } catch {
      // fallback
    }
    return 0;
  }, [orders, user]);

  const handleOpenSupport = () => {
    window.dispatchEvent(new CustomEvent('open-support'));
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Store Name */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none shrink-0"
          >
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: 'var(--accent-color, #0071E3)' }}
            >
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm sm:text-lg tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {settings.store_name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" strokeWidth={2} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-normal -mt-0.5 tracking-wide hidden xs:block sm:block">
                Digital License & Auto Deliver
              </p>
            </div>
          </div>

          {/* Desktop Right Controls (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Orders Button */}
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
              {myCompletedOrdersCount > 0 && (
                <span 
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm ${
                    currentView === 'orders' ? 'bg-white text-accent' : 'text-white'
                  }`}
                  style={currentView === 'orders' ? {} : { backgroundColor: 'var(--accent-color, #0071E3)' }}
                >
                  {myCompletedOrdersCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard Button (Only visible to admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 border ${
                  currentView === 'admin'
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'border-accent/30 bg-accent-subtle text-accent hover:bg-accent/20'
                }`}
                title="Trang Quản Trị Hệ Thống"
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Quản Trị</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors"
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
                  <span className="max-w-[120px] truncate">
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

          {/* Mobile Right Controls: Theme Toggle & Avatar/Login */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors"
              title="Đổi giao diện Sáng / Tối"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
              ) : (
                <Moon className="w-3.5 h-3.5 text-gray-600" strokeWidth={1.5} />
              )}
            </button>

            {user ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold"
              >
                <div 
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: 'var(--accent-color, #0071E3)' }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate text-[11px]">
                  {user.email.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1 px-3 py-1 rounded-full btn-accent font-semibold text-xs shadow-sm"
              >
                <User className="w-3 h-3" strokeWidth={1.5} />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Floating iOS Bottom Glass Dock for Mobile Devices */}
      <div className="fixed bottom-3 inset-x-3 max-w-sm mx-auto z-40 md:hidden pb-safe">
        <div className="glass-modal rounded-full p-1.5 shadow-2xl flex items-center justify-around border border-black/10 dark:border-white/10 backdrop-blur-2xl">
          {/* Store / Home Tab */}
          <button
            onClick={() => setCurrentView('home')}
            className={`flex-1 py-1.5 px-2 rounded-full flex flex-col items-center justify-center transition-all ${
              currentView === 'home'
                ? 'bg-accent text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" strokeWidth={currentView === 'home' ? 2 : 1.5} />
            <span className="text-[10px]">Cửa Hàng</span>
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => setCurrentView('orders')}
            className={`flex-1 py-1.5 px-2 rounded-full flex flex-col items-center justify-center relative transition-all ${
              currentView === 'orders'
                ? 'bg-accent text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 mb-0.5" strokeWidth={currentView === 'orders' ? 2 : 1.5} />
              {myCompletedOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                  {myCompletedOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Đơn Hàng</span>
          </button>

          {/* Admin Tab (If Admin) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex-1 py-1.5 px-2 rounded-full flex flex-col items-center justify-center transition-all ${
                currentView === 'admin'
                  ? 'bg-accent text-white shadow-sm font-semibold'
                  : 'text-accent font-medium'
              }`}
            >
              <Shield className="w-4 h-4 mb-0.5" strokeWidth={currentView === 'admin' ? 2 : 1.5} />
              <span className="text-[10px]">Quản Trị</span>
            </button>
          )}

          {/* Support Tab */}
          <button
            onClick={handleOpenSupport}
            className="flex-1 py-1.5 px-2 rounded-full flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all"
          >
            <Headphones className="w-4 h-4 mb-0.5" strokeWidth={1.5} />
            <span className="text-[10px]">Hỗ Trợ</span>
          </button>

          {/* Account / Profile Tab */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex-1 py-1.5 px-2 rounded-full flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all"
          >
            <User className="w-4 h-4 mb-0.5" strokeWidth={1.5} />
            <span className="text-[10px]">{user ? 'Tôi' : 'Tài Khoản'}</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
