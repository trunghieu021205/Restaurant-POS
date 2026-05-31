import { Bill } from '@/types/bill';
import { getBillByTable, checkoutTableInMock } from '@/data/dummyBills';

const VAT_RATE = 0.08;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function computeBillTotals(items: Bill['items']): Pick<Bill, 'subtotal' | 'vatAmount' | 'totalAmount'> {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const vatAmount = Math.round(subtotal * VAT_RATE);
  return { subtotal, vatAmount, totalAmount: subtotal + vatAmount };
}

export async function fetchBill(tableId: string): Promise<Bill> {
  await delay(300);
  const raw = getBillByTable(tableId);

  if (!raw) {
    return { tableId, items: [], subtotal: 0, vatAmount: 0, totalAmount: 0 };
  }

  const totals = computeBillTotals(raw.items);
  return { ...raw, ...totals };
}

export async function checkoutTable(tableId: string): Promise<{ success: boolean }> {
  await delay(500);
  const success = checkoutTableInMock(tableId);
  if (!success) throw new Error('Thanh toán thất bại');
  return { success: true };
}