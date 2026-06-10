"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { adminStatsService, AdminStatsResponse } from "@/services/adminStats";
import { TrendingUp, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // 🌟 KHỞI TẠO TIẾN TRÌNH PHÒNG THỦ HYDRATION DELAY:
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await adminStatsService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error("Lỗi lấy dữ liệu thống kê:", error);
      setIsError(true);
      toast.error(error.message || "Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ BẢO MẬT AN TOÀN: Chỉ quét quyền khi Client đã sẵn sàng và Zustand rehydrate xong
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!user || user.role !== "admin") {
      console.log("⚠️ Phát hiện truy cập trái phép hoặc chưa load xong token, điều hướng...");
      router.push("/");
    }
  }, [mounted, authLoading, user, router]);

  // ✅ KÍCH HOẠT FETCH: Khi xác nhận chuẩn xác quyền Admin
  useEffect(() => {
    if (mounted && !authLoading && user?.role === "admin") {
      fetchStats();
    }
  }, [mounted, authLoading, user]);

  // CHẶN MÀN HÌNH CHỚP (FLASH UI) KHI CHƯA KHỞI TẠO XONG
  if (!mounted || authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">
              Dashboard Thống kê
            </h1>
            <p className="text-neutral-500 mt-1">
              Tổng quan tình hình kinh doanh
            </p>
          </div>
          <button 
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Trạng thái Loading nội bộ */}
        {isLoading && !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 h-32 animate-pulse" />
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 h-32 animate-pulse" />
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-error-200 shadow-card mb-8">
            <AlertCircle className="w-12 h-12 text-error-400 mx-auto mb-3" />
            <p className="text-error-600 font-medium">Lỗi tải dữ liệu thống kê</p>
            <button 
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-error-50 text-error-600 rounded-lg font-medium hover:bg-error-100 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Thẻ Doanh thu */}
              <div className="bg-white p-6 rounded-2xl shadow-card border border-neutral-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">
                    Tổng Doanh Thu
                  </p>
                  <h3 className="text-3xl font-bold text-neutral-800">
                    {formatCurrency(stats.totalRevenue)}
                  </h3>
                </div>
              </div>

              {/* Thẻ Đơn hàng thành công */}
              <div className="bg-white p-6 rounded-2xl shadow-card border border-neutral-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">
                    Đơn Hàng Thành Công
                  </p>
                  <h3 className="text-3xl font-bold text-neutral-800">
                    {stats.paidOrders.toLocaleString('vi-VN')} <span className="text-lg font-normal text-neutral-500">đơn</span>
                  </h3>
                </div>
              </div>

            </div>

            {/* Bảng Top Selling Items */}
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                <h2 className="text-lg font-bold text-neutral-800">Top 5 Món Ăn Bán Chạy Nhất</h2>
              </div>
              
              {stats.topItems && stats.topItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-neutral-100">
                        <th className="px-6 py-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Hạng</th>
                        <th className="px-6 py-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Tên Món</th>
                        <th className="px-6 py-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Giá Bán</th>
                        <th className="px-6 py-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider text-right">Đã Bán</th>
                        <th className="px-6 py-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider text-right">Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {stats.topItems.map((item, index) => (
                        <tr key={item.menuItemId || index} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              index === 0 ? 'bg-amber-100 text-amber-700' : 
                              index === 1 ? 'bg-slate-100 text-slate-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-neutral-800">{item.name}</span>
                          </td>
                          <td className="px-6 py-4 text-neutral-600">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-neutral-800">{item.totalQuantity.toLocaleString('vi-VN')}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-primary-600">
                            {formatCurrency(item.totalSales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-neutral-500">Chưa có dữ liệu bán hàng nào để thống kê.</p>
                </div>
              )}
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
}