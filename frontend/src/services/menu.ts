// services/menu.ts
import apiClient from './apiClient';
import { MenuItem, MenuFormData, MenuFilters } from '@/types/menu';

// Lấy danh sách món (admin — có filter, search, pagination)
export async function fetchMenuItems(filters: MenuFilters) {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    limit: filters.limit.toString(),
    search: filters.search,
    category: filters.category,
    status: filters.status,
  });

  return apiClient<{ items: MenuItem[]; total: number; page: number; totalPages: number }>(
    `/menu?${params}`
  );
}

// Lấy menu hôm nay (dành cho trang bàn ăn)
export async function fetchTodayMenu(): Promise<MenuItem[]> {
  return apiClient<MenuItem[]>('/menu/today');
}

// Lấy chi tiết một món
export async function fetchMenuItem(id: string): Promise<MenuItem> {
  return apiClient<MenuItem>(`/menu/${id}`);
}

// Thêm món mới
export async function createMenuItem(data: MenuFormData): Promise<MenuItem> {
  return apiClient<MenuItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Cập nhật món
export async function updateMenuItem(id: string, data: Partial<MenuFormData>): Promise<MenuItem> {
  return apiClient<MenuItem>(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Xóa món
export async function deleteMenuItem(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/menu/${id}`, {
    method: 'DELETE',
  });
}

// Cập nhật menu hôm nay
export async function setTodayMenu(data: {
  add?: string[];
  remove?: string[];
  setAll?: boolean;
  clearAll?: boolean;
}): Promise<{ message: string; payload: unknown }> {
  return apiClient<{ message: string; payload: unknown }>('/menu/today', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Staff/Admin: chỉ cập nhật trạng thái isAvailable (còn/hết)
export async function updateMenuAvailability(
  id: string,
  isAvailable: boolean,
): Promise<MenuItem> {
  return apiClient<MenuItem>(`/menu/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable }),
  });
}

// Upload ảnh
export async function uploadMenuImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  // Upload dùng FormData — không set Content-Type (browser tự set boundary)
  const result = await apiClient<{ url: string }>('/upload', {
    method: 'POST',
    body: formData,
    // Xóa Content-Type để browser tự set multipart/form-data
    headers: { 'Content-Type': '' },
  });

  return result.url;
}

