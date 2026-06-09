export interface CartItem {
    menuItemId: string;
    quantity: number;
    note?: string;
    menuItem?: {
        id: string;
        name: string;
        price: number;
        description: string;
        imageUrl?: string;
        category?: string;
        isAvailable: boolean;
    };
}

export interface Cart {
    tableId: string;
    items: CartItem[];
}