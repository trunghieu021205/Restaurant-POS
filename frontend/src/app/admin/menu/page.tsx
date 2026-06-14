"use client";

import { useState, useEffect, useCallback } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";
import { MenuCard } from "@/components/admin/menu/MenuCard";
import { MenuForm } from "@/components/admin/menu/MenuForm";
import { DeleteConfirmDialog } from "@/components/admin/menu/DeleteConfirmDialog";
import { MenuToolbar } from "@/components/admin/menu/MenuToolbar";
import { Pagination } from "@/components/admin/menu/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { MenuItem, MenuFormData, MenuFilters } from "@/types/menu";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AlertCircle, UtensilsCrossed } from "lucide-react";
import { hasRole } from "@/lib/roles";
import { toast } from "@/lib/toast";

import { adminMenuService, PaginatedMenuResponse } from "@/services/adminMenu";

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [filters, setFilters] = useState<MenuFilters>({
    search: "",
    category: "all",
    status: "all",
    page: 1,
    limit: 8,
  });

  const [menuData, setMenuData] = useState<PaginatedMenuResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // SỬ DỤNG LẠI HOOK USECATEGORIES (Đã được test ổn định)
  const { categories, categoryMap } = useCategories(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await adminMenuService.getAll(filters);
      setMenuData(data);
    } catch (error) {
      console.error("Lỗi lấy thực đơn:", error);
      setIsError(true);
      toast.error("Không thể tải danh sách món ăn");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchMenu();
    }
  }, [fetchMenu, authLoading, user]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== "admin") {
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

  const handleFormSubmit = async (data: MenuFormData & { imageFile?: File }) => {
    try {
      const selectedCat = categories?.find(c => c.name === data.category);
      if (selectedCat) {
        // Đảm bảo lấy đúng ID kể cả khi trường bị map thành _id
        data.categoryId = selectedCat.id || (selectedCat as any)._id; 
      }

      if (editingItem) {
        setIsUpdating(true);
        await adminMenuService.update(editingItem.id, data);
        toast.success("Cập nhật món ăn thành công!");
      } else {
        setIsCreating(true);
        await adminMenuService.create(data);
        toast.success("Thêm món ăn thành công!");
      }
      setFormOpen(false);
      fetchMenu();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi lưu món ăn");
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await adminMenuService.delete(deletingItem.id);
      toast.success("Xóa món ăn thành công!");
      setDeleteOpen(false);
      setDeletingItem(null);
      fetchMenu();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi xóa món ăn");
    } finally {
      setIsDeleting(false);
    }
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
            <h1 className="text-2xl font-bold text-neutral-800">Quản lý thực đơn</h1>
            <p className="text-sm text-neutral-500">Thêm, sửa, xóa món ăn trong thực đơn</p>
          </div>
        </div>

        <MenuToolbar
          filters={filters}
          onSearchChange={(search) => setFilters(prev => ({ ...prev, search, page: 1 }))}
          onCategoryChange={(category) => setFilters(prev => ({ ...prev, category, page: 1 }))}
          onStatusChange={(status: any) => setFilters(prev => ({ ...prev, status, page: 1 }))}
          onAddNew={handleAddNew}
          total={menuData?.total}
          categories={categories || []}
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
              <p className="text-sm text-neutral-500 mt-1">Vui lòng thử lại sau</p>
            </div>
          ) : !menuData || !menuData.items || menuData.items.length === 0 ? (
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
                {menuData.items.map((item) => {
                  // BẢO VỆ CRASH: Chuẩn hóa categoryId và ID trong trường hợp Backend gởi object từ hàm populate
                  const safeId = item.id || (item as any)._id;
                  const safeCategoryId = typeof item.categoryId === 'object' && item.categoryId !== null 
                                  ? (item.categoryId as any)._id || (item.categoryId as any).id 
                                  : item.categoryId;
                  
                  const normalizedItem = {
                    ...item,
                    id: safeId,
                    categoryId: safeCategoryId
                  };

                  return (
                    <MenuCard
                      key={safeId}
                      item={normalizedItem}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      categoryMap={categoryMap || {}}
                    />
                  );
                })}
              </div>
              <Pagination
                page={menuData.page}
                totalPages={menuData.totalPages}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
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
          categories={categories || []}
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