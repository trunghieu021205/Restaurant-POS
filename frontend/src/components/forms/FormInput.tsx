'use client';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  autoComplete?: string;
}

export default function FormInput<T extends FieldValues>({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  autoComplete,
}: FormInputProps<T>) {
  const { ref, ...rest } = register(name);
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        ref={ref}
        {...rest}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-4 py-2.5 border rounded-btn bg-white text-neutral-800 placeholder-neutral-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-colors ${
          error ? 'border-error-500 focus:ring-error-400 focus:border-error-400' : 'border-neutral-300'
        }`}
      />
      {error && (
        <p className="text-error-500 text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
