import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className,
  ...props
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const colorMap = {
    primary: theme.colors.primary[600],
    white: theme.colors.white,
    gray: theme.colors.gray[600],
  };

  const currentSize = sizeMap[size];
  const currentColor = colorMap[color];

  const renderSpinner = () => (
    <svg
      className={cn('animate-spin', className)}
      width={currentSize}
      height={currentSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={currentColor}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={currentColor}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => {
    const dotSize = currentSize / 4;
    const containerVariants = {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const dotVariants = {
      initial: { scale: 0.8, opacity: 0.5 },
      animate: {
        scale: [0.8, 1.2, 0.8],
        opacity: [0.5, 1, 0.5],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };

    return (
      <motion.div
        className={cn('flex gap-1', className)}
        variants={containerVariants}
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: currentColor,
            }}
            variants={dotVariants}
          />
        ))}
      </motion.div>
    );
  };

  const renderPulse = () => (
    <motion.div
      className={cn('rounded-full', className)}
      style={{
        width: currentSize,
        height: currentSize,
        backgroundColor: currentColor,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  const renderBars = () => {
    const barWidth = currentSize / 8;
    const barHeight = currentSize * 0.8;
    const barVariants = {
      initial: { scaleY: 0.5 },
      animate: {
        scaleY: [0.5, 1, 0.5],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };

    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            className="origin-center"
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: currentColor,
              borderRadius: barWidth / 2,
            }}
            variants={barVariants}
            initial="initial"
            animate="animate"
            transition={{ delay }}
          />
        ))}
      </div>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen'
      )}
      {...props}
    >
      {renderLoader()}
      {text && (
        <p
          className={cn(
            'text-sm font-medium',
            color === 'white' ? 'text-white' : 'text-gray-600'
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Loading Overlay
export interface LoadingOverlayProps extends LoadingProps {
  visible?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  ...props
}) => {
  if (!visible) return null;

  return (
    <motion.div
      className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loading {...props} />
    </motion.div>
  );
};

// Skeleton Loader
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...props
}) => {
  const variantStyles = {
    text: {
      height: height || '1em',
      borderRadius: theme.borderRadius.base,
    },
    circular: {
      borderRadius: theme.borderRadius.full,
    },
    rectangular: {
      borderRadius: theme.borderRadius.lg,
    },
  };

  const animationClass = animation === 'pulse' ? 'animate-pulse' : '';

  return (
    <div
      className={cn(
        'bg-gray-200',
        animationClass,
        className
      )}
      style={{
        width: width || '100%',
        height: height || '20px',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    />
  );
};

// Styled version
export const getLoadingStyles = (size: LoadingProps['size'] = 'md') => {
  const sizes = {
    sm: {
      width: '16px',
      height: '16px',
    },
    md: {
      width: '24px',
      height: '24px',
    },
    lg: {
      width: '32px',
      height: '32px',
    },
    xl: {
      width: '48px',
      height: '48px',
    },
  };

  return {
    spinner: {
      ...sizes[size],
      animation: 'spin 1s linear infinite',
    },
    dots: {
      display: 'flex',
      gap: theme.spacing[1],
    },
    pulse: {
      ...sizes[size],
      borderRadius: theme.borderRadius.full,
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    bars: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[1],
    },
  };
};