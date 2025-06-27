import React from 'react';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-full
    transition-all duration-150
  `;

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-primary-50 text-primary-700 border border-primary-200',
    success: 'bg-success-50 text-success-700 border border-success-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    error: 'bg-error-50 text-error-700 border border-error-200',
    gray: 'bg-gray-50 text-gray-600 border border-gray-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gray: 'bg-gray-400',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2 h-2',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full',
            dotColors[variant],
            dotSizes[size]
          )}
        />
      )}
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </span>
  );
};

// Badge Group
export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  gap = 'md',
  children,
  className,
  ...props
}) => {
  const gapStyles = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center flex-wrap',
        gapStyles[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Styled version
export const getBadgeStyles = (
  variant: BadgeProps['variant'] = 'default',
  size: BadgeProps['size'] = 'md'
) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.full,
    transition: 'all 150ms ease',
    border: '1px solid',
  };

  const variants = {
    default: {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.gray[700],
      borderColor: theme.colors.gray[200],
    },
    primary: {
      backgroundColor: theme.colors.primary[50],
      color: theme.colors.primary[700],
      borderColor: theme.colors.primary[200],
    },
    success: {
      backgroundColor: theme.colors.success[50],
      color: theme.colors.success[700],
      borderColor: theme.colors.success[200],
    },
    warning: {
      backgroundColor: theme.colors.warning[50],
      color: theme.colors.warning[700],
      borderColor: theme.colors.warning[200],
    },
    error: {
      backgroundColor: theme.colors.error[50],
      color: theme.colors.error[700],
      borderColor: theme.colors.error[200],
    },
    gray: {
      backgroundColor: theme.colors.gray[50],
      color: theme.colors.gray[600],
      borderColor: theme.colors.gray[200],
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[0.5]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
      gap: theme.spacing[1],
    },
    md: {
      padding: `${theme.spacing[1]} ${theme.spacing[2.5]}`,
      fontSize: theme.typography.fontSize.sm,
      gap: theme.spacing[1.5],
    },
    lg: {
      padding: `${theme.spacing[1.5]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      gap: theme.spacing[1.5],
    },
  };

  return {
    ...base,
    ...variants[variant],
    ...sizes[size],
  };
};