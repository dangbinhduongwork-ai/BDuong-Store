import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { Layers, Check, AlertCircle, Save, PlusCircle, ShieldCheck } from 'lucide-react';

export const StockManager: React.FC = () => {
  const { products, saveProduct } = useStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [stockText, setStockText] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    await saveProduct({
      ...selectedProduct,
      stock_data: lines,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
          Quản Lý Kho Tài Khoản Tự Động (Auto-Delivery Stock)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Nhập danh sách tài khoản, mã kích hoạt hoặc link tài liệu (mỗi dòng là 1 tài khoản trả cho 1 khách hàng).
        </p>
      </div>

      {/* Select Product Pill Bar */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-2">
        {products.map((p) => {
          const isSelected = p.id === selectedProductId;
          const count = p.stock_data?.length || 0;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              style={isSelected ? { backgroundColor: 'var(--accent-color, #0071E3)', color: '#ffffff', borderColor: 'var(--accent-color, #0071E3)' } : {}}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'border-accent bg-accent text-white shadow-sm'
                  : 'border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 hover:bg-black/5'
              }`}
            >
              <DynamicIcon name={p.icon_name} size={16} strokeWidth={1.5} />
              <span className={isSelected ? 'text-white font-bold' : ''}>{p.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : count > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stock Editor Box */}
      {selectedProduct && (
        <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 gap-2">
            <div>
              <h4 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                <DynamicIcon name={selectedProduct.icon_name} size={18} strokeWidth={1.5} className="text-accent" />
                <span>Kho sản phẩm: {selectedProduct.name}</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Đơn giá: {selectedProduct.duration} • Hiện còn: <strong className="text-accent">{lines.length} slot</strong> sẵn sàng giao.
              </p>
            </div>

            <button
              onClick={handleSaveStock}
              className="px-5 py-2.5 rounded-xl btn-accent font-semibold text-xs flex items-center space-x-2 shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã Cập Nhật Kho!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                  <span>Lưu Kho ({lines.length} Tài Khoản)</span>
                </>
              )}
            </button>
          </div>

          {/* Guide hint */}
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              Quy tắc nhập kho tự động (Auto Delivery Mechanism):
            </p>
            <p className="text-[11px] leading-relaxed">
              • Mỗi dòng văn bản là 1 tài khoản/key. Khi khách thanh toán thành công, hệ thống tự động bốc dòng đầu tiên giao cho khách và trừ đi 1 dòng trong kho.
            </p>
            <p className="text-[11px] leading-relaxed font-mono">
              • Cú pháp khuyên dùng: <code className="text-accent">Email: ... | Pass: ... | 2FA: ...</code> hoặc <code className="text-accent">Link kích hoạt: https://...</code>
            </p>
          </div>

          {/* Large Text Area */}
          <div>
            <textarea
              rows={12}
              value={stockText}
              onChange={(e) => setStockText(e.target.value)}
              placeholder="Dán danh sách tài khoản vào đây, mỗi dòng là một tài khoản/link kích hoạt..."
              className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

