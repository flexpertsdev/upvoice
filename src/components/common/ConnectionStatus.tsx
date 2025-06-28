import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { Wifi, WifiOff, AlertCircle } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConnectionStatusProps {
  status?: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency?: number;
  showDetails?: boolean;
  compact?: boolean;
  onReconnect?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status = 'connected',
  latency,
  showDetails = true,
  compact = false,
  onReconnect,
}) => {
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    if (onReconnect && status === 'disconnected') {
      setIsReconnecting(true);
      await onReconnect();
      setIsReconnecting(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi size={16} />,
          label: compact ? 'Connected' : 'Connection Stable',
          color: 'success' as const,
          tooltip: latency ? `Connected (${latency}ms)` : 'Connected',
        };
      case 'connecting':
        return {
          icon: <Wifi size={16} />,
          label: 'Connecting...',
          color: 'warning' as const,
          tooltip: 'Establishing connection',
          pulse: true,
        };
      case 'disconnected':
        return {
          icon: <WifiOff size={16} />,
          label: 'Disconnected',
          color: 'error' as const,
          tooltip: 'Connection lost',
          clickable: true,
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          label: 'Connection Error',
          color: 'error' as const,
          tooltip: 'Unable to connect',
          clickable: true,
        };
    }
  };

  const config = getStatusConfig();

  const getLatencyColor = (ms: number) => {
    if (ms < 50) return 'success.main';
    if (ms < 150) return 'warning.main';
    return 'error.main';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Tooltip title={config.tooltip}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={
                <motion.div
                  animate={
                    config.pulse
                      ? {
                          opacity: [1, 0.5, 1],
                        }
                      : {}
                  }
                  transition={
                    config.pulse
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  {config.icon}
                </motion.div>
              }
              label={
                isReconnecting ? 'Reconnecting...' : config.label
              }
              size="small"
              color={config.color}
              variant={status === 'connected' ? 'outlined' : 'filled'}
              onClick={config.clickable ? handleReconnect : undefined}
              sx={{
                cursor: config.clickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': config.clickable
                  ? {
                      transform: 'scale(1.05)',
                    }
                  : {},
              }}
            />
            
            {showDetails && latency !== undefined && status === 'connected' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Chip
                  label={`${latency}ms`}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    borderColor: getLatencyColor(latency),
                    color: getLatencyColor(latency),
                  }}
                />
              </motion.div>
            )}
          </Box>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;