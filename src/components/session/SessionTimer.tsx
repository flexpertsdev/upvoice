import React, { useState, useEffect } from 'react';
import { Clock, PauseCircle as Pause, PlayCircle as Play } from '@untitled-ui/icons-react';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface SessionTimerProps {
  startTime: Date;
  endTime?: Date;
  isPaused?: boolean;
  showIcon?: boolean;
  format?: 'short' | 'long';
  className?: string;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  startTime,
  endTime,
  isPaused = false,
  showIcon = true,
  format = 'short',
  className,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isPaused || endTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const start = startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime();
      setElapsed(Math.floor((now - start) / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === 'long') {
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${secs}s`);
      return parts.join(' ');
    }

    // Short format
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const minutes = elapsed / 60;
    if (minutes < 30) return 'text-gray-600';
    if (minutes < 60) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className={cn('flex items-center gap-1.5', getTimerColor(), className)}>
      {showIcon && (
        <>
          {isPaused ? (
            <Pause className="w-4 h-4" />
          ) : endTime ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </>
      )}
      <span className="font-mono text-sm font-medium">
        {formatTime(elapsed)}
      </span>
    </div>
  );
};

// Countdown timer component
export interface CountdownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
  showIcon?: boolean;
  warningThreshold?: number; // seconds
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTime,
  onComplete,
  showIcon = true,
  warningThreshold = 60,
  className,
}) => {
  const [remaining, setRemaining] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = targetTime.getTime();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      
      setRemaining(diff);
      
      if (diff === 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete, hasCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (remaining === 0) return 'text-error-600';
    if (remaining <= warningThreshold) return 'text-warning-600';
    return 'text-gray-600';
  };

  return (
    <div className={cn('flex items-center gap-1.5', getTimerColor(), className)}>
      {showIcon && <Clock className="w-4 h-4" />}
      <span className="font-mono text-sm font-medium">
        {formatTime(remaining)}
      </span>
    </div>
  );
};

// Session duration display
interface SessionDurationProps {
  startTime: Date;
  endTime: Date;
  showIcon?: boolean;
  className?: string;
}

export const SessionDuration: React.FC<SessionDurationProps> = ({
  startTime,
  endTime,
  showIcon = true,
  className,
}) => {
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    }
    
    if (parts.length === 0) {
      return 'Less than a minute';
    }
    
    return parts.join(' ');
  };

  return (
    <div className={cn('flex items-center gap-1.5 text-gray-600', className)}>
      {showIcon && <Clock className="w-4 h-4" />}
      <span className="text-sm">
        Duration: {formatDuration(duration)}
      </span>
    </div>
  );
};

// Timer progress bar
interface TimerProgressProps {
  current: number; // seconds
  total: number; // seconds
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TimerProgress: React.FC<TimerProgressProps> = ({
  current,
  total,
  showLabel = true,
  height = 'md',
  className,
}) => {
  const percentage = Math.min(100, (current / total) * 100);
  
  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getProgressColor = () => {
    if (percentage < 50) return 'bg-success-500';
    if (percentage < 80) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{Math.floor(current / 60)}m {current % 60}s</span>
          <span>{Math.floor(total / 60)}m {total % 60}s</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heightMap[height])}>
        <div
          className={cn('h-full transition-all duration-1000 ease-linear', getProgressColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Styled version
export const getSessionTimerStyles = () => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem', // 6px = 1.5 * 4px
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  time: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 1s linear',
  },
});