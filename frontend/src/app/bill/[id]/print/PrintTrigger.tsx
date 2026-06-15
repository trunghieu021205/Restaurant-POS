"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => window.print()}
        className="w-full rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        In hóa đơn
      </button>
    </div>
  );
}
