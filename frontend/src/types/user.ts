export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'staff' | 'admin' | 'USER' | 'STAFF' | 'ADMIN';
    createdAt?: string;
    updatedAt?: string;
}
