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
            
            let targetData = rawData && typeof rawData === 'object' && 'data' in rawData ? rawData.data : rawData;

            if (targetData && Array.isArray(targetData.items)) {
                targetData.items = targetData.items.map((item: any) => {
                    let cleanImage = item.image || item.imageUrl || '';
                    
                    if (cleanImage && !cleanImage.startsWith('http') && !cleanImage.startsWith('data:') && !cleanImage.startsWith('blob:')) {
                        const domain = API_URL.replace(/\/api$/, '');
                        cleanImage = `${domain}/${cleanImage.replace(/^\/+/, '')}`;
                    }
                    
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

    // ✅ ĐÃ THÊM status?: string ĐỂ KHỬ SẠCH LỖI GẠCH ĐỎ TS(2339) KHI CREATE
    create: async (data: MenuFormData & { imageFile?: File; status?: string }): Promise<MenuItem> => {
        let finalImageUrl = data.image;

        if (data.imageFile) {
            try {
                const formData = new FormData();
                formData.append('image', data.imageFile); 

                const cleanBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
                const uploadRes = await fetch(`${cleanBase}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useAuthStore.getState().token}`
                    },
                    body: formData
                });

                if (!uploadRes.ok) {
                    const errText = await uploadRes.text();
                    throw new Error(`Server từ chối file ảnh: ${errText}`);
                }

                const uploadData = await uploadRes.json();
                const serverUrl = uploadData.url || uploadData.imageUrl || uploadData.path || uploadData.secure_url;
                
                if (!serverUrl) {
                    throw new Error(`Upload thành công nhưng không tìm thấy trường URL trong phản hồi của Backend.`);
                }

                finalImageUrl = serverUrl;
                console.log("📸 [DEBUG] Upload ảnh mới thành công. URL vĩnh viễn:", finalImageUrl);
            } catch (uploadErr: any) {
                console.error("🚨 Lỗi trong tiến trình upload file ảnh:", uploadErr);
                throw new Error(uploadErr.message || "Tiến trình tải ảnh lên máy chủ thất bại, dừng tạo món ăn.");
            }
        }

        const payload = {
            ...data,
            image: finalImageUrl,
            imageUrl: finalImageUrl, 
            isAvailable: data.status === 'available', 
            status: data.status 
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

    // ✅ ĐÃ THÊM status?: string ĐỂ KHỬ SẠCH LỖI GẠCH ĐỎ TS(2339) KHI UPDATE
    update: async (id: string, data: MenuFormData & { imageFile?: File; status?: string }): Promise<MenuItem> => {
        let finalImageUrl = data.image;

        if (data.imageFile) {
            try {
                const formData = new FormData();
                formData.append('image', data.imageFile);

                const cleanBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
                const uploadRes = await fetch(`${cleanBase}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useAuthStore.getState().token}`
                    },
                    body: formData
                });

                if (!uploadRes.ok) {
                    const errText = await uploadRes.text();
                    throw new Error(`Server từ chối file ảnh khi cập nhật: ${errText}`);
                }

                const uploadData = await uploadRes.json();
                const serverUrl = uploadData.url || uploadData.imageUrl || uploadData.path || uploadData.secure_url;
                
                if (!serverUrl) {
                    throw new Error(`Không tìm thấy URL ảnh trong JSON trả về từ Server.`);
                }

                finalImageUrl = serverUrl;
                console.log("📸 [DEBUG] Cập nhật ảnh thành công. URL mới vĩnh viễn:", finalImageUrl);
            } catch (uploadErr: any) {
                console.error("🚨 Lỗi trong tiến trình cập nhật file ảnh:", uploadErr);
                throw new Error(uploadErr.message || "Lỗi cập nhật hình ảnh.");
            }
        }

        const payload = {
            ...data,
            image: finalImageUrl,
            imageUrl: finalImageUrl,
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