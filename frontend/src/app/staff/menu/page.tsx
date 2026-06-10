"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { updateMenuAvailability } from "@/services/menu";
import { hasRole } from "@/lib/roles";

async function updateAvailability(id: string, isAvailable: boolean) {
  return updateMenuAvailability(id, isAvailable);
}

export default function StaffMenuPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const queryClient = useQueryClient();
  const { menuItems, isLoading, isError, error, refetch } = useTodayMenu();

  const [busyId, setBusyId] = useState<string | null>(null);

  const canAccess = hasRole(user, ["staff", "admin"]);

  const mutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      updateAvailability(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "today"] });
      toast.success("Đã cập nhật trạng thái món");
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật trạng thái thất bại",
      );
    },
    onSettled: () => setBusyId(null),
  });

  const items = useMemo(() => menuItems, [menuItems]);

  if (!authLoading && !canAccess) {
    router.push("/");
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3 px-4">
        <p className="text-red-500 font-medium">Không thể tải menu hôm nay</p>
        <p className="text-sm text-neutral-400">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-card text-sm hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <span className="text-xl">🧑‍🍳</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Cập nhật còn/hết món (Today)
            </h1>
            <p className="text-sm text-neutral-500">
              Staff chỉ được đổi trạng thái còn/hết của món đang bật hôm nay.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 shadow-card">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-neutral-500 text-lg">Chưa có món hôm nay</p>
            <p className="text-sm text-neutral-400 mt-1">
              Vui lòng kiểm tra lại sau
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => {
              const busy = busyId === item.id || mutation.isPending;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-card border border-neutral-100 p-4 flex flex-col gap-3"
                >
                  <div className="min-h-[56px]">
                    <p className="font-semibold text-neutral-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {typeof item.category === "object"
                        ? item.category.name
                        : item.category ?? ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">
                      {item.isAvailable ? "Còn" : "Hết"}
                    </span>
                    <span className="text-sm text-neutral-400">
                      {item.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      disabled={busy}
                      onClick={() =>
                        mutation.mutate({
                          id: item.id,
                          next: true,
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        item.isAvailable
                          ? "bg-primary-50 border-primary-200 text-primary-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      Còn
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        mutation.mutate({
                          id: item.id,
                          next: false,
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        !item.isAvailable
                          ? "bg-error-50 border-error-200 text-error-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      Hết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
