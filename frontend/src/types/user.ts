export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'staff' | 'admin';
    createdAt?: string;
    updatedAt?: string;
}