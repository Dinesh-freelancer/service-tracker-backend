import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={twMerge(
          clsx(
            'w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-600',
            className
          )
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
