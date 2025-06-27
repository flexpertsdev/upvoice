import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Share, 
  Settings, 
  Users, 
  Info,
  ChevronDown,
  LogOut,
  MoreHorizontal
} from '@untitled-ui/icons-react';
import { Session } from '@types';
import { Button, Badge } from '@components/ui';
import { ParticipantAvatarGroup } from './ParticipantAvatar';
import { SessionTimer } from './SessionTimer';
import { ConnectionStatus } from './ConnectionStatus';
import { useSessionStore } from '@stores/session.store';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';
import toast from 'react-hot-toast';

interface SessionHeaderProps {
  session: Session;
  onSettings?: () => void;
  onInfo?: () => void;
  onLeave?: () => void;
  showTimer?: boolean;
  showConnectionStatus?: boolean;
  className?: string;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  onSettings,
  onInfo,
  onLeave,
  showTimer = true,
  showConnectionStatus = true,
  className,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { participants } = useSessionStore();

  const activeParticipants = participants.filter(p => p.status === 'active');
  const sessionUrl = `${window.location.origin}/join/${session.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    toast.success('Session code copied!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionUrl);
    toast.success('Session link copied!');
    setShowShareMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: session.title,
          text: `Join my upVoice session: ${session.title}`,
          url: sessionUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const getSessionStatusColor = () => {
    switch (session.status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'paused':
        return 'warning';
      case 'completed':
      case 'archived':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <header className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {session.title}
                </h1>
                <Badge 
                  variant={getSessionStatusColor() as any}
                  size="sm"
                >
                  {session.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {/* Session code */}
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <span className="font-mono font-medium">{session.code}</span>
                  <Copy className="w-3 h-3" />
                </button>

                {/* Participant count */}
                <div className="hidden sm:flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{activeParticipants.length} active</span>
                </div>

                {/* Timer */}
                {showTimer && session.status === 'active' && (
                  <div className="hidden sm:block">
                    <SessionTimer startTime={session.startTime!} />
                  </div>
                )}
              </div>
            </div>

            {/* Participant avatars */}
            <div className="hidden sm:block">
              <ParticipantAvatarGroup
                participants={activeParticipants}
                max={5}
                size="sm"
              />
            </div>
          </div>

          {/* Right section - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {showConnectionStatus && (
              <ConnectionStatus />
            )}

            {/* Share button with dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2"
                    >
                      <Share className="w-4 h-4" />
                      Share session
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {onInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onInfo}
              >
                <Info className="w-4 h-4" />
              </Button>
            )}

            {onSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {onLeave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLeave}
                className="text-error-600 hover:bg-error-50 border-error-200"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Leave</span>
              </Button>
            )}
          </div>

          {/* Right section - Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            {showConnectionStatus && (
              <ConnectionStatus size="sm" />
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden mt-4 pt-4 border-t border-gray-200 space-y-2 overflow-hidden"
            >
              {/* Mobile stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{activeParticipants.length} participants</span>
                </div>
                {showTimer && session.status === 'active' && (
                  <SessionTimer startTime={session.startTime!} />
                )}
              </div>

              {/* Mobile actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="justify-center"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                {onInfo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onInfo}
                    className="justify-center"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Info
                  </Button>
                )}
                
                {onSettings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSettings}
                    className="justify-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                )}
                
                {onLeave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLeave}
                    className="justify-center text-error-600 hover:bg-error-50 border-error-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// Styled version
export const getSessionHeaderStyles = () => ({
  container: {
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[1],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  metadata: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  codeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: theme.colors.gray[900],
    },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
});