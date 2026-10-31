import React from 'react';
import { Search, Flame, Tv, Bot, BookOpen } from 'lucide-react';
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
    { id: 'all', label: 'Tất Cả Sản Phẩm', icon: <Flame className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'entertainment', label: 'Giải Trí (YouTube)', icon: <Tv className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'ai', label: 'Tài Khoản AI', icon: <Bot className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'course', label: 'Khóa Học Bản Quyền', icon: <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      {/* Category Pills (Apple Segmented Style) */}
      <div className="w-full md:w-auto flex items-center overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/5 space-x-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
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
          placeholder="Tìm sản phẩm số..."
          className="w-full pl-9 pr-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

