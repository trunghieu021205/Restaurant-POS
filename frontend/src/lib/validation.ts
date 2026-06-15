// lib/validation.ts
export interface CustomerFormData {
  customerName: string;
  customerPhone: string;
}

export interface FormErrors {
  customerName?: string;
  customerPhone?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/**
 * Validate customer name
 * @param name - Customer name to validate
 * @returns Error message or undefined if valid
 */
export function validateCustomerName(name: string): string | undefined {
  const trimmed = name?.trim() || "";

  if (!trimmed) {
    return "Vui lòng nhập họ tên của bạn";
  }
  if (trimmed.length < 2) {
    return "Họ tên phải có ít nhất 2 ký tự";
  }
  if (trimmed.length > 100) {
    return "Họ tên không được vượt quá 100 ký tự";
  }
  return undefined;
}

/**
 * Validate phone number (Vietnamese format)
 * @param phone - Phone number to validate
 * @returns Error message or undefined if valid
 */
export function validateCustomerPhone(phone: string): string | undefined {
  const trimmed = phone?.trim() || "";

  if (!trimmed) {
    return "Vui lòng nhập số điện thoại";
  }
  if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(trimmed)) {
    return "Số điện thoại không hợp lệ (VD: 0901234567)";
  }
  return undefined;
}

/**
 * Validate full customer form
 * @param data - Customer form data
 * @returns Validation result with isValid flag and errors object
 */
export function validateCustomerForm(data: CustomerFormData): ValidationResult {
  const errors: FormErrors = {};

  const nameError = validateCustomerName(data.customerName);
  if (nameError) errors.customerName = nameError;

  const phoneError = validateCustomerPhone(data.customerPhone);
  if (phoneError) errors.customerPhone = phoneError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize phone number input (only digits and +)
 * @param value - Raw input value
 * @returns Sanitized phone string
 */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, "");
}