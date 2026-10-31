import React, { useState } from 'react';
import { X, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithSupabase, registerWithSupabase, logout } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await registerWithSupabase(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      } else {
        const res = await loginWithSupabase(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl p-7 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent mx-auto flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight">
            {user ? 'Tài Khoản Của Bạn' : (isRegister ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user ? 'Bạn đang đăng nhập trong hệ thống' : 'Quản lý đơn hàng và nhận thông tin tài khoản tự động'}
          </p>
        </div>

        {/* If Already Logged In */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.email}</p>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent mt-0.5">
                      {user.role === 'admin' ? '👑 Quản Trị Viên' : '👤 Khách Hàng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        ) : (
          /* Real Auth Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-accent font-medium text-sm flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Đang xử lý...' : (isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập')}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-accent hover:underline font-medium"
              >
                {isRegister
                  ? 'Đã có tài khoản? Đăng nhập ngay'
                  : 'Chưa có tài khoản? Đăng ký tại đây'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
