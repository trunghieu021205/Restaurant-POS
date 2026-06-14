'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FormInput from '@/components/forms/FormInput';
import useAuthStore from '@/stores/auth';
import { authService } from '@/services/auth';
import { startProactiveRefresh } from '@/services/apiClient';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      const response = await authService.login(data);
      setAuth(response.token, response.user, response.refreshToken);
      
      // Start proactive token refresh for staff and admin users
      if (response.refreshToken && ['staff', 'admin'].includes(response.user.role)) {
        startProactiveRefresh();
      }
      
      if (response.user && response.user.role === 'admin') {
        console.log("🎉 Quyền Admin được xác thực thành công. Điều hướng về Dashboard Thống kê...");
        router.push('/admin');
      } else {
        router.push('/');
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-2xl font-bold text-primary-600 mb-4"
            >
              <span className="text-3xl">🍕</span>
              <span>Restaurant</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">
              Chào mừng trở lại
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Đăng nhập để tiếp tục
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-btn bg-error-500/10 border border-error-500/30 text-error-500 text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register as any}
              error={errors.email}
              placeholder="example@email.com"
              autoComplete="email"
            />

            <FormInput
              label="Mật khẩu"
              name="password" 
              type="password"
              register={register as any}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium rounded-btn transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
