export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    customerName?: string;
    customerPhone?: string;
    checkedInAt?: string;
    reservedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}
