// hooks/useTodayMenu.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTodayMenu } from '@/services/menu';
import type { MenuItem } from '@/types/menu';

export function useTodayMenu() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['menu', 'today'],
    queryFn: fetchTodayMenu,
    staleTime: 1000 * 60 * 5, // cache 5 phút, menu hôm nay ít thay đổi
  });

  const menuItems: MenuItem[] = data ?? [];

  return {
    menuItems,
    isLoading,
    isError,
    error,
    refetch,
  };
}