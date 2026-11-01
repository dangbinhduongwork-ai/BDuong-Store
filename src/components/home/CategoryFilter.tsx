import React from 'react';
import { Search, Flame, Tv, Bot, BookOpen, X } from 'lucide-react';
import { ProductCategory } from '../../types';

interface CategoryFilterProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const categories: { id: ProductCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất Cả', icon: <Flame className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'entertainment', label: 'YouTube Premium', icon: <Tv className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'ai', label: 'Tài Khoản AI', icon: <Bot className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'course', label: 'Khóa Học Bản Quyền', icon: <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 sm:mb-8">
      {/* Category Pills (Apple Segmented Style) */}
      <div className="w-full md:w-auto flex items-center overflow-x-auto no-scrollbar py-1 px-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/5 space-x-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-accent' : ''}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="w-full md:w-72 relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full pl-9 pr-8 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
