
export interface OrderItem {
    menuItemId: string;
    quantity: number;
    price: number;
    note?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    tableId: string;
    user?: string;
    items: OrderItem[];
    billId?: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    totalAmount: number;
    subTotal: number;
    createdAt?: string;
    updatedAt?: string;
}
