'use client';

import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    error instanceof Error
      ? error.message
      : 'Có lỗi không xác định xảy ra. Vui lòng thử lại.';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:px-6 md:py-12 text-center animate-slideDown">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-error-500" />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-error-600">
          Đã xảy ra lỗi
        </h2>

        <p className="text-sm md:text-base text-neutral-600 wrap-break-words">
          {message}
        </p>

        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center px-(--spacing-button-px) py-(--spacing-button-py) bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-btn transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
