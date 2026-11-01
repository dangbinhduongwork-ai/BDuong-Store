import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { CategoryFilter } from './CategoryFilter';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  onBuyNow,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <section id="products-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Danh Mục Bản Quyền</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Sản Phẩm Số & Tài Khoản AI
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Giao hàng tự động qua VietQR • Bảo hành 1 đổi 1 trọn thời gian.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <CategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Grid of Product Cards */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl glass-card border border-black/5 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] text-gray-400 mx-auto flex items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Không tìm thấy sản phẩm phù hợp
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}
    </section>
  );
};

