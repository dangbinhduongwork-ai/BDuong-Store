import React from 'react';
import { Product } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { formatVND } from '../../lib/utils';
import { Clock, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onBuyNow,
}) => {
  const stockCount = product.stock_data ? product.stock_data.length : 0;
  const isOutOfStock = stockCount === 0;

  return (
    <div className="group relative glass-card rounded-3xl p-6 transition-all duration-300 hover:shadow-apple-hover hover:-translate-y-1 flex flex-col justify-between border border-black/5 dark:border-white/10 overflow-hidden">
      {/* Top Accent Subtle Glow on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Header: Icon & Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] text-accent flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:bg-accent-subtle transition-colors">
            <DynamicIcon name={product.icon_name} size={24} strokeWidth={1.5} />
          </div>

          <div className="flex items-center space-x-1.5">
            {isOutOfStock ? (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                Hết hàng
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Còn {stockCount} slot</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onSelect(product)}
          className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight group-hover:text-accent transition-colors cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        {/* Duration & Key Benefit */}
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Thời hạn: <strong className="text-gray-800 dark:text-gray-200">{product.duration}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Bảo hành 1-1</span>
          </span>
        </div>

        {/* Brief Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
          {product.description}
        </p>
      </div>

      {/* Footer: Price & Actions */}
      <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Giá ưu đãi</span>
          <span className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            {formatVND(product.price)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect(product)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
          >
            Chi tiết
          </button>
          
          <button
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            className="px-4 py-2 rounded-xl btn-accent font-medium text-xs flex items-center space-x-1.5 shadow-sm disabled:opacity-40 disabled:pointer-events-none group/btn"
          >
            <span>Mua Ngay</span>
            <Zap className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

