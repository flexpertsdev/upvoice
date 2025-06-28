import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  motionProps?: HTMLMotionProps<'button'>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      motionProps,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-medium rounded-lg transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantStyles = {
      primary: `
        bg-primary-600 text-white hover:bg-primary-700
        focus:ring-primary-500 active:bg-primary-800
      `,
      secondary: `
        bg-white text-gray-700 border border-gray-300
        hover:bg-gray-50 focus:ring-primary-500
        active:bg-gray-100
      `,
      outline: `
        bg-transparent text-primary-600 border-2 border-primary-600
        hover:bg-primary-50 focus:ring-primary-500
        active:bg-primary-100
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100 focus:ring-gray-500
        active:bg-gray-200
      `,
      danger: `
        bg-error-600 text-white hover:bg-error-700
        focus:ring-error-500 active:bg-error-800
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-5 py-3 text-base gap-2',
      xl: 'px-6 py-3.5 text-base gap-2.5',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...motionProps}
        {...props}
        style={{
          ...props.style,
          ...motionProps?.style,
        }}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 absolute"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Styled components approach (using CSS-in-JS)
const getButtonStyles = (props: ButtonProps) => {
  const { variant = 'primary', size = 'md' } = props;
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.lg,
    transition: 'all 150ms ease',
    cursor: 'pointer',
    position: 'relative' as const,
    border: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.white,
      '&:hover': {
        backgroundColor: theme.colors.primary[700],
      },
      '&:active': {
        backgroundColor: theme.colors.primary[800],
      },
    },
    secondary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.gray[700],
      border: `1px solid ${theme.colors.gray[300]}`,
      '&:hover': {
        backgroundColor: theme.colors.gray[50],
      },
      '&:active': {
        backgroundColor: theme.colors.gray[100],
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `2px solid ${theme.colors.primary[600]}`,
      '&:hover': {
        backgroundColor: theme.colors.primary[50],
      },
      '&:active': {
        backgroundColor: theme.colors.primary[100],
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.gray[700],
      '&:hover': {
        backgroundColor: theme.colors.gray[100],
      },
      '&:active': {
        backgroundColor: theme.colors.gray[200],
      },
    },
    danger: {
      backgroundColor: theme.colors.error[600],
      color: theme.colors.white,
      '&:hover': {
        backgroundColor: theme.colors.error[700],
      },
      '&:active': {
        backgroundColor: theme.colors.error[800],
      },
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      gap: '0.375rem', // 6px = 1.5 * 4px
    },
    md: {
      padding: `0.625rem ${theme.spacing[4]}`, // 10px 16px
      fontSize: theme.typography.fontSize.sm,
      gap: theme.spacing[2],
    },
    lg: {
      padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
      fontSize: theme.typography.fontSize.base,
      gap: theme.spacing[2],
    },
    xl: {
      padding: `0.875rem ${theme.spacing[6]}`, // 14px 24px
      fontSize: theme.typography.fontSize.base,
      gap: '0.625rem', // 10px = 2.5 * 4px
    },
  };

  return {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };
};