// components/admin/menu/MenuToolbar.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Search, Plus, Filter } from "lucide-react";
import { MenuFilters, Category } from "@/types/menu";

interface MenuToolbarProps {
  filters: MenuFilters;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: MenuFilters["status"]) => void;
  onAddNew: () => void;
  total?: number;
  categories?: Category[];
}

export function MenuToolbar({
  filters,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onAddNew,
  total,
  categories = [],
}: MenuToolbarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-4 space-y-4">
      {/* Top row: search + add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm món ăn..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800"
          />
        </div>
        <Button
          onClick={onAddNew}
          className="bg-primary-500 hover:bg-primary-600 text-white gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món mới</span>
        </Button>
      </div>

      {/* Bottom row: filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-neutral-400 shrink-0" />

        <select
          value={filters.category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-700 bg-white focus:border-primary-500 outline-none"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            onStatusChange(e.target.value as MenuFilters["status"])
          }
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-700 bg-white focus:border-primary-500 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn món</option>
          <option value="unavailable">Hết món</option>
        </select>

        {total !== undefined && (
          <span className="text-sm text-neutral-400 ml-auto">{total} món</span>
        )}
      </div>
    </div>
  );
}
