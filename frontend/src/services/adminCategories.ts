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

    create: async (data: Partial<Category> & { imageFile?: File }): Promise<Category> => {
        let finalImageUrl = data.image || '';

        // 🌟 BỘ KIỂM TRA & UPLOAD ẢNH CHO CATEGORY:
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
                    throw new Error(`Server từ chối file ảnh danh mục: ${errText}`);
                }

                const uploadData = await uploadRes.json();
                const serverUrl = uploadData.url || uploadData.imageUrl || uploadData.path || uploadData.secure_url;
                
                if (!serverUrl) {
                    throw new Error("Upload thành công nhưng không tìm thấy trường URL ảnh từ phản hồi Backend.");
                }

                finalImageUrl = serverUrl;
                console.log("📸 [DEBUG] Upload ảnh danh mục thành công. URL vĩnh viễn:", finalImageUrl);
            } catch (uploadErr: any) {
                console.error("🚨 Lỗi hệ thống upload danh mục:", uploadErr);
                throw new Error(uploadErr.message || "Tiến trình tải ảnh danh mục lên máy chủ thất bại, dừng tạo.");
            }
        }

        const payload = {
            ...data,
            image: finalImageUrl
        };

        const res = await fetch(getBaseAdminUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create category');
        }
        return res.json();
    },

    update: async (id: string, data: Partial<Category> & { imageFile?: File }): Promise<Category> => {
        let finalImageUrl = data.image || '';

        // 🌟 BỘ KIỂM TRA & UPLOAD ẢNH KHI CẬP NHẬT CATEGORY:
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
                    throw new Error(`Server từ chối file ảnh danh mục khi cập nhật: ${errText}`);
                }

                const uploadData = await uploadRes.json();
                const serverUrl = uploadData.url || uploadData.imageUrl || uploadData.path || uploadData.secure_url;
                
                if (!serverUrl) {
                    throw new Error("Không tìm thấy URL ảnh danh mục trong JSON trả về từ Server.");
                }

                finalImageUrl = serverUrl;
            } catch (uploadErr: any) {
                console.error("🚨 Lỗi cập nhật ảnh danh mục:", uploadErr);
                throw new Error(uploadErr.message || "Lỗi cập nhật hình ảnh danh mục.");
            }
        }

        const payload = {
            ...data,
            image: finalImageUrl
        };

        const res = await fetch(`${getBaseAdminUrl()}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
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