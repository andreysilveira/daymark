import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-md bg-surface border ${
              error ? 'border-danger' : 'border-border'
            } text-text-primary placeholder:text-text-muted px-3 py-1.5 text-sm transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent ${
              icon ? 'pl-9' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
