// hooks/useMenu.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage } from '@/services/menu';
import { MenuFilters, MenuFormData } from '@/types/menu';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useMenu(initialFilters?: Partial<MenuFilters>) {
  const [filters, setFilters] = useState<MenuFilters>({
    search: '',
    category: 'all',
    status: 'all',
    page: 1,
    limit: 8,
    ...initialFilters,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['menu', filters],
    queryFn: () => fetchMenuItems(filters),
    placeholderData: (prev) => prev, // giữ data cũ khi fetch mới
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Thêm món thành công!');
    },
    onError: () => toast.error('Thêm món thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuFormData> }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Cập nhật món thành công!');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Xóa món thành công!');
    },
    onError: () => toast.error('Xóa món thất bại'),
  });

  const setSearch = (search: string) => setFilters((f) => ({ ...f, search, page: 1 }));
  const setCategory = (category: string) => setFilters((f) => ({ ...f, category, page: 1 }));
  const setStatus = (status: MenuFilters['status']) => setFilters((f) => ({ ...f, status, page: 1 }));
  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  return {
    filters,
    setSearch,
    setCategory,
    setStatus,
    setPage,
    menuData: data,
    isLoading,
    isError,
    error,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}