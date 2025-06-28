import React from 'react';
import { motion } from 'framer-motion';
import { User01 as User } from '@untitled-ui/icons-react';
import type { Participant } from '@/types';
import { Avatar, AvatarProps } from '@components/ui';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface ParticipantAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
  participant: Participant;
  showStatus?: boolean;
  showRole?: boolean;
  isAnimated?: boolean;
  pulseOnActive?: boolean;
}

export const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  participant,
  showStatus = false,
  showRole = false,
  isAnimated = true,
  pulseOnActive = false,
  size = 'md',
  className,
  ...avatarProps
}) => {
  const isActive = participant.status === 'active';
  const isModerator = participant.role === 'moderator';
  
  // Generate consistent color based on participant ID
  const getParticipantColor = (id: string) => {
    const colors = [
      theme.colors.primary[500],
      theme.colors.gray[500],
      theme.colors.success[500],
      theme.colors.warning[500],
      theme.colors.error[500],
      theme.colors.primary[600],
      theme.colors.gray[600],
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const participantColor = getParticipantColor(participant.id);

  const content = (
    <div className={cn('relative inline-flex', className)}>
      <Avatar
        src={participant.avatarUrl}
        alt={participant.displayName}
        size={size}
        style={{
          backgroundColor: !participant.avatarUrl ? participantColor : undefined,
        }}
        {...avatarProps}
      >
        {!participant.avatarUrl && (
          participant.displayName ? (
            <span className="text-white font-medium">
              {participant.displayName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4 text-white" />
          )
        )}
      </Avatar>

      {/* Status indicator */}
      {showStatus && (
        <div
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            isActive ? 'bg-success-500' : 'bg-gray-300'
          )}
        />
      )}

      {/* Role badge */}
      {showRole && isModerator && (
        <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          M
        </div>
      )}

      {/* Active pulse animation */}
      {pulseOnActive && isActive && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />
        </div>
      )}
    </div>
  );

  if (isAnimated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Participant list item
interface ParticipantListItemProps {
  participant: Participant;
  onClick?: () => void;
  isSelected?: boolean;
  showMessageCount?: boolean;
  messageCount?: number;
}

export const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  onClick,
  isSelected = false,
  showMessageCount = false,
  messageCount = 0,
}) => {
  const isActive = participant.status === 'active';
  const isModerator = participant.role === 'moderator';

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
        'hover:bg-gray-50',
        isSelected && 'bg-primary-50 hover:bg-primary-100'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <ParticipantAvatar
        participant={participant}
        size="sm"
        showStatus
        isAnimated={false}
      />
      
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">
            {participant.displayName}
          </p>
          {isModerator && (
            <span className="text-xs font-medium text-primary-600">
              Moderator
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={cn(
            'flex items-center gap-1',
            isActive ? 'text-success-600' : 'text-gray-400'
          )}>
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              isActive ? 'bg-success-500' : 'bg-gray-300'
            )} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
          
          {showMessageCount && messageCount > 0 && (
            <>
              <span>"</span>
              <span>{messageCount} messages</span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
};

// Avatar group for multiple participants
interface ParticipantAvatarGroupProps {
  participants: Participant[];
  max?: number;
  size?: AvatarProps['size'];
  showMore?: boolean;
  className?: string;
}

export const ParticipantAvatarGroup: React.FC<ParticipantAvatarGroupProps> = ({
  participants,
  max = 3,
  size = 'sm',
  showMore = true,
  className,
}) => {
  const visibleParticipants = participants.slice(0, max);
  const remainingCount = Math.max(0, participants.length - max);

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleParticipants.map((participant, index) => (
        <div
          key={participant.id}
          className="relative"
          style={{ zIndex: max - index }}
        >
          <ParticipantAvatar
            participant={participant}
            size={size}
            className="ring-2 ring-white"
            isAnimated={false}
          />
        </div>
      ))}
      
      {showMore && remainingCount > 0 && (
        <div
          className="relative"
          style={{ zIndex: 0 }}
        >
          <Avatar
            size={size}
            className="ring-2 ring-white bg-gray-100"
          >
            <span className="text-xs font-medium text-gray-600">
              +{remainingCount}
            </span>
          </Avatar>
        </div>
      )}
    </div>
  );
};

// Styled version
export const getParticipantAvatarStyles = (size: AvatarProps['size'] = 'md') => {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  };

  return {
    container: {
      position: 'relative' as const,
      display: 'inline-flex',
    },
    avatar: {
      width: sizes[size],
      height: sizes[size],
      borderRadius: theme.borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size === 'xs' ? theme.typography.fontSize.xs : theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.white,
    },
    statusIndicator: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: '12px',
      height: '12px',
      borderRadius: theme.borderRadius.full,
      border: `2px solid ${theme.colors.white}`,
    },
    roleBadge: {
      position: 'absolute' as const,
      top: '-4px',
      right: '-4px',
      width: '20px',
      height: '20px',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary[500],
      color: theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
    },
  };
};