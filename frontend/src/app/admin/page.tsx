"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { adminStatsService, AdminStatsResponse } from "@/services/adminStats";
import { TrendingUp, CheckCircle, AlertCircle, RefreshCw, CreditCard, Clock, Utensils } from "lucide-react";
import { toast } from "@/lib/toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (mounted && !authLoading && user?.role === "admin") {
      fetchStats();
    }
  }, [mounted, authLoading, user]);

  if (!mounted || authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + ' đ';

  // Tính toán chiều cao max cho biểu đồ cột dựa vào doanh thu cao nhất
  const maxRevenue = stats?.chartData && stats.chartData.length > 0 
    ? Math.max(...stats.chartData.map(d => d.revenue), 1000) 
    : 1000;

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Dashboard Thống kê</h1>
            <p className="text-neutral-500 mt-1">Tổng quan doanh thu và nhật ký thanh toán thời gian thực</p>
          </div>
          <button 
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </button>
        </div>

        {isError ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-error-200 shadow-sm mb-8">
            <AlertCircle className="w-12 h-12 text-error-400 mx-auto mb-3" />
            <p className="text-error-600 font-medium">Lỗi tải dữ liệu từ Server</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0"><TrendingUp className="w-7 h-7 text-primary-600" /></div>
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase">Tổng Doanh Thu</p>
                  <h3 className="text-3xl font-bold text-neutral-800 mt-1">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-7 h-7 text-emerald-600" /></div>
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase">Đơn Hàng Thành Công</p>
                  <h3 className="text-3xl font-bold text-neutral-800 mt-1">{(stats?.paidOrders || 0).toLocaleString('vi-VN')} đơn</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><Clock className="w-7 h-7 text-amber-600" /></div>
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase">Đơn Đang Chờ</p>
                  <h3 className="text-3xl font-bold text-neutral-800 mt-1">{(stats?.pendingOrders || 0).toLocaleString('vi-VN')} đơn</h3>
                </div>
              </div>
            </div>

            {/* Khu vực Biểu Đồ Doanh Thu Tuần (Thuần CSS/Tailwind) */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-8">
              <h2 className="text-lg font-bold text-neutral-800 mb-6">Biểu đồ doanh thu các ngày gần nhất</h2>
              <div className="h-64 flex items-end gap-4 sm:gap-8 pt-4 border-b border-neutral-200 px-4">
                {stats?.chartData && stats.chartData.length > 0 ? (
                  stats.chartData.map((data, idx) => {
                    const percentage = (data.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip khi hover vào cột */}
                        <div className="absolute -top-6 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(data.revenue)}
                        </div>
                        {/* Cột đồ thị */}
                        <div 
                          style={{ height: `${Math.max(percentage, 6)}%` }}
                          className="w-full bg-primary-500 group-hover:bg-primary-600 rounded-t-md transition-all duration-500 shadow-sm"
                        />
                        <span className="text-xs font-medium text-neutral-500 mt-2 block h-5">{data._id}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">Chưa có dữ liệu đồ thị tuần</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bảng Payment Logs (Chiếm 2 phần diện tích) */}
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden lg:col-span-2">
                <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
                  <CreditCard className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-base font-bold text-neutral-800">Nhật ký thanh toán gần đây</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-neutral-100 text-neutral-400 text-xs font-semibold uppercase">
                        <th className="px-6 py-3">Mã đơn</th>
                        <th className="px-6 py-3">Vị trí</th>
                        <th className="px-6 py-3">Hình thức</th>
                        <th className="px-6 py-3 text-right">Số tiền</th>
                        <th className="px-6 py-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm text-neutral-600">
                      {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                        stats.recentPayments.map((log) => (
                          <tr key={log.orderId} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-neutral-400">...{log.orderId.substring(log.orderId.length - 6)}</td>
                            <td className="px-6 py-4 font-medium">{log.tableNumber === "Mang về" ? "Mang về" : `Bàn ${log.tableNumber}`}</td>
                            <td className="px-6 py-4 text-xs font-medium text-neutral-500">{log.paymentMethod}</td>
                            <td className="px-6 py-4 text-right font-bold text-neutral-800">{formatCurrency(log.totalAmount)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                log.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                log.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-600'
                              }`}>{log.status === 'paid' ? 'Thành công' : log.status === 'pending' ? 'Chờ duyệt' : log.status}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-8 text-center text-neutral-400">Chưa ghi nhận giao dịch nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Món ăn bán chạy (Chiếm 1 phần diện tích) */}
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
                  <Utensils className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-base font-bold text-neutral-800">Món bán chạy</h2>
                </div>
                <div className="p-6 divide-y divide-neutral-100">
                  {stats?.topItems && stats.topItems.length > 0 ? (
                    stats.topItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-800 text-sm">{item.name}</p>
                          <p className="text-xs text-neutral-400">Đã bán: <span className="font-bold text-neutral-600">{item.totalQuantity}</span> món</p>
                        </div>
                        <p className="font-bold text-primary-600 text-sm">{formatCurrency(item.totalSales)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-400 text-sm text-center py-6">Chưa có dữ liệu món ăn</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}