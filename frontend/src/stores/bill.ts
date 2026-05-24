// stores/bill.ts
import { create } from 'zustand';

interface BillState {
  isOpen: boolean;
  tableId: string | null;
  setTableId: (id: string | null) => void;
  openBill: () => void;
  closeBill: () => void;
}

const useBillStore = create<BillState>((set) => ({
  isOpen: false,
  tableId: null,
  setTableId: (id) => set({ tableId: id }),
  openBill: () => set({ isOpen: true }),
  closeBill: () => set({ isOpen: false }),
}));

export default useBillStore;