"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Khởi tạo QueryClient chỉ một lần bằng useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 phút
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-primary-50)",
              color: "var(--color-primary-800)",
              borderRadius: "var(--radius-btn)",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "var(--color-success-500)",
                secondary: "white",
              },
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
