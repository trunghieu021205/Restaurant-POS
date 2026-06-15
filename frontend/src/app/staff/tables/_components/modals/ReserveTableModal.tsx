"use client";

import { useState } from "react";
import {
  validateCustomerForm,
  sanitizePhoneNumber,
  type FormErrors,
} from "@/lib/validation";

interface Props {
  table: { number: number };
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

export default function ReserveTableModal({
  table,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<{
    customerName: boolean;
    customerPhone: boolean;
  }>({
    customerName: false,
    customerPhone: false,
  });

  const validateForm = (): boolean => {
    const { isValid, errors } = validateCustomerForm({
      customerName,
      customerPhone,
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleFieldBlur = (field: "customerName" | "customerPhone") => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormTouched({
      customerName: true,
      customerPhone: true,
    });

    if (!validateForm()) {
      return;
    }

    onSubmit(customerName, customerPhone);
  };

  const handlePhoneChange = (value: string) => {
    const sanitized = sanitizePhoneNumber(value);
    setCustomerPhone(sanitized);
    if (formTouched.customerPhone) validateForm();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-card bg-white p-5 shadow-modal"
      >
        <h2 className="text-lg font-bold text-neutral-900">
          Đặt trước bàn {table.number}
        </h2>

        <div className="mt-4 space-y-4">
          {/* Customer Name Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Họ tên <span className="text-error-500">*</span>
              <input
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (formTouched.customerName) validateForm();
                }}
                onBlur={() => handleFieldBlur("customerName")}
                className={`mt-1 w-full rounded-btn border px-3 py-2 outline-none transition-colors ${
                  formTouched.customerName && formErrors.customerName
                    ? "border-error-500 focus:border-error-500 bg-error-50"
                    : "border-neutral-200 focus:border-primary-500"
                }`}
                placeholder="Nguyễn Văn A"
              />
            </label>
            {formTouched.customerName && formErrors.customerName && (
              <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.customerName}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Số điện thoại <span className="text-error-500">*</span>
              <input
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleFieldBlur("customerPhone")}
                className={`mt-1 w-full rounded-btn border px-3 py-2 outline-none transition-colors ${
                  formTouched.customerPhone && formErrors.customerPhone
                    ? "border-error-500 focus:border-error-500 bg-error-50"
                    : "border-neutral-200 focus:border-primary-500"
                }`}
                placeholder="0901234567"
                inputMode="tel"
              />
            </label>
            {formTouched.customerPhone && formErrors.customerPhone && (
              <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.customerPhone}
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-400">
              Định dạng: 0901234567 hoặc +84901234567
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-neutral-200 px-4 py-2 text-sm transition-colors hover:bg-neutral-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-btn bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đặt..." : "Đặt trước"}
          </button>
        </div>
      </form>
    </div>
  );
}
