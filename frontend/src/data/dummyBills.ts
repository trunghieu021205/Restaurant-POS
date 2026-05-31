// data/dummyBills.ts
import { dummyOrders, Order } from './dummyOrders';
import { Bill } from '@/types/bill';

const MOCK_PRICE_MAP: Record<string, number> = {
  '1': 55000, '2': 40000, '3': 65000,
  '4': 45000, '5': 15000, '6': 55000,
  '7': 40000, '8': 120000, '9': 35000,
};

function buildBillsFromOrders(): Record<string, Bill> {
  const billsMap: Record<string, Bill> = {};

  dummyOrders.forEach(order => {
    const { tableId } = order;
    if (!billsMap[tableId]) {
      // khớp với Bill type mới — để service tự tính lại totals
      billsMap[tableId] = {
        tableId,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        totalAmount: 0,
      };
    }

    order.items.forEach(item => {
      const price = MOCK_PRICE_MAP[item.id] ?? 50000;
      billsMap[tableId].items.push({
        id: item.id,
        name: item.name,
        price,
        quantity: item.quantity,
        notes: item.notes,
      });
    });
  });

  return billsMap;
}

// ── exports mà service cần ──────────────────────────────

export function getBillByTable(tableId: string): Bill | undefined {
  const bills = buildBillsFromOrders();
  return bills[tableId];
}

export function checkoutTableInMock(tableId: string): boolean {
  // tìm order của bàn và đánh dấu done
  const hasOrder = dummyOrders.some(o => o.tableId === tableId);
  if (!hasOrder) return false;

  dummyOrders.forEach(order => {
    if (order.tableId === tableId) order.status = 'done';
  });
  return true;
}