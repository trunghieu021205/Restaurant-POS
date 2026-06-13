// services/category.ts
import apiClient from './apiClient';
import { Category } from '@/types/menu';

export async function fetchCategories(all: boolean = false): Promise<Category[]> {
  const params = all ? '?all=true' : '';
  return apiClient<Category[]>(`/categories${params}`);
}

export async function fetchCategory(id: string): Promise<Category> {
  return apiClient<Category>(`/categories/${id}`);
}

export async function createCategory(data: {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  orderIndex?: number;
}): Promise<Category> {
  return apiClient<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    orderIndex?: number;
  }
): Promise<Category> {
  return apiClient<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
