import React from 'react';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  fallbackColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  fallbackColor,
  className,
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center
    overflow-hidden bg-gray-100
    text-gray-600 font-medium select-none
  `;

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
    '2xl': 'w-16 h-16 text-xl',
  };

  const statusSizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusPositionStyles = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const statusColorStyles = {
    online: 'bg-success-500',
    offline: 'bg-gray-300',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getBackgroundColor = () => {
    if (fallbackColor) return fallbackColor;
    
    const colors = [
      theme.colors.primary[500],
      theme.colors.success[500],
      theme.colors.warning[500],
      theme.colors.error[500],
      theme.colors.gray[500],
    ];
    
    if (name) {
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    }
    
    return theme.colors.gray[300];
  };

  return (
    <div
      className={cn(
        baseStyles,
        shapeStyles[shape],
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: !src && getBackgroundColor(),
        color: !src ? theme.colors.white : undefined,
      }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <svg
          className="w-3/5 h-3/5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      )}
      
      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white',
            statusSizeStyles[size],
            statusPositionStyles[statusPosition],
            statusColorStyles[status]
          )}
        />
      )}
    </div>
  );
};

// Avatar Group
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 3,
  size = 'md',
  spacing = 'tight',
  children,
  className,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const spacingStyles = {
    tight: '-space-x-2',
    normal: '-space-x-1',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        spacingStyles[spacing],
        className
      )}
      {...props}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative border-2 border-white rounded-full"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {React.isValidElement(child) &&
            React.cloneElement(child as React.ReactElement<AvatarProps>, {
              size,
            })}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className="relative border-2 border-white rounded-full"
          style={{ zIndex: 0 }}
        >
          <Avatar
            size={size}
            name={`+${remainingCount}`}
            fallbackColor={theme.colors.gray[300]}
          />
        </div>
      )}
    </div>
  );
};

// Styled version
export const getAvatarStyles = (size: AvatarProps['size'] = 'md') => {
  const base = {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[100],
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.medium,
    userSelect: 'none' as const,
  };

  const sizes = {
    xs: {
      width: '24px',
      height: '24px',
      fontSize: theme.typography.fontSize.xs,
    },
    sm: {
      width: '32px',
      height: '32px',
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      width: '40px',
      height: '40px',
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      width: '48px',
      height: '48px',
      fontSize: theme.typography.fontSize.base,
    },
    xl: {
      width: '56px',
      height: '56px',
      fontSize: theme.typography.fontSize.lg,
    },
    '2xl': {
      width: '64px',
      height: '64px',
      fontSize: theme.typography.fontSize.xl,
    },
  };

  return {
    ...base,
    ...sizes[size],
  };
};