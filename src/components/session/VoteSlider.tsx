import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, X } from '@untitled-ui/icons-react';
import { Button } from '@components/ui';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

interface VoteSliderProps {
  onVote: (value: number) => void;
  onCancel?: () => void;
  initialValue?: number;
  showLabels?: boolean;
  className?: string;
}

export const VoteSlider: React.FC<VoteSliderProps> = ({
  onVote,
  onCancel,
  initialValue = 0,
  showLabels = true,
  className,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Convert between normalized value (0-1) and display value (-1 to 1)
  const normalizedToDisplay = (normalized: number) => (normalized * 2) - 1;
  const displayToNormalized = (display: number) => (display + 1) / 2;

  // Motion values for smooth animations
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 1],
    [theme.colors.error[500], theme.colors.success[500]]
  );

  // Initialize position
  useEffect(() => {
    x.set(displayToNormalized(value));
  }, [value, x]);

  // Get color based on value
  const getValueColor = (val: number) => {
    if (val > 0.3) return theme.colors.success[600];
    if (val < -0.3) return theme.colors.error[600];
    return theme.colors.gray[600];
  };

  // Handle slider interaction
  const handleSliderInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const position = (clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    
    x.set(clampedPosition);
    setValue(normalizedToDisplay(clampedPosition));
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleSliderInteraction(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderInteraction(event);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging) {
      handleSliderInteraction(event);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Global mouse/touch listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleSliderInteraction(e as any);
      };
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };
      const handleGlobalTouchMove = (e: TouchEvent) => {
        handleSliderInteraction(e as any);
      };
      const handleGlobalTouchEnd = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging]);

  const handleSubmit = () => {
    onVote(value);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mb-2 px-1">
          <span className="text-xs font-medium text-error-600">Disagree</span>
          <span className="text-xs font-medium text-gray-500">Neutral</span>
          <span className="text-xs font-medium text-success-600">Agree</span>
        </div>
      )}

      {/* Slider container */}
      <div className="relative mb-4">
        {/* Background track */}
        <div
          ref={sliderRef}
          className="relative h-12 bg-gray-100 rounded-full cursor-pointer overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${displayToNormalized(value) * 100}%`,
              background: background as any,
              opacity: 0.2,
            }}
          />

          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2" />

          {/* Thumb */}
          <motion.div
            ref={thumbRef}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing',
              isDragging && 'scale-110'
            )}
            style={{
              x: `calc(${displayToNormalized(value) * 100}% - 20px)`,
              borderColor: getValueColor(value),
            }}
            whileTap={{ scale: 1.1 }}
          >
            {/* Inner indicator */}
            <div
              className="absolute inset-2 rounded-full"
              style={{ backgroundColor: getValueColor(value) }}
            />
          </motion.div>
        </div>

        {/* Value display */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <span
            className="text-sm font-semibold"
            style={{ color: getValueColor(value) }}
          >
            {value > 0 ? '+' : ''}{(value * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-8">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Submit Vote
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Drag the slider to indicate your level of agreement
      </p>
    </div>
  );
};

// Preset vote options
export const VotePresets = ({
  onVote,
  onCancel,
}: {
  onVote: (value: number) => void;
  onCancel?: () => void;
}) => {
  const presets = [
    { value: -1, label: 'Strongly Disagree', color: 'error' },
    { value: -0.5, label: 'Disagree', color: 'warning' },
    { value: 0, label: 'Neutral', color: 'gray' },
    { value: 0.5, label: 'Agree', color: 'info' },
    { value: 1, label: 'Strongly Agree', color: 'success' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => onVote(preset.value)}
            className={cn(
              'text-xs',
              preset.color === 'error' && 'border-error-200 text-error-700 hover:bg-error-50',
              preset.color === 'warning' && 'border-warning-200 text-warning-700 hover:bg-warning-50',
              preset.color === 'gray' && 'border-gray-200 text-gray-700 hover:bg-gray-50',
              preset.color === 'info' && 'border-primary-200 text-primary-700 hover:bg-primary-50',
              preset.color === 'success' && 'border-success-200 text-success-700 hover:bg-success-50'
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

// Styled version
export const getVoteSliderStyles = () => ({
  container: {
    width: '100%',
  },
  track: {
    position: 'relative' as const,
    height: theme.spacing[12],
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.borderRadius.full,
    opacity: 0.2,
  },
  thumb: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    boxShadow: theme.boxShadow.lg,
    border: '2px solid',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  centerLine: {
    position: 'absolute' as const,
    left: '50%',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: theme.colors.gray[300],
    transform: 'translateX(-50%)',
  },
});