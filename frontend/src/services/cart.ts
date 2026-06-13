// services/cart.ts
import apiClient from './apiClient';
import { Cart, CartItem } from '@/types/cart';

// Shape raw từ backend (sau populate)
interface RawCartItem {
  menuItemId: {
    _id: string;
    id?: string;
    name: string;
    price: number;
    image?: string;
    imageUrl?: string;
  } | string; // trước populate hoặc edge case
  quantity: number;
  note?: string;
}

interface RawCart {
  _id: string;
  tableId: string;
  items: RawCartItem[];
}

function mapCart(raw: RawCart): Cart {
  return {
    id: raw._id,
    tableId: raw.tableId,
    items: raw.items.map((item): CartItem => {
      const menuItemObj = typeof item.menuItemId === 'object' && item.menuItemId !== null
        ? item.menuItemId
        : null;

      return {
        menuItemId: menuItemObj?._id ?? menuItemObj?.id ?? (item.menuItemId as string),
        quantity: item.quantity,
        note: item.note ?? '',
        menuItem: menuItemObj ? {
          id: menuItemObj._id ?? menuItemObj.id,
          name: menuItemObj.name,
          price: menuItemObj.price,
          image: menuItemObj.imageUrl,
        } : undefined,
      };
    }),
  };
}

export async function getCart(tableId: string): Promise<Cart> {
  const raw = await apiClient<RawCart>(`/cart/${tableId}`);
  return mapCart(raw);
}

export async function addToCart(
  tableId: string,
  menuItemId: string,
  quantity: number = 1,
  note: string = ''
): Promise<Cart> {
  const raw = await apiClient<RawCart>(`/cart/${tableId}/add`, {
    method: 'POST',
    body: JSON.stringify({ menuItemId, quantity, note }),
  });
  return mapCart(raw);
}

export async function removeFromCart(tableId: string, menuItemId: string): Promise<Cart> {
  const raw = await apiClient<RawCart>(`/cart/${tableId}/remove/${menuItemId}`, {
    method: 'DELETE',
  });
  return mapCart(raw);
}

export async function clearCart(tableId: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/cart/${tableId}/clear`, {
    method: 'DELETE',
  });
}

export async function updateCartItemNote(
  tableId: string,
  menuItemId: string,
  note: string
): Promise<Cart> {
  const raw = await apiClient<RawCart>(`/cart/${tableId}/item/${menuItemId}/note`, {
    method: 'PATCH',
    body: JSON.stringify({ note }),
  });
  return mapCart(raw);
}
