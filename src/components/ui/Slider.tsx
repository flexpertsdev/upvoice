import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  variant?: 'default' | 'gradient' | 'voting';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      onChangeEnd,
      label,
      showValue = false,
      showTicks = false,
      tickCount = 5,
      variant = 'default',
      size = 'md',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    const value = controlledValue ?? internalValue;
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = useCallback((newValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      const steppedValue = Math.round(clampedValue / step) * step;
      
      if (controlledValue === undefined) {
        setInternalValue(steppedValue);
      }
      onChange?.(steppedValue);
    }, [min, max, step, controlledValue, onChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (disabled) return;
      
      setIsDragging(true);
      const rect = sliderRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const newPercentage = (x / rect.width) * 100;
      const newValue = (newPercentage / 100) * (max - min) + min;
      handleChange(newValue);
    }, [disabled, min, max, handleChange]);

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = sliderRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newPercentage = (x / rect.width) * 100;
        const newValue = (newPercentage / 100) * (max - min) + min;
        handleChange(newValue);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onChangeEnd?.(value);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, min, max, value, handleChange, onChangeEnd]);

    const sizeStyles = {
      sm: {
        track: 'h-1',
        thumb: 'w-3 h-3',
        tick: 'h-2',
      },
      md: {
        track: 'h-1.5',
        thumb: 'w-4 h-4',
        tick: 'h-2.5',
      },
      lg: {
        track: 'h-2',
        thumb: 'w-5 h-5',
        tick: 'h-3',
      },
    };

    const getTrackColor = () => {
      if (variant === 'voting') {
        // For voting: -1 (red) to 0 (gray) to 1 (green)
        const normalizedValue = (value - min) / (max - min); // 0 to 1
        const votingValue = normalizedValue * 2 - 1; // -1 to 1
        
        if (votingValue < 0) {
          return `linear-gradient(to right, 
            ${theme.colors.error[500]} 0%, 
            ${theme.colors.gray[300]} 50%, 
            ${theme.colors.gray[200]} 100%)`;
        } else {
          return `linear-gradient(to right, 
            ${theme.colors.gray[200]} 0%, 
            ${theme.colors.gray[300]} 50%, 
            ${theme.colors.success[500]} 100%)`;
        }
      } else if (variant === 'gradient') {
        return `linear-gradient(to right, 
          ${theme.colors.primary[300]} 0%, 
          ${theme.colors.primary[600]} 100%)`;
      }
      return theme.colors.primary[500];
    };

    const getThumbColor = () => {
      if (variant === 'voting') {
        const normalizedValue = (value - min) / (max - min);
        const votingValue = normalizedValue * 2 - 1;
        
        if (Math.abs(votingValue) < 0.1) return theme.colors.gray[400];
        if (votingValue < 0) return theme.colors.error[500];
        return theme.colors.success[500];
      }
      return theme.colors.white;
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
            {showValue && (
              <span className="text-sm font-medium text-gray-900">
                {variant === 'voting' 
                  ? `${((value - min) / (max - min) * 2 - 1).toFixed(2)}`
                  : value}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <div
            ref={sliderRef}
            className={cn(
              'relative w-full rounded-full bg-gray-200 cursor-pointer',
              sizeStyles[size].track,
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onMouseDown={handleMouseDown}
          >
            {/* Fill track */}
            <div
              className={cn(
                'absolute left-0 top-0 h-full rounded-full transition-all',
                variant === 'voting' && 'opacity-60'
              )}
              style={{
                width: `${percentage}%`,
                background: getTrackColor(),
              }}
            />
            
            {/* Thumb */}
            <motion.div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-full shadow-md',
                'border-2 border-white',
                sizeStyles[size].thumb,
                isDragging && 'scale-110',
                disabled && 'cursor-not-allowed'
              )}
              style={{
                left: `${percentage}%`,
                transform: `translate(-50%, -50%)`,
                backgroundColor: getThumbColor(),
              }}
              animate={{
                scale: isDragging ? 1.2 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            {/* Center mark for voting */}
            {variant === 'voting' && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400"
                style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>
          
          {/* Ticks */}
          {showTicks && (
            <div className="relative w-full mt-1">
              {Array.from({ length: tickCount }, (_, i) => {
                const tickPercentage = (i / (tickCount - 1)) * 100;
                return (
                  <div
                    key={i}
                    className={cn(
                      'absolute w-0.5 bg-gray-300',
                      sizeStyles[size].tick
                    )}
                    style={{ left: `${tickPercentage}%`, transform: 'translateX(-50%)' }}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* Hidden input for form compatibility */}
        <input
          ref={ref}
          type="hidden"
          value={value}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// Voting Slider preset
export const VotingSlider: React.FC<Omit<SliderProps, 'variant' | 'min' | 'max'>> = (props) => {
  return (
    <Slider
      {...props}
      variant="voting"
      min={0}
      max={1}
      step={0.01}
      defaultValue={0.5}
      showValue
    />
  );
};

// Styled version
export const getSliderStyles = (variant: SliderProps['variant'] = 'default') => {
  const base = {
    track: {
      position: 'relative' as const,
      width: '100%',
      height: '6px',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.gray[200],
      cursor: 'pointer',
    },
    
    fill: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      height: '100%',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary[500],
      transition: 'width 150ms ease',
    },
    
    thumb: {
      position: 'absolute' as const,
      top: '50%',
      width: '16px',
      height: '16px',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.white,
      border: `2px solid ${theme.colors.white}`,
      boxShadow: theme.boxShadow.md,
      cursor: 'pointer',
      transition: 'all 150ms ease',
      
      '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.1)',
      },
    },
  };

  return base;
};