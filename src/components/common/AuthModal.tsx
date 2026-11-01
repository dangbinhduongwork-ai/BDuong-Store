import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Check,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    loginWithSupabase, 
    registerWithSupabase, 
    resetPassword, 
    changePassword, 
    logout 
  } = useStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Change password states for logged in user
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Mật khẩu yếu (Cần ít nhất 6 ký tự)', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Mật khẩu trung bình (Nên thêm số hoặc chữ hoa)', color: 'bg-amber-500' };
    return { score: 3, label: 'Mật khẩu mạnh & an toàn', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const resetState = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Vui lòng nhập địa chỉ email hợp lệ (VD: ten@gmail.com)!');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        const res = await resetPassword(email);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg(res.message || 'Đã gửi liên kết khôi phục mật khẩu!');
        }
      } catch {
        setError('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Password validation for login & register
    if (!password || password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại!');
        return;
      }

      setLoading(true);
      try {
        const res = await registerWithSupabase(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          handleClose();
        }
      } catch {
        setError('Đã có lỗi xảy ra khi đăng ký tài khoản!');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode Login
    setLoading(true);
    try {
      const res = await loginWithSupabase(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
      }
    } catch {
      setError('Đã có lỗi xảy ra khi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(newPassword);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(res.message || 'Đổi mật khẩu thành công!');
        setNewPassword('');
        setConfirmNewPassword('');
        setIsChangingPass(false);
      }
    } catch {
      setError('Đã có lỗi xảy ra khi cập nhật mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent mx-auto flex items-center justify-center mb-3 shadow-sm">
            {user ? (
              <UserCheck className="w-6 h-6" strokeWidth={1.5} />
            ) : mode === 'forgot' ? (
              <KeyRound className="w-6 h-6" strokeWidth={1.5} />
            ) : (
              <Shield className="w-6 h-6" strokeWidth={1.5} />
            )}
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            {user 
              ? 'Tài Khoản Của Bạn' 
              : mode === 'register' 
              ? 'Tạo Tài Khoản Mới' 
              : mode === 'forgot' 
              ? 'Khôi Phục Mật Khẩu' 
              : 'Đăng Nhập'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {user 
              ? 'Quản lý thông tin bảo mật và đơn hàng đã mua' 
              : mode === 'register' 
              ? 'Kích hoạt tài khoản để bảo hành 1 đổi 1 và lưu đơn hàng' 
              : mode === 'forgot' 
              ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu bảo mật' 
              : 'Truy cập hệ thống quản trị và xem lịch sử bản quyền'}
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CASE 1: USER IS ALREADY LOGGED IN */}
        {user ? (
          <div className="space-y-4 text-xs">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent">
                      {user.role === 'admin' ? '👑 Quản Trị Viên (Admin)' : '👤 Khách Hàng (Customer)'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                      <Check className="w-3 h-3" />
                      Đã xác thực
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Collapsible Section */}
            <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPass(!isChangingPass);
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full p-3 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  <span>Đổi Mật Khẩu Tài Khoản</span>
                </span>
                <span className="text-accent text-[11px]">
                  {isChangingPass ? 'Đóng lại' : 'Mở form'}
                </span>
              </button>

              {isChangingPass && (
                <form onSubmit={handleChangePassword} className="p-4 space-y-3 border-t border-black/5 dark:border-white/5">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Mật khẩu mới (Tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black dark:hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl btn-accent font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span>{loading ? 'Đang cập nhật...' : 'Lưu Mật Khẩu Mới'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  await logout();
                  handleClose();
                }}
                className="w-full py-2.5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Đăng Xuất Khỏi Thiết Bị Này</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: AUTH FORMS (LOGIN / REGISTER / FORGOT) */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-medium ml-1">
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
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            {/* Password Field (Only for Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-gray-500 dark:text-gray-400 font-medium">
                    Mật Khẩu
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-accent hover:underline font-medium"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator (For Register) */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-1.5 h-1.5">
                      <span className={`flex-1 h-full rounded-full ${strength.score >= 1 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                      <span className={`flex-1 h-full rounded-full ${strength.score >= 2 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                      <span className={`flex-1 h-full rounded-full ${strength.score >= 3 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password Field (Only for Register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-medium ml-1">
                  Xác Nhận Mật Khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu ở trên"
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-accent font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-apple-card disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý an toàn...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'register' 
                      ? 'Tạo Tài Khoản An Toàn' 
                      : mode === 'forgot' 
                      ? 'Gửi Email Đặt Lại Mật Khẩu' 
                      : 'Đăng Nhập Ngay'}
                  </span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* Toggle Modes Links */}
            <div className="text-center pt-2 space-y-2">
              {mode === 'login' && (
                <p className="text-gray-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      resetState();
                    }}
                    className="text-accent font-semibold hover:underline"
                  >
                    Đăng ký tại đây
                  </button>
                </p>
              )}

              {mode === 'register' && (
                <p className="text-gray-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetState();
                    }}
                    className="text-accent font-semibold hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetState();
                  }}
                  className="text-accent font-semibold hover:underline inline-flex items-center space-x-1"
                >
                  <span>&larr; Quay lại Đăng Nhập</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
