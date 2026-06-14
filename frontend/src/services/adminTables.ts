import useAuthStore from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const getBaseUrl = () => `${API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`}/admin/tables`;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${useAuthStore.getState().token}`
});

export const adminTablesService = {
    getAll: async () => {
        const res = await fetch(getBaseUrl(), { headers: getHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách bàn');
        return res.json();
    },
    create: async (data: { number: number; capacity: number }) => {
        const res = await fetch(getBaseUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Lỗi tạo bàn');
        }
        return res.json();
    },
    update: async (id: string, data: { capacity: number; status: string }) => {
        const res = await fetch(`${getBaseUrl()}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Lỗi cập nhật bàn');
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`${getBaseUrl()}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Lỗi xóa bàn');
        return res.json();
    }
};