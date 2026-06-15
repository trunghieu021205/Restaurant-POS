const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
import { encrypt, decrypt } from '@/utils/crypto';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'staff' | 'admin';
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Encrypt the login payload
    const encryptedPayload = await encrypt(JSON.stringify(data));
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encryptedData: encryptedPayload }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const result = await response.json();
    
    // Decrypt the email in the response
    if (result.user && result.user.encryptedEmail) {
      result.user.email = await decrypt(result.user.encryptedEmail);
      delete result.user.encryptedEmail;
    }
    
    return result;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng ký thất bại');
    }

    return response.json();
  },

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng xuất thất bại');
    }
  },
};
