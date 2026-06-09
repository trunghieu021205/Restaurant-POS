// services/menuService.ts
import { MenuItem, MenuFormData, MenuFilters } from '@/types/menu';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mock categories
export const MENU_CATEGORIES = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
  'Lẩu',
  'Hải sản',
];

// Lấy danh sách món (có filter, search, pagination)
export async function fetchMenuItems(filters: MenuFilters) {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    limit: filters.limit.toString(),
    search: filters.search,
    category: filters.category,
    status: filters.status,
  });

  const response = await fetch(`${API_BASE}/menu?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  return response.json();
}

// Lấy món hôm nay
export async function fetchTodayMenu(): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE}/menu/today`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch today menu');
  }

  return response.json();
}

// Lấy chi tiết món
export async function fetchMenuItem(id: string): Promise<MenuItem> {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }

  return response.json();
}

// Thêm món mới
export async function createMenuItem(data: MenuFormData): Promise<MenuItem> {
  const response = await fetch(`${API_BASE}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }

  return response.json();
}

// Cập nhật món
export async function updateMenuItem(id: string, data: Partial<MenuFormData>): Promise<MenuItem> {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }

  return response.json();
}

// Xóa món
export async function deleteMenuItem(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }

  return response.json();
}

// Cập nhật món hôm nay
export async function setTodayMenu(data: {
  add?: string[];
  remove?: string[];
  setAll?: boolean;
  clearAll?: boolean;
}): Promise<{ message: string; payload: any }> {
  const response = await fetch(`${API_BASE}/menu/today`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update today menu');
  }

  return response.json();
}

// Upload ảnh
export async function uploadMenuImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const result = await response.json();
  return result.url;
}