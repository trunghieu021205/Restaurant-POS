// components/admin/menu/CategoryForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Category } from "@/types/menu";
import { X, Tag, Save } from "lucide-react";

interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category | null;
  isLoading?: boolean;
}

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: CategoryFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      orderIndex: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        isActive: initialData.isActive,
        orderIndex: initialData.orderIndex,
      });
    } else {
      reset({
        name: "",
        description: "",
        isActive: true,
        orderIndex: 0,
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="p-0">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden w-full h-full">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-neutral-800">
                {isEditing ? (
                  <>✏️ Chỉnh sửa danh mục</>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                    Thêm danh mục mới
                  </div>
                )}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-200 transition-colors active:scale-95"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
              </button>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 px-4 py-4 sm:px-6 sm:py-5 bg-white">
              <form
                id="category-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  {/* Tên danh mục */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name", {
                        required: "Tên danh mục không được để trống",
                        minLength: {
                          value: 2,
                          message: "Tên danh mục phải có ít nhất 2 ký tự",
                        },
                        maxLength: {
                          value: 50,
                          message: "Tên danh mục không được quá 50 ký tự",
                        },
                      })}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800 text-sm sm:text-base"
                      placeholder="Nhập tên danh mục"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      {...register("description", {
                        maxLength: {
                          value: 200,
                          message: "Mô tả không được quá 200 ký tự",
                        },
                      })}
                      rows={3}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800 resize-none text-sm sm:text-base"
                      placeholder="Mô tả ngắn về danh mục"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Thứ tự hiển thị & Trạng thái */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        {...register("orderIndex", {
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: "Thứ tự hiển thị không được âm",
                          },
                          max: {
                            value: 999,
                            message: "Thứ tự hiển thị không được quá 999",
                          },
                        })}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800 text-sm sm:text-base"
                        placeholder="0"
                      />
                      {errors.orderIndex && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.orderIndex.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Trạng thái
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors">
                        <input
                          type="checkbox"
                          {...register("isActive")}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm text-neutral-700">
                          Danh mục hoạt động
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-neutral-200 bg-neutral-50 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end sticky bottom-0">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                form="category-form"
                disabled={isLoading || isSubmitting}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white gap-2 flex items-center justify-center text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
