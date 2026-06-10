"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, MenuItem } from "@/types/menu";

function getCategoryId(item: MenuItem): string | undefined {
  // populate có thể trả về object hoặc string
  const cid = (item as any).categoryId;
  if (!cid) return undefined;
  if (typeof cid === "string") return cid;
  if (typeof cid === "object" && cid !== null) return cid._id ?? undefined;
  return undefined;
}

export default function MenuCategoryFilter({
  categories,
  items,
  defaultCategoryName,
  onFiltered,
}: {
  categories: Category[];
  items: MenuItem[];
  defaultCategoryName: string;
  onFiltered: (filtered: MenuItem[], selectedCategoryId: string) => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const defaultCategoryId = useMemo(() => {
    const target = defaultCategoryName.trim().toLowerCase();
    const found = categories.find(
      (c) => c.name.trim().toLowerCase() === target,
    );
    return found?.id ?? "all";
  }, [categories, defaultCategoryName]);

  useEffect(() => {
    setSelectedCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === "all") return items;
    return items.filter((it) => getCategoryId(it) === selectedCategoryId);
  }, [items, selectedCategoryId]);

  useEffect(() => {
    onFiltered(filteredItems, selectedCategoryId);
  }, [filteredItems, selectedCategoryId, onFiltered]);

  return (
    <div className="space-y-4 mb-2 lg:mb-4">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategoryId("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs sm:text-sm border transition-colors ${
            selectedCategoryId === "all"
              ? "bg-primary-500 text-white border-primary-500"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Tất cả
        </button>

        {categories.map((cat) => {
          const active = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs sm:text-sm border transition-colors ${
                active
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
