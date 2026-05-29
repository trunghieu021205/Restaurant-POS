
export interface OrderItem {
    id?: string;
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
    status: 'pending' | 'cooking' | 'done' | 'paid' | 'cancelled';
    totalAmount: number;
    subTotal: number;
    paymentMethod?: 'cash' | 'credit_card' | 'e_wallet';
    paidAt?: string;
    createdAt?: string;
    updatedAt?: string;
}