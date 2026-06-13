import useAuthStore from '@/stores/auth';

export interface TopMenuItem {
    menuItemId: string;
    name: string;
    price: number;
    totalQuantity: number;
    totalSales: number;
}

export interface ChartDataPoint {
    _id: string; // Ngày dạng dd/mm
    revenue: number;
}

export interface PaymentLog {
    orderId: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    tableNumber: string;
    time: string;
}

export interface AdminStatsResponse {
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
    chartData: ChartDataPoint[];
    recentPayments: PaymentLog[];
    topItems: TopMenuItem[];
}

const getApiUrl = (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (normalizedBase.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
        return `${normalizedBase}${normalizedEndpoint.substring(4)}`;
    }
    return `${normalizedBase}${normalizedEndpoint}`;
};

const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const adminStatsService = {
    getStats: async (): Promise<AdminStatsResponse> => {
        const url = getApiUrl('/api/admin/stats');
        const res = await fetch(url, {
            headers: getHeaders(),
            cache: 'no-store'
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to fetch admin stats');
        }
        return res.json();
    }
};