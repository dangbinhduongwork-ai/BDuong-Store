import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { formatVND } from '../../lib/utils';
import { 
  Check, 
  Save, 
  ShieldCheck, 
  Search, 
  Boxes, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  ListFilter,
  FileCode,
  Trash2
} from 'lucide-react';

export const StockManager: React.FC = () => {
  const { products, saveProduct } = useStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [stockText, setStockText] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setStockText((selectedProduct.stock_data || []).join('\n'));
    }
  }, [selectedProductId, selectedProduct]);

  const lines = stockText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Filtered products list for selector
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const count = p.stock_data?.length || 0;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === 'in_stock') return count > 0;
      if (filterMode === 'out_of_stock') return count === 0;
      return true;
    });
  }, [products, searchQuery, filterMode]);

  const totalSlots = products.reduce((acc, p) => acc + (p.stock_data?.length || 0), 0);
  const outOfStockCount = products.filter((p) => (p.stock_data?.length || 0) === 0).length;

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    await saveProduct({
      ...selectedProduct,
      stock_data: lines,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCleanEmptyLines = () => {
    const cleaned = lines.join('\n');
    setStockText(cleaned);
  };

  const handleInsertTemplate = () => {
    const template = 'user_demo@gmail.com | MatKhau123 | 2FA_KEY_ABC';
    setStockText((prev) => (prev ? `${prev}\n${template}` : template));
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold mb-1.5">
            <Boxes className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Kho Trả Hàng Tự Động</span>
          </div>
          <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Quản Lý Kho Tài Khoản & License Key
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Mỗi dòng là 1 tài khoản trả tự động khi khách thanh toán VietQR thành công.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5">
            <span className="text-gray-400">Tổng sản phẩm:</span>{' '}
            <strong className="text-gray-800 dark:text-gray-200">{products.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
            <span>Sẵn sàng: </span>
            <strong>{totalSlots} slot</strong>
          </div>
          {outOfStockCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-semibold">
              <span>Hết hàng: </span>
              <strong>{outOfStockCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Modern Product Selector Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh sản phẩm trong kho..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-1.5 p-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl border border-black/5 dark:border-white/5 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Tất cả ({products.length})
            </button>
            <button
              onClick={() => setFilterMode('in_stock')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'in_stock'
                  ? 'bg-white dark:bg-[#2C2C2E] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Còn hàng
            </button>
            <button
              onClick={() => setFilterMode('out_of_stock')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'out_of_stock'
                  ? 'bg-white dark:bg-[#2C2C2E] text-rose-500 shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Modern Apple Card Grid for Product Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto p-1 rounded-2xl bg-black/[0.02] dark:bg-black/20 border border-black/5 dark:border-white/5">
          {filteredProducts.map((p) => {
            const isSelected = p.id === selectedProductId;
            const count = p.stock_data?.length || 0;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`relative flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer border text-left select-none ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/30 bg-white dark:bg-[#2C2C2E] shadow-apple-card'
                    : 'border-black/5 dark:border-white/5 bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-apple-sm'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] text-gray-700 dark:text-gray-300'
                  }`}
                  style={isSelected ? { backgroundColor: 'var(--accent-color, #0071E3)' } : {}}
                >
                  <DynamicIcon name={p.icon_name} size={18} strokeWidth={1.5} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                      {p.name}
                    </h4>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0 animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>{formatVND(p.price)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        count > 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {count > 0 ? `Còn ${count}` : 'Hết kho'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Editor Box */}
      {selectedProduct && (
        <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 gap-3">
            <div>
              <h4 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: 'var(--accent-color, #0071E3)' }}
                >
                  <DynamicIcon name={selectedProduct.icon_name} size={15} strokeWidth={1.5} />
                </div>
                <span>Kho sản phẩm: {selectedProduct.name}</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span>Đơn giá: {formatVND(selectedProduct.price)} ({selectedProduct.duration})</span>
                <span>•</span>
                <span>Hiện còn: <strong className="text-accent">{lines.length} tài khoản</strong> sẵn sàng giao</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 transition-colors"
                title="Chèn dòng mẫu tài khoản"
              >
                <FileCode className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span className="hidden sm:inline">Chèn Mẫu</span>
              </button>

              <button
                type="button"
                onClick={handleCleanEmptyLines}
                className="px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 transition-colors"
                title="Xóa các dòng trống thừa"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                <span className="hidden sm:inline">Lọc Dòng Trống</span>
              </button>

              <button
                onClick={handleSaveStock}
                className="px-5 py-2 rounded-xl btn-accent font-semibold text-xs flex items-center space-x-2 shadow-sm"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Cập Nhật Kho!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                    <span>Lưu Kho ({lines.length} Slot)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guide hint */}
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              Cơ chế bốc kho tự động:
            </p>
            <p className="text-[11px] leading-relaxed">
              Mỗi dòng văn bản tương ứng với 1 tài khoản/key. Khi khách chuyển khoản thành công, hệ thống tự động bốc dòng đầu tiên giao cho khách và xóa khỏi kho.
            </p>
          </div>

          {/* Large Text Area with line counter */}
          <div className="relative">
            <textarea
              rows={12}
              value={stockText}
              onChange={(e) => setStockText(e.target.value)}
              placeholder="Dán danh sách tài khoản vào đây, mỗi dòng là một tài khoản/link kích hoạt..."
              className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 text-[10px] font-mono text-gray-400 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded-md pointer-events-none">
              {lines.length} tài khoản
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

