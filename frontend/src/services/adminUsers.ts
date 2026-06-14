import useAuthStore from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const getBaseUrl = () => `${API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`}/admin/users`;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${useAuthStore.getState().token}`
});

export const adminUsersService = {
    getAll: async () => {
        const res = await fetch(getBaseUrl(), { headers: getHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách nhân sự');
        return res.json();
    },
    createStaff: async (data: any) => {
        const res = await fetch(`${getBaseUrl()}/staff`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Lỗi tạo tài khoản');
        }
        return res.json();
    },
    toggleStatus: async (id: string) => {
        const res = await fetch(`${getBaseUrl()}/${id}/status`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Lỗi thay đổi trạng thái');
        return res.json();
    },
    resetPassword: async (id: string) => {
        const res = await fetch(`${getBaseUrl()}/${id}/reset-password`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Lỗi reset mật khẩu');
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`${getBaseUrl()}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Lỗi xóa tài khoản');
        return res.json();
    }
};