// data/dummyOrders.ts
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'new' | 'preparing' | 'done';

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO string
}

export const dummyOrders: Order[] = [
  {
    id: 'ord-001',
    tableId: 'B05',
    items: [
      { id: '1', name: 'Phở bò tái', quantity: 2, notes: 'Ít hành' },
      { id: '2', name: 'Nem rán', quantity: 1 },
    ],
    status: 'new',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'ord-002',
    tableId: 'A02',
    items: [
      { id: '3', name: 'Cơm rang hải sản', quantity: 1, notes: 'Không ớt' },
      { id: '4', name: 'Canh chua', quantity: 1 },
      { id: '5', name: 'Trà đá', quantity: 2 },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ord-003',
    tableId: 'C07',
    items: [
      { id: '6', name: 'Bún chả', quantity: 2 },
      { id: '7', name: 'Chả giò', quantity: 2, notes: 'Chấm riêng nước mắm' },
    ],
    status: 'done',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'ord-004',
    tableId: 'D01',
    items: [
      { id: '8', name: 'Gà nướng', quantity: 1 },
      { id: '9', name: 'Rau muống xào', quantity: 1 },
    ],
    status: 'new',
    createdAt: new Date().toISOString(),
  },
];