
export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    note: string;
}

export interface Order {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: 'pending' | 'cooking' | 'done';
    total: number;
}