import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasIcon = !!icon;

    const baseInputStyles = `
      w-full px-3.5 py-2.5 text-gray-900
      bg-white border rounded-lg
      placeholder:text-gray-500
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-all duration-150
    `;

    const inputStyles = cn(
      baseInputStyles,
      hasError
        ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      hasIcon && iconPosition === 'left' && 'pl-10',
      hasIcon && iconPosition === 'right' && 'pr-10',
      className
    );

    const containerStyles = cn(
      'relative',
      fullWidth ? 'w-full' : 'inline-block'
    );

    const iconStyles = cn(
      'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
      iconPosition === 'left' ? 'left-3' : 'right-3'
    );

    return (
      <div className={containerStyles}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className={iconStyles}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputStyles}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
        </div>
        
        {(error || helperText) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const baseTextareaStyles = `
      w-full px-3.5 py-2.5 text-gray-900
      bg-white border rounded-lg
      placeholder:text-gray-500
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-all duration-150
    `;

    const textareaStyles = cn(
      baseTextareaStyles,
      hasError
        ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      resize === 'none' && 'resize-none',
      resize === 'vertical' && 'resize-y',
      resize === 'horizontal' && 'resize-x',
      resize === 'both' && 'resize',
      className
    );

    const containerStyles = cn(
      fullWidth ? 'w-full' : 'inline-block'
    );

    return (
      <div className={containerStyles}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={textareaStyles}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        
        {(error || helperText) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Styled version using theme
export const getInputStyles = (hasError: boolean) => ({
  input: {
    width: '100%',
    padding: `0.625rem 0.875rem`, // 10px 14px
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
    color: theme.colors.gray[900],
    backgroundColor: theme.colors.white,
    border: `1px solid ${hasError ? theme.colors.error[300] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.lg,
    transition: 'all 150ms ease',
    
    '&::placeholder': {
      color: theme.colors.gray[500],
    },
    
    '&:focus': {
      outline: 'none',
      borderColor: hasError ? theme.colors.error[500] : theme.colors.primary[500],
      boxShadow: `0 0 0 3px ${hasError ? theme.colors.error[100] : theme.colors.primary[100]}`,
    },
    
    '&:disabled': {
      backgroundColor: theme.colors.gray[50],
      color: theme.colors.gray[500],
      cursor: 'not-allowed',
    },
  },
  
  label: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: '0.375rem', // 6px = 1.5 * 4px
  },
  
  helperText: {
    marginTop: '0.375rem', // 6px = 1.5 * 4px
    fontSize: theme.typography.fontSize.sm,
    color: hasError ? theme.colors.error[600] : theme.colors.gray[500],
  },
});