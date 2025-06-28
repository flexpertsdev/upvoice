import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw01 as RefreshCw,
  Check,
  X as CloseIcon
} from '@untitled-ui/icons-react';
import { Badge, Button } from '@components/ui';
import { useConnectionStatus } from '@hooks/useConnectionStatus';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface ConnectionStatusProps {
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  showReconnect?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  size = 'md',
  showDetails = true,
  showReconnect = true,
  className,
}) => {
  const { 
    isOnline, 
    connectionStrength, 
    latency, 
    reconnect,
    isReconnecting 
  } = useConnectionStatus();
  
  const [showTooltip, setShowTooltip] = useState(false);

  // Get status color and icon
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        color: 'error',
        icon: WifiOff,
        label: 'Offline',
        description: 'No internet connection',
      };
    }

    if (connectionStrength === 'weak' || latency > 1000) {
      return {
        color: 'warning',
        icon: AlertCircle,
        label: 'Poor Connection',
        description: `High latency (${latency}ms)`,
      };
    }

    if (connectionStrength === 'good') {
      return {
        color: 'success',
        icon: Wifi,
        label: 'Connected',
        description: `Good connection (${latency}ms)`,
      };
    }

    return {
      color: 'success',
      icon: Wifi,
      label: 'Excellent',
      description: `Excellent connection (${latency}ms)`,
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  const sizeMap = {
    sm: {
      icon: 'w-3 h-3',
      badge: 'text-xs px-2 py-0.5',
      button: 'text-xs px-2 py-1',
    },
    md: {
      icon: 'w-4 h-4',
      badge: 'text-sm px-2.5 py-1',
      button: 'text-sm px-3 py-1.5',
    },
    lg: {
      icon: 'w-5 h-5',
      badge: 'text-base px-3 py-1.5',
      button: 'text-base px-4 py-2',
    },
  };

  const handleReconnect = async () => {
    await reconnect();
  };

  // Simple indicator
  if (!showDetails) {
    return (
      <div
        className={cn('relative', className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className={cn(
          sizeMap[size].icon,
          status.color === 'error' && 'text-error-500',
          status.color === 'warning' && 'text-warning-500',
          status.color === 'success' && 'text-success-500'
        )} />
        
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                <p className="font-medium">{status.label}</p>
                <p className="text-gray-300">{status.description}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Detailed status with badge
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        variant={status.color as any}
        size={size}
        className="flex items-center gap-1.5"
      >
        <Icon className={sizeMap[size].icon} />
        <span className="hidden sm:inline">{status.label}</span>
      </Badge>
      
      {!isOnline && showReconnect && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
          className={sizeMap[size].button}
        >
          {isReconnecting ? (
            <RefreshCw className={cn(sizeMap[size].icon, 'animate-spin')} />
          ) : (
            <>
              <RefreshCw className={cn(sizeMap[size].icon, 'mr-1')} />
              Reconnect
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// Connection quality indicator
interface ConnectionQualityProps {
  strength: 'excellent' | 'good' | 'weak' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ConnectionQuality: React.FC<ConnectionQualityProps> = ({
  strength,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const bars = 4;
  const activeMap = {
    excellent: 4,
    good: 3,
    weak: 1,
    offline: 0,
  };
  
  const active = activeMap[strength];
  
  const sizeMap = {
    sm: {
      container: 'gap-0.5',
      bar: 'w-0.5',
      heights: [8, 10, 12, 14],
    },
    md: {
      container: 'gap-1',
      bar: 'w-1',
      heights: [12, 16, 20, 24],
    },
    lg: {
      container: 'gap-1.5',
      bar: 'w-1.5',
      heights: [16, 20, 24, 28],
    },
  };

  const getBarColor = (index: number) => {
    if (strength === 'offline' || index >= active) {
      return 'bg-gray-300';
    }
    if (strength === 'weak') return 'bg-error-500';
    if (strength === 'good') return 'bg-warning-500';
    return 'bg-success-500';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex items-end', sizeMap[size].container)}>
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              sizeMap[size].bar,
              'rounded-full transition-colors',
              getBarColor(i)
            )}
            style={{ height: sizeMap[size].heights[i] }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
      
      {showLabel && (
        <span className={cn(
          'text-sm capitalize',
          strength === 'offline' && 'text-gray-500',
          strength === 'weak' && 'text-error-600',
          strength === 'good' && 'text-warning-600',
          strength === 'excellent' && 'text-success-600'
        )}>
          {strength}
        </span>
      )}
    </div>
  );
};

// Connection status banner
interface ConnectionBannerProps {
  onReconnect?: () => void;
  onDismiss?: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  onReconnect,
  onDismiss,
}) => {
  const { isOnline, isReconnecting } = useConnectionStatus();
  const [isVisible, setIsVisible] = useState(!isOnline);
  const [hasReconnected, setHasReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
      setHasReconnected(false);
    } else if (isVisible && !hasReconnected) {
      // Show success briefly when reconnected
      setHasReconnected(true);
      setTimeout(() => setIsVisible(false), 3000);
    }
  }, [isOnline, isVisible, hasReconnected]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-3',
        isOnline ? 'bg-success-50 border-b border-success-200' : 'bg-error-50 border-b border-error-200'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Check className="w-5 h-5 text-success-600" />
              <p className="text-sm font-medium text-success-900">
                Connection restored
              </p>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-error-600" />
              <p className="text-sm font-medium text-error-900">
                You are currently offline
              </p>
              <p className="text-sm text-error-700">
                Some features may be unavailable
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && onReconnect && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReconnect}
              disabled={isReconnecting}
              className="text-error-700 hover:bg-error-100"
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Try Again
                </>
              )}
            </Button>
          )}
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Styled version
export const getConnectionStatusStyles = () => ({
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
  },
  qualityBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: theme.spacing[1],
  },
  bar: {
    width: '4px',
    borderRadius: theme.borderRadius.full,
    transition: 'all 0.2s ease',
  },
  banner: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderBottom: '1px solid',
  },
});