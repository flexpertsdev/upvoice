import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  motionProps?: HTMLMotionProps<'div'>;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      children,
      className,
      motionProps,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-white rounded-xl
      transition-all duration-300
    `;

    const variantStyles = {
      default: 'border border-gray-200',
      bordered: 'border-2 border-gray-300',
      elevated: 'shadow-lg border border-gray-100',
      interactive: `
        border border-gray-200 cursor-pointer
        hover:shadow-lg hover:border-gray-300
        active:shadow-md
      `,
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const Component = variant === 'interactive' ? motion.div : 'div';

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref}
          className={cn(
            baseStyles,
            variantStyles[variant],
            paddingStyles[padding],
            className
          )}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between mb-4',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Body
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  divider = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-end gap-3',
        divider && 'pt-4 border-t border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Styled version
export const getCardStyles = (variant: CardProps['variant'] = 'default') => {
  const base = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['2xl'],
    transition: 'all 300ms ease',
  };

  const variants = {
    default: {
      border: `1px solid ${theme.colors.gray[200]}`,
    },
    bordered: {
      border: `2px solid ${theme.colors.gray[300]}`,
    },
    elevated: {
      border: `1px solid ${theme.colors.gray[100]}`,
      boxShadow: theme.boxShadow.lg,
    },
    interactive: {
      border: `1px solid ${theme.colors.gray[200]}`,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: theme.boxShadow.lg,
        borderColor: theme.colors.gray[300],
        transform: 'translateY(-2px)',
      },
      '&:active': {
        boxShadow: theme.boxShadow.md,
        transform: 'translateY(0)',
      },
    },
  };

  return {
    ...base,
    ...variants[variant],
  };
};