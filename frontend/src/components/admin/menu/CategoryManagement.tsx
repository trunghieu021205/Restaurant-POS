// components/admin/menu/CategoryManagement.tsx
"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Category } from "@/types/menu";
import { CategoryForm } from "./CategoryForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Plus, Edit2, Trash2, Tag, X } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category";

interface CategoryManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCategoriesChange: () => void;
}

export function CategoryManagement({
  open,
  onOpenChange,
  categories,
  onCategoriesChange,
}: CategoryManagementProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(data);
        toast.success("Thêm danh mục thành công!");
      }
      setFormOpen(false);
      setEditingCategory(null);
      onCategoriesChange();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi lưu danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await deleteCategory(deletingCategory.id);
      toast.success("Xóa danh mục thành công!");
      setDeleteOpen(false);
      setDeletingCategory(null);
      onCategoriesChange();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi xóa danh mục");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-2xl p-0">
          <div className="relative bg-white h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">
                    Quản lý danh mục
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Thêm, sửa, xóa danh mục món ăn
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 px-4 sm:px-6 py-5">
              <div className="space-y-4">
                {/* Add button */}
                <Button
                  onClick={handleAddNew}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm danh mục mới</span>
                </Button>

                {/* Categories list */}
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
                      <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500">Chưa có danh mục nào</p>
                      <p className="text-sm text-neutral-400 mt-1">
                        Nhấn "Thêm danh mục mới" để bắt đầu
                      </p>
                    </div>
                  ) : (
                    categories
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((category) => (
                        <div
                          key={category.id}
                          className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-neutral-800 wrap-break-word">
                                  {category.name}
                                </h3>
                                {!category.isActive && (
                                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-xs rounded-full shrink-0">
                                    Đã ẩn
                                  </span>
                                )}
                              </div>
                              {category.description && (
                                <p className="text-sm text-neutral-500 mb-2 line-clamp-2 wrap-break-word">
                                  {category.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span>Thứ tự: {category.orderIndex}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="h-9 w-9 p-0 md:h-10 md:w-10 hover:bg-primary-50 hover:text-primary-600"
                              >
                                <Edit2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category)}
                                className="h-9 w-9 p-0 md:h-10 md:w-10 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <CategoryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCategory?.name || ""}
        isLoading={isDeleting}
      />
    </>
  );
}
