// components/admin/menu/DeleteConfirmDialog.tsx
"use client";

import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className="w-full max-w-md p-0 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-auto max-h-[90vh]"
      >
        <div className="p-5 sm:p-6">
          <div className="text-center">
            {/* Icon với gradient */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-error-100 to-error-50 shadow-sm">
              <AlertTriangle
                className="h-6 w-6 text-error-600"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">
              Xác nhận xóa món
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-medium text-neutral-900">“{itemName}”</span>
              ?
              <br />
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="sm:min-w-25"
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              disabled={isLoading}
              className="sm:min-w-25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Đang xóa...</span>
                </div>
              ) : (
                "Xóa"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
