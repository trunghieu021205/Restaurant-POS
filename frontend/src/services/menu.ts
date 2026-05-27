// services/menuService.ts
import { MenuItem, MenuFormData, MenuFilters } from '@/types/menu';

// Mock categories
export const MENU_CATEGORIES = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
  'Lẩu',
  'Hải sản',
];

// Mock images 
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop',
];

let dummyMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Phở bò tái chín',
    price: 75000,
    description: 'Phở bò với nước dùng hầm xương 24h, thịt bò tái chín mềm thơm',
    image: MOCK_IMAGES[0],
    category: 'Món chính',
    status: 'available',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'Gỏi cuốn tôm thịt',
    price: 45000,
    description: 'Gỏi cuốn tươi với tôm, thịt heo, bún, rau sống chấm mắm nêm',
    image: MOCK_IMAGES[1],
    category: 'Khai vị',
    status: 'available',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Chè khúc bạch',
    price: 35000,
    description: 'Chè khúc bạch mát lạnh với vải, nhãn, hạnh nhân',
    image: MOCK_IMAGES[2],
    category: 'Tráng miệng',
    status: 'available',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    name: 'Cà phê sữa đá',
    price: 30000,
    description: 'Cà phê phin đậm đà với sữa đặc, đá xay mịn',
    image: MOCK_IMAGES[3],
    category: 'Đồ uống',
    status: 'available',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    name: 'Lẩu hải sản',
    price: 250000,
    description: 'Lẩu hải sản thập cẩm: tôm, mực, nghêu, cá, nấm, rau',
    image: MOCK_IMAGES[4],
    category: 'Lẩu',
    status: 'unavailable',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '6',
    name: 'Bánh xèo',
    price: 55000,
    description: 'Bánh xèo giòn rụm nhân tôm thịt, giá đỗ, ăn kèm rau sống',
    image: MOCK_IMAGES[5],
    category: 'Món chính',
    status: 'available',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
];

// Helper delay giả lập network
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Lấy danh sách món (có filter, search, pagination)
export async function fetchMenuItems(filters: MenuFilters) {
  await delay(400);
  
  let filtered = [...dummyMenuItems];
  
  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }
  
  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((item) => item.category === filters.category);
  }
  
  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((item) => item.status === filters.status);
  }
  
  // Sort by updatedAt desc
  filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Pagination
  const total = filtered.length;
  const start = (filters.page - 1) * filters.limit;
  const items = filtered.slice(start, start + filters.limit);
  
  return {
    items,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

// Thêm món mới
export async function createMenuItem(data: MenuFormData) {
  await delay(600);
  const newItem: MenuItem = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dummyMenuItems.unshift(newItem);
  return newItem;
}

// Cập nhật món
export async function updateMenuItem(id: string, data: Partial<MenuFormData>) {
  await delay(500);
  const index = dummyMenuItems.findIndex((item) => item.id === id);
  if (index === -1) throw new Error('Không tìm thấy món ăn');
  
  dummyMenuItems[index] = {
    ...dummyMenuItems[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return dummyMenuItems[index];
}

// Xóa món
export async function deleteMenuItem(id: string) {
  await delay(400);
  const index = dummyMenuItems.findIndex((item) => item.id === id);
  if (index === -1) throw new Error('Không tìm thấy món ăn');
  dummyMenuItems = dummyMenuItems.filter((item) => item.id !== id);
  return { success: true };
}

// Mock upload ảnh (trả về URL giả)
export async function uploadMenuImage(file: File): Promise<string> {
  await delay(800);
  // Giả lập trả về URL từ file name hoặc random
  return URL.createObjectURL(file); // Trong thực tế sẽ upload lên storage
}