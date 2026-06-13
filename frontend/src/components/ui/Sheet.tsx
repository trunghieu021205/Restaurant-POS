"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Context
interface SheetContextValue {
  onOpenChange: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet compound components must be used within <Sheet>");
  }
  return context;
}

// Sheet (wrapper)
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Đóng khi nhấn Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown);
    else document.removeEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  return (
    <SheetContext.Provider value={{ onOpenChange }}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-(--z-modal) flex items-end justify-center sm:items-center">
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
            />
            {children}
          </div>
        )}
      </AnimatePresence>
    </SheetContext.Provider>
  );
}

// SheetContent
interface SheetContentProps {
  side?: "bottom" | "right" | "left" | "top" | "center";
  className?: string;
  children: React.ReactNode;
}

export function SheetContent({
  side = "right",
  className,
  children,
}: SheetContentProps) {
  const { onOpenChange } = useSheetContext();

  const variants = {
    hidden: {
      opacity: 0,
      scale: side === "center" ? 0.95 : 1,
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "bottom" ? "100%" : side === "top" ? "-100%" : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: side === "center" ? 0.95 : 1,
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "bottom" ? "100%" : side === "top" ? "-100%" : 0,
    },
  };

  const isCenter = side === "center";

  return (
    <motion.div
      className={cn(
        "fixed z-(--z-modal) bg-background shadow-lg flex flex-col",
        isCenter
          ? "inset-4 m-auto max-w-lg max-h-[90vh] rounded-2xl" // modal giữa
          : side === "bottom" && "inset-x-0 bottom-0 rounded-t-2xl",
        side === "right" && "inset-y-0 right-0 w-3/4 max-w-sm",
        side === "left" && "inset-y-0 left-0 w-3/4 max-w-sm",
        side === "top" && "inset-x-0 top-0 rounded-b-2xl",
        className,
      )}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Nút đóng (ẩn nếu side=center vì có thể tự tạo nút khác) – giữ lại hoặc ẩn tùy */}
      {!isCenter && (
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </motion.div>
  );
}

// SheetHeader
export function SheetHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left px-6 pt-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// SheetTitle
export function SheetTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

// SheetFooter
export function SheetFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 pb-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// SheetClose (nút đóng tùy chỉnh, có thể dùng thay cho nút mặc định)
export function SheetClose({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useSheetContext();
  return (
    <button
      onClick={() => onOpenChange(false)}
      className={cn("", className)}
      {...props}
    >
      {children}
    </button>
  );
}
