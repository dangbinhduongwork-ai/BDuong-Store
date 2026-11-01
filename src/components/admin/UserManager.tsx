import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatDate } from '../../lib/utils';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Search, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  ShoppingBag, 
  Check, 
  Calendar,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

export const UserManager: React.FC = () => {
  const { users, fetchUsers, updateUserRole, deleteUser, orders, user: currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successAction, setSuccessAction] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, email: string) => {
    const isCurrent = currentUser?.id === userId;
    if (isCurrent && newRole === 'customer') {
      if (!window.confirm('⚠️ CẢNH BÁO: Bạn đang hạ quyền Quản Trị của chính tài khoản mình đang đăng nhập! Bạn có chắc chắn muốn tiếp tục?')) {
        return;
      }
    }

    setLoading(true);
    const ok = await updateUserRole(userId, newRole);
    setLoading(false);
    if (ok) {
      setSuccessAction(`Đã cập nhật quyền của "${email}" thành ${newRole === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'}!`);
      setTimeout(() => setSuccessAction(null), 3000);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (currentUser?.id === userId) {
      alert('Bạn không thể xóa tài khoản hiện tại đang đăng nhập!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}" khỏi hệ thống?`)) {
      setLoading(true);
      const ok = await deleteUser(userId);
      setLoading(false);
      if (ok) {
        setSuccessAction(`Đã xóa tài khoản "${email}"!`);
        setTimeout(() => setSuccessAction(null), 3000);
      }
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) =>
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  // Helper count orders by user
  const getUserOrdersCount = (userEmail: string, userId: string) => {
    return orders.filter(
      (o) => o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail.toLowerCase())
    ).length;
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Action Notification */}
      {successAction && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successAction}</span>
        </div>
      )}

      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Quản Lý Người Dùng & Phân Quyền ({users.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Xem toàn bộ tài khoản đăng ký, nâng cấp Admin hoặc kiểm tra số đơn hàng đã mua.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-700 dark:text-gray-300 transition-colors shrink-0"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Tổng Tài Khoản</span>
          <p className="text-xl font-bold mt-0.5 text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-semibold block flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Quản Trị Viên</span>
          </span>
          <p className="text-xl font-bold mt-0.5 text-purple-700 dark:text-purple-300">{adminCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
          <span className="text-[10px] text-accent uppercase font-semibold block flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span>Khách Hàng</span>
          </span>
          <p className="text-xl font-bold mt-0.5 text-accent">{customerCount}</p>
        </div>
      </div>

      {/* Users List Table / Cards */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-black/5 dark:border-white/10 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isAdmin = u.role === 'admin';
            const isSelf = currentUser?.id === u.id;
            const ordersCount = getUserOrdersCount(u.email, u.id);

            return (
              <div
                key={u.id}
                className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-apple-sm hover:shadow-apple-card transition-all"
              >
                {/* User Info */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-accent'}`}>
                    {u.email ? u.email.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {u.email}
                      </p>
                      {isSelf && (
                        <span className="text-[9px] bg-accent/20 text-accent font-bold px-1.5 py-0.5 rounded-full">
                          Bạn (Tôi)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        isAdmin 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                          : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                      }`}>
                        {isAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{isAdmin ? 'Quản Trị Viên' : 'Khách Hàng'}</span>
                      </span>

                      {u.created_at && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>Tham gia: {formatDate(u.created_at)}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Đã đặt: <strong className="text-accent">{ordersCount}</strong> đơn</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher & Delete Action */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                  {isAdmin ? (
                    <button
                      onClick={() => handleRoleChange(u.id, 'customer', u.email)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 transition-colors text-[11px] font-semibold flex items-center space-x-1"
                      title="Chuyển tài khoản này thành Khách Hàng thường"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Hạ thành Khách</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(u.id, 'admin', u.email)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors text-[11px] font-semibold flex items-center space-x-1 shadow-sm"
                      title="Cấp quyền Quản Trị Viên (Admin) cho tài khoản này"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Nâng lên Admin</span>
                    </button>
                  )}

                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      disabled={loading}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Xóa tài khoản này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
