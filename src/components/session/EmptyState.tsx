import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare01 as MessageSquare, 
  Users01 as Users, 
  File02 as FileText, 
  SearchLg as Search,
  Calendar,
  AlertCircle,
  Plus
} from '@untitled-ui/icons-react';
import { Button } from '@components/ui';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

type IconType = 'message' | 'users' | 'document' | 'search' | 'calendar' | 'error';

export interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'message',
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const iconMap = {
    message: MessageSquare,
    users: Users,
    document: FileText,
    search: Search,
    calendar: Calendar,
    error: AlertCircle,
  };

  const Icon = iconMap[icon];

  const sizeMap = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-10 h-10',
      iconWrapper: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
      gap: 'gap-3',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-12 h-12',
      iconWrapper: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
      gap: 'gap-4',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-16 h-16',
      iconWrapper: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
      gap: 'gap-6',
    },
  };

  const config = sizeMap[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center text-center',
        config.container,
        config.gap,
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100',
          config.iconWrapper
        )}
      >
        <Icon className={cn('text-gray-400', config.icon)} />
      </motion.div>

      {/* Text content */}
      <div className="space-y-2 max-w-sm">
        <h3 className={cn('font-semibold text-gray-900', config.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-gray-600', config.description)}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={action.onClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Preset empty states
export const EmptyMessageList = ({ onCreateMessage }: { onCreateMessage?: () => void }) => (
  <EmptyState
    icon="message"
    title="No messages yet"
    description="Be the first to share your thoughts and start the conversation"
    action={
      onCreateMessage
        ? {
            label: 'Share a message',
            onClick: onCreateMessage,
          }
        : undefined
    }
  />
);

export const EmptyParticipantList = ({ onInvite }: { onInvite?: () => void }) => (
  <EmptyState
    icon="users"
    title="No participants yet"
    description="Invite others to join this session and start collaborating"
    action={
      onInvite
        ? {
            label: 'Invite participants',
            onClick: onInvite,
          }
        : undefined
    }
  />
);

export const EmptySearchResults = ({ onClearSearch }: { onClearSearch?: () => void }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for"
    action={
      onClearSearch
        ? {
            label: 'Clear search',
            onClick: onClearSearch,
            variant: 'secondary',
          }
        : undefined
    }
  />
);

export const EmptySessionList = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon="calendar"
    title="No sessions yet"
    description="Create your first session to start gathering feedback"
    action={
      onCreate
        ? {
            label: 'Create session',
            onClick: onCreate,
          }
        : undefined
    }
  />
);

export const ErrorState = ({ 
  error, 
  onRetry 
}: { 
  error?: string; 
  onRetry?: () => void;
}) => (
  <EmptyState
    icon="error"
    title="Something went wrong"
    description={error || "We couldn't load this content. Please try again."}
    action={
      onRetry
        ? {
            label: 'Try again',
            onClick: onRetry,
            variant: 'secondary',
          }
        : undefined
    }
  />
);

// Loading skeleton empty state
export const LoadingEmptyState = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-3 border-gray-200 border-t-primary-500 rounded-full"
    />
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

// Styled version
export const getEmptyStateStyles = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = {
    sm: {
      padding: `${theme.spacing[8]} ${theme.spacing[4]}`,
      iconSize: '48px',
      iconWrapperSize: '64px',
      titleSize: theme.typography.fontSize.base,
      gap: theme.spacing[3],
    },
    md: {
      padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
      iconSize: '64px',
      iconWrapperSize: '80px',
      titleSize: theme.typography.fontSize.lg,
      gap: theme.spacing[4],
    },
    lg: {
      padding: `${theme.spacing[16]} ${theme.spacing[8]}`,
      iconSize: '80px',
      iconWrapperSize: '96px',
      titleSize: theme.typography.fontSize.xl,
      gap: theme.spacing[6],
    },
  };

  const config = sizes[size];

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      padding: config.padding,
      gap: config.gap,
    },
    iconWrapper: {
      width: config.iconWrapperSize,
      height: config.iconWrapperSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.gray[100],
    },
    icon: {
      width: config.iconSize,
      height: config.iconSize,
      color: theme.colors.gray[400],
    },
    title: {
      fontSize: config.titleSize,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.gray[900],
      marginBottom: theme.spacing[2],
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.gray[600],
      maxWidth: '24rem',
    },
    actions: {
      display: 'flex',
      gap: theme.spacing[3],
      marginTop: theme.spacing[4],
    },
  };
};