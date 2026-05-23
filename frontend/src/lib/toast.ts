import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
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
  toast.error(message, {
    style: {
      background: 'var(--color-error-50)',
      color: 'var(--color-error-600)',
      borderRadius: 'var(--radius-btn)',
      fontSize: '0.875rem',
    },
  });
};