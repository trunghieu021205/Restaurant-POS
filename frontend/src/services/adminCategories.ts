export interface Category {
    id: string;
    name: string;
    description: string;
    image: string;
    isActive: boolean;
    orderIndex: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import useAuthStore from '@/stores/auth';

// Hàm helper thông minh chuẩn hóa URL để tránh lỗi lặp /api/api
const getBaseAdminUrl = () => {
    const cleanBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    return `${cleanBase}/admin/categories`;
};

const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const adminCategoriesService = {
    getAll: async (): Promise<Category[]> => {
        const token = useAuthStore.getState().token;
        const targetUrl = getBaseAdminUrl();
        
        console.log("🔍 [DEBUG] Gọi API Danh Mục:", targetUrl);
        console.log("🔑 [DEBUG] Token gửi đi từ FE:", token ? "Có tồn tại (Đã gửi)" : "NULL/RỖNG (Chưa gửi)");

        try {
            const res = await fetch(targetUrl, {
                headers: getHeaders()
            });

            console.log("📊 [DEBUG] HTTP Status Code (Danh mục):", res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ [DEBUG] Backend từ chối trả data danh mục. Chi tiết lỗi:", errorText);
                throw new Error(errorText || `Lỗi từ Server (${res.status})`);
            }

            const data = await res.json();
            console.log("✅ [DEBUG] Dữ liệu danh mục nhận về thành công:", data);
            
            if (data && typeof data === 'object' && 'data' in data) {
                return data.data as Category[];
            }
            return data as Category[];
        } catch (err: any) {
            console.error("🚨 Lỗi thực tế tại hàm getAll Categories:", err);
            throw err;
        }
    },

    create: async (data: Partial<Category>): Promise<Category> => {
        const res = await fetch(getBaseAdminUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create category');
        }
        return res.json();
    },

    update: async (id: string, data: Partial<Category>): Promise<Category> => {
        const res = await fetch(`${getBaseAdminUrl()}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update category');
        }
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${getBaseAdminUrl()}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete category');
        }
    }
};