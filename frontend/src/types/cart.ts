export interface CartItem {
    menuItemId: string;
    quantity: number;
    note?: string;
    menuItem?: {
        id: string;
        name: string;
        price: number;
        description?: string;
        imageUrl?: string;
        image?: string;
        category?: string;
        isAvailable?: boolean;
    };
}

export interface Cart {
    id: string;
    tableId: string;
    items: CartItem[];
}
