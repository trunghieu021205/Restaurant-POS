// types/menu.ts
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  description: string;
  imageUrl?: string;
  category?: string | Category;
  isAvailable: boolean;
  isVisibleToday?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backwards compat (if UI/admin still sends old field)
// type MenuItemLegacy = { isToday?: boolean };


export interface MenuFormData {
  name: string;
  price: number;
  categoryId?: string;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  isVisibleToday: boolean;
}

export interface MenuFilters {
  search: string;
  category: string;
  status: 'all' | 'available' | 'unavailable';
  page: number;
  limit: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}
