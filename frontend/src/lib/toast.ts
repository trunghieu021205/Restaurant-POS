// lib/toast.ts
import baseToast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  baseToast.success(message, {
    icon: '🛒',
    style: {
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary-800)',
      borderRadius: 'var(--radius-btn)',
      fontSize: '0.875rem',
    },
  });
};

export const showErrorToast = (message: string) => {
  baseToast.error(message, {
    style: {
      background: 'var(--color-error-500)',
      color: 'var(--color-neutral-800)',
      borderRadius: 'var(--radius-btn)',
      fontSize: '0.875rem',
    },
  });
};

// 👇 Thêm helper cảnh báo (ví dụ khi đơn mới nhưng chưa phải new order)
export const showWarningToast = (message: string) => {
  baseToast(message, {
    icon: '⚠️',
    style: {
      background: 'var(--color-warning-500)',
      color: 'var(--color-neutral-800)',
      borderRadius: 'var(--radius-btn)',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  });
};

// 👇 Toast dành riêng khi có đơn mới (nổi bật, hiển thị lâu)
export const showNewOrderToast = (tableId: string) => {
  baseToast(`Đơn mới từ bàn ${tableId}!`, {
    icon: '🔔',
    duration: 5000,
    style: {
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary-800)',
      borderRadius: 'var(--radius-btn)',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  });
};

// 👇 Export object toast để dùng như toast.success(), toast.error(), ...
export const toast = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  newOrder: showNewOrderToast,
};