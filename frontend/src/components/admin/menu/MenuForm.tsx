// components/admin/menu/MenuForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ImageUpload } from "./ImageUpload";
import { MenuFormData, MenuItem } from "@/types/menu";
import { useCategories } from "@/hooks/useCategories";
import { X, Save } from "lucide-react";

interface MenuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuFormData) => Promise<void>;
  initialData?: MenuItem | null;
  isLoading?: boolean;
}

export function MenuForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: MenuFormProps) {
  const isEditing = !!initialData;
  const { categories, isLoading: categoriesLoading } = useCategories(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormData>({
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      categoryId: "",
      isAvailable: true,
      isVisibleToday: false,
    },
  });

  const imageUrlValue = watch("imageUrl");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        price: initialData.price,
        description: initialData.description,
        imageUrl: initialData.imageUrl,
        categoryId: initialData.categoryId,
        isAvailable: initialData.isAvailable,
        isVisibleToday: initialData.isVisibleToday ?? false,
      });
    } else {
      reset({
        name: "",
        price: 0,
        description: "",
        imageUrl: "",
        categoryId: "",
        isAvailable: true,
        isVisibleToday: false,
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = async (data: MenuFormData) => {
    await onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="w-full max-w-3xl lg:max-w-4xl p-0">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden mx-4 w-full max-w-3xl lg:max-w-4xl">
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800">
                {isEditing ? "✏️ Chỉnh sửa món ăn" : "🍽️ Thêm món mới"}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 px-4 sm:px-6 py-5 bg-white">
              <form
                id="menu-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5">
                  {/* Tên món */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Tên món <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name", {
                        required: "Tên món không được để trống",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800"
                      placeholder="Nhập tên món ăn"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Giá */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Giá (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("price", {
                        required: "Giá không được để trống",
                        min: { value: 1000, message: "Giá tối thiểu 1,000đ" },
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800"
                      placeholder="Nhập giá"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800 resize-none"
                      placeholder="Mô tả ngắn về món ăn"
                    />
                  </div>

                  {/* Danh mục & Trạng thái */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Danh mục
                      </label>
                      <select
                        {...register("categoryId")}
                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-800"
                        disabled={categoriesLoading}
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Trạng thái
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register("isAvailable")}
                            className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">
                            Còn món
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Món hôm nay
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register("isVisibleToday")}
                            className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">
                            Hiển thị hôm nay
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Upload ảnh */}
                  <ImageUpload
                    value={imageUrlValue || ""}
                    onChange={(url) =>
                      setValue("imageUrl", url, { shouldDirty: true })
                    }
                  />
                </div>
              </form>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex gap-3 justify-end">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                form="menu-form"
                disabled={isLoading || isSubmitting}
                className="bg-primary-500 hover:bg-primary-600 text-white gap-2"
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Cập nhật" : "Thêm món"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
