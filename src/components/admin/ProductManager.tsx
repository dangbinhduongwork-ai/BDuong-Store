import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatVND } from '../../lib/utils';
import { DynamicIcon } from '../common/DynamicIcon';
import { Plus, Edit2, Trash2, Check, X, Sparkles, Search, Layers, Eye, EyeOff } from 'lucide-react';

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
  const [stockInput, setStockInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
    setStockInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setStockInput((p.stock_data || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi hệ thống?`)) {
      await deleteProduct(id);
      showToast(`Đã xóa sản phẩm "${name}" thành công!`);
    }
  };

  const handleToggleActive = async (product: Product) => {
    const updated = { ...product, is_active: !product.is_active };
    await saveProduct(updated);
    showToast(`Đã ${updated.is_active ? 'bật hiển thị' : 'tạm ẩn'} sản phẩm "${product.name}"!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    // Parse stock input (each line is one credential/link)
    const parsedStock = stockInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payloadToSave: Partial<Product> = {
      ...editingProduct,
      stock_data: parsedStock,
    };

    try {
      await saveProduct(payloadToSave);
      showToast(editingProduct.id ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới thành công vào Supabase!');
      setIsModalOpen(false);
      setEditingProduct(null);
      setStockInput('');
    } catch {
      alert('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery = 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Danh Sách Sản Phẩm Số ({products.length} sản phẩm)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý tên gói, giá bán, danh mục, icon và nạp sẵn kho tài khoản trả tự động.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="entertainment">Giải Trí (YouTube)</option>
            <option value="ai">Tài Khoản AI</option>
            <option value="course">Khóa Học</option>
          </select>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl btn-accent font-semibold text-xs flex items-center space-x-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Product Grid Cards */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-black/5 dark:border-white/10 text-gray-400">
          <p className="text-sm font-semibold">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const stockCount = product.stock_data?.length || 0;

            return (
              <div
                key={product.id}
                className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-apple-card ${
                  product.is_active 
                    ? 'border-black/5 dark:border-white/10' 
                    : 'border-dashed border-gray-300 dark:border-gray-700 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                      <DynamicIcon name={product.icon_name} size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.is_active 
                            ? 'text-emerald-600 hover:bg-emerald-500/10' 
                            : 'text-gray-400 hover:bg-black/5'
                        }`}
                        title={product.is_active ? 'Đang bật hiển thị (Bấm để ẩn)' : 'Đang ẩn (Bấm để bật)'}
                      >
                        {product.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
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

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {product.category}
                    </span>
                    {!product.is_active && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        Đang tạm ẩn
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm mt-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Thời hạn: <strong className="text-gray-700 dark:text-gray-300">{product.duration}</strong>
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="font-bold text-accent text-sm">
                    {formatVND(product.price)}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    stockCount > 0 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    Kho: {stockCount} tài khoản
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
              <h3 className="font-bold text-base">
                {editingProduct.id ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới Vào Supabase'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">Tên Sản Phẩm (VD: ChatGPT Plus, YouTube Premium)</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent font-medium"
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
                    <option value="ai">Trí Tuệ Nhân Tạo (AI)</option>
                    <option value="course">Khóa Học & Tài Liệu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Thời Hạn Gói</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.duration || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, duration: e.target.value })}
                    placeholder="VD: 1 Tháng, 1 Năm, Trọn Đời"
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
                    min={0}
                    step={1000}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-bold text-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-medium">Biểu Tượng (Icon)</label>
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
                          ? 'border-accent bg-accent-subtle text-accent font-bold'
                          : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.04]'
                      }`}
                    >
                      <DynamicIcon name={ico} size={13} strokeWidth={1.5} />
                      <span>{ico}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DIRECT STOCK INPUT: ENTER MULTIPLE ACCOUNTS AT ONCE */}
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1.5">
                <label className="block font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    <span>Nạp Kho Tài Khoản Trả Tự Động (Mỗi dòng 1 tài khoản/key)</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {stockInput.split('\n').filter((s) => s.trim().length > 0).length} tài khoản trong kho
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  placeholder={`Dán danh sách tài khoản, mỗi dòng là một tài khoản/invite link:\nEmail: user1@gmail.com | Pass: 123456 | 2FA: ABC\nEmail: user2@gmail.com | Pass: 123456`}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
                />
                <p className="text-[10px] text-gray-400">
                  ⚡ Khi khách quét VietQR thanh toán thành công, hệ thống sẽ tự động bốc 1 dòng đầu tiên giao cho khách.
                </p>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Mô Tả Sản Phẩm (Tính năng nổi bật)</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Mô tả quyền lợi gói..."
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Chính Sách Bảo Hành</label>
                <textarea
                  rows={2}
                  value={editingProduct.warranty_policy || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, warranty_policy: e.target.value })}
                  placeholder="Bảo hành 1 đổi 1..."
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
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl btn-accent text-xs font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSaving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Lưu Sản Phẩm Vào Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
