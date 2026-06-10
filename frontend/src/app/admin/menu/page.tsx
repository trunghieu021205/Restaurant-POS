// app/admin/menu/page.tsx
"use client";

import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { MenuCard } from "@/components/admin/menu/MenuCard";
import { MenuForm } from "@/components/admin/menu/MenuForm";
import { DeleteConfirmDialog } from "@/components/admin/menu/DeleteConfirmDialog";
import { MenuToolbar } from "@/components/admin/menu/MenuToolbar";
import { Pagination } from "@/components/admin/menu/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { MenuItem, MenuFormData } from "@/types/menu";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AlertCircle, UtensilsCrossed } from "lucide-react";
import { hasRole } from "@/lib/roles";

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    filters,
    setSearch,
    setCategory,
    setStatus,
    setPage,
    menuData,
    isLoading,
    isError,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMenu({ limit: 8 });

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  if (!authLoading && !hasRole(user, ["admin"])) {
    router.push("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleAddNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: MenuFormData) => {
    if (editingItem) {
      await updateItem({ id: editingItem.id, data });
    } else {
      await createItem(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteItem(deletingItem.id);
    setDeleteOpen(false);
    setDeletingItem(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Quản lý thực đơn
            </h1>
            <p className="text-sm text-neutral-500">
              Thêm, sửa, xóa món ăn trong thực đơn
            </p>
          </div>
        </div>

        <MenuToolbar
          filters={filters}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
          onAddNew={handleAddNew}
          total={menuData?.total}
        />

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-error-200 shadow-card">
              <AlertCircle className="w-12 h-12 text-error-400 mx-auto mb-3" />
              <p className="text-error-600 font-medium">Lỗi tải dữ liệu</p>
              <p className="text-sm text-neutral-500 mt-1">
                Vui lòng thử lại sau
              </p>
            </div>
          ) : menuData?.items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 shadow-card">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-neutral-500 text-lg">Chưa có món ăn nào</p>
              <p className="text-sm text-neutral-400 mt-1">
                Nhấn &quot;Thêm món mới&quot; để bắt đầu
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {menuData!.items.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              <Pagination
                page={menuData!.page}
                totalPages={menuData!.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        <MenuForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingItem}
          isLoading={isCreating || isUpdating}
        />

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeletingItem(null);
          }}
          onConfirm={handleDeleteConfirm}
          itemName={deletingItem?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
