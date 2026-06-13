// hooks/useCategories.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/category';
import type { Category } from '@/types/menu';

export function useCategories(all: boolean = false) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', { all }],
    queryFn: () => fetchCategories(all),
    staleTime: 1000 * 60 * 10, // 10 phút — categories ít thay đổi
  });

  const categories: Category[] = data ?? [];

  // Map id → name để lookup O(1) khi category là string ID
  const categoryMap = new Map<string, string>(
    categories.map((c) => [c.id, c.name])
  );

  return { categories, categoryMap, isLoading, isError };
}