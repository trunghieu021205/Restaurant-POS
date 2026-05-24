export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Bill {
  tableId: string;
  items: BillItem[];
  subtotal: number;     // trước VAT
  vatAmount: number;    // VAT 8%
  totalAmount: number;  // subtotal + vatAmount
}