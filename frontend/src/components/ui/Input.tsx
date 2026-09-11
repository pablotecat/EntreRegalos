import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = '', 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref}
          {...props}
          id={inputId}
          aria-invalid={invalid ?? (error ? true : undefined)}
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500
            ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        />
        {error && <p id={errorId} className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
