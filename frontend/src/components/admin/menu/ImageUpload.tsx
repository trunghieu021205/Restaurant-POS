// components/admin/menu/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { uploadMenuImage } from "@/services/menu";
import { Button } from "@/components/ui/Button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string, file?: File) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMenuImage(file);
      onChange(url, file);
    } catch {
      alert("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">
        Hình ảnh món ăn
      </label>

      {value && value !== "" ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-neutral-200 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg" // thêm style cụ thể
            >
              <Upload className="w-4 h-4 mr-1" /> Đổi ảnh
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onChange("")}
              className="shadow-lg"
            >
              <X className="w-4 h-4 mr-1" /> Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
        >
          {isUploading ? (
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-sm text-neutral-500">
                Nhấn để tải ảnh lên
              </span>
              <span className="text-xs text-neutral-400 mt-1">
                PNG, JPG, WEBP
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
