import { MenuItem, MenuFormData, MenuFilters } from '@/types/menu';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import useAuthStore from '@/stores/auth';

const getBaseMenuUrl = () => {
    const cleanBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    return `${cleanBase}/admin/menu`;
};

const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface PaginatedMenuResponse {
    items: MenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const adminMenuService = {
    getAll: async (filters: MenuFilters): Promise<PaginatedMenuResponse> => {
        const queryObj: Record<string, string> = {
            page: filters.page.toString(),
            limit: filters.limit.toString(),
            search: filters.search || ''
        };

        if (filters.category && filters.category !== 'all') {
            queryObj.category = filters.category;
        }

        if (filters.status && filters.status !== 'all') {
            queryObj.status = filters.status;
        }

        const params = new URLSearchParams(queryObj);
        const targetUrl = `${getBaseMenuUrl()}?${params}`;

        try {
            const res = await fetch(targetUrl, {
                headers: getHeaders()
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || `Lỗi từ Server (${res.status})`);
            }

            const rawData = await res.json();
            
            // Bóc tách dữ liệu gốc của Backend nếu nằm trong object bọc .data
            let targetData = rawData && typeof rawData === 'object' && 'data' in rawData ? rawData.data : rawData;

            // 🌟 BỘ CHUYỂN ĐỔI (MAPPER) KHI NHẬN DATA VỀ FE:
            if (targetData && Array.isArray(targetData.items)) {
                targetData.items = targetData.items.map((item: any) => {
                    // 1. Đồng bộ Ảnh: Nếu BE trả về imageUrl, gán nó vào trường image để FE hiển thị được
                    const cleanImage = item.image || item.imageUrl || '';
                    
                    // 2. Đồng bộ Trạng thái: Phòng trường hợp BE lưu kiểu Boolean thay vì String enum
                    let cleanStatus = item.status;
                    if (item.isAvailable !== undefined) {
                        cleanStatus = item.isAvailable ? 'available' : 'unavailable';
                    } else if (item.available !== undefined) {
                        cleanStatus = item.available ? 'available' : 'unavailable';
                    }

                    return {
                        ...item,
                        image: cleanImage,
                        status: cleanStatus
                    };
                });
            }

            return targetData as PaginatedMenuResponse;
        } catch (err: any) {
            console.error("🚨 Lỗi tại hàm getAll Menu:", err);
            throw err;
        }
    },

    create: async (data: MenuFormData): Promise<MenuItem> => {
        // 🌟 BỘ CHUYỂN ĐỔI (MAPPER) TRƯỚC KHI GỬI LÊN BE:
        // Đóng gói payload bao gồm cả 2 phương án đặt tên biến để BE dùng kiểu nào cũng trúng
        const payload = {
            ...data,
            imageUrl: data.image, // Truyền thêm imageUrl bằng giá trị của image
            isAvailable: data.status === 'available', // Đề phòng BE dùng Boolean
            status: data.status // Giữ nguyên String enum nếu BE dùng loại này
        };

        const res = await fetch(getBaseMenuUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create menu item');
        }
        return res.json();
    },

    update: async (id: string, data: MenuFormData): Promise<MenuItem> => {
        // 🌟 BỘ CHUYỂN ĐỔI (MAPPER) TRƯỚC KHI UPDATE LÊN BE:
        const payload = {
            ...data,
            imageUrl: data.image,
            isAvailable: data.status === 'available',
            status: data.status
        };

        const res = await fetch(`${getBaseMenuUrl()}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update menu item');
        }
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${getBaseMenuUrl()}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete menu item');
        }
    }
};