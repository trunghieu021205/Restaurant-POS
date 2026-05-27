export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied';
    createdAt?: string;
    updatedAt?: string;
}
