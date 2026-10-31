import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatVND } from '../../lib/utils';
import { DynamicIcon } from '../common/DynamicIcon';
import { Plus, Edit2, Trash2, Check, X, Sparkles } from 'lucide-react';

const COMMON_ICONS = [
  'Youtube',
  'PlaySquare',
  'Sparkles',
  'Cpu',
  'GraduationCap',
  'Zap',
  'ShieldCheck',
  'Key',
  'Tv',
  'Bot',
  'Music',
  'Cloud',
  'CreditCard',
];

export const ProductManager: React.FC = () => {
  const { products, saveProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      category: 'entertainment',
      price: 29000,
      duration: '1 Tháng',
      description: '',
      warranty_policy: 'Bảo hành 1 đổi 1 suốt thời gian sử dụng.',
      icon_name: 'Sparkles',
      stock_data: [],
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Danh Sách Sản Phẩm Số ({products.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Quản lý tên, danh mục, thời hạn gói, giá bán và cấu hình icon.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl btn-accent font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Product Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                  <DynamicIcon name={product.icon_name} size={20} strokeWidth={1.5} />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                {product.category}
              </span>
              <h4 className="font-semibold text-sm mt-1 text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Gói: {product.duration}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-accent text-sm">
                {formatVND(product.price)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                Kho: <strong>{product.stock_data?.length || 0}</strong> tài khoản
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
              <h3 className="font-bold text-base">
                {editingProduct.id ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">Tên Sản Phẩm</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Danh Mục</label>
                  <select
                    value={editingProduct.category || 'entertainment'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="entertainment">Giải Trí (YouTube)</option>
                    <option value="ai">Tài Khoản AI</option>
                    <option value="course">Khóa Học</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Thời Hạn Gói</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.duration || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, duration: e.target.value })}
                    placeholder="VD: 1 Tháng, 1 Năm"
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Giá Bán (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Tên Icon Lucide</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingProduct.icon_name || 'Sparkles'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, icon_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                      <DynamicIcon name={editingProduct.icon_name || 'Sparkles'} size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon quick presets */}
              <div>
                <label className="block text-gray-400 text-[10px] uppercase font-medium mb-1">Gợi ý Icon nhanh</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, icon_name: ico })}
                      className={`px-2 py-1 rounded-lg border text-[11px] flex items-center space-x-1 ${
                        editingProduct.icon_name === ico
                          ? 'border-accent bg-accent-subtle text-accent'
                          : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.04]'
                      }`}
                    >
                      <DynamicIcon name={ico} size={13} strokeWidth={1.5} />
                      <span>{ico}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Mô Tả Sản Phẩm (Tính năng nổi bật)</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Chính Sách Bảo Hành</label>
                <textarea
                  rows={2}
                  value={editingProduct.warranty_policy || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, warranty_policy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-accent text-xs font-semibold shadow-sm"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

