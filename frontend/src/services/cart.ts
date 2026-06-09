// services/cart.ts
import { Cart, CartItem } from '@/types/cart';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getCart(tableId: string): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/${tableId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

export async function addToCart(
  tableId: string,
  menuItemId: string,
  quantity: number = 1,
  note: string = ''
): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/${tableId}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ menuItemId, quantity, note }),
  });

  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }

  return response.json();
}

export async function removeFromCart(tableId: string, menuItemId: string): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/${tableId}/remove/${menuItemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }

  return response.json();
}

export async function clearCart(tableId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/cart/${tableId}/clear`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }

  return response.json();
}
