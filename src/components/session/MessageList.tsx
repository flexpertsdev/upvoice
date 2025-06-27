import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from '@untitled-ui/icons-react';
import { Message } from '@types';
import { MessageCard } from './MessageCard';
import { EmptyState } from './EmptyState';
import { Loading, Button } from '@components/ui';
import { useSessionStore } from '@stores/session.store';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onVote?: (messageId: string, value: number) => void;
  onReply?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  highlightedMessageId?: string;
  className?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onVote,
  onReply,
  onReport,
  highlightedMessageId,
  className,
  emptyStateTitle = "No messages yet",
  emptyStateDescription = "Be the first to share your thoughts",
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const previousMessageCount = useRef(messages.length);

  // Group messages by time intervals
  const groupMessagesByTime = (messages: Message[]) => {
    const groups: { label: string; messages: Message[] }[] = [];
    const now = Date.now();
    
    messages.forEach((message) => {
      const messageTime = message.timestamp.getTime();
      const timeDiff = now - messageTime;
      
      let label = '';
      if (timeDiff < 60000) { // Less than 1 minute
        label = 'Just now';
      } else if (timeDiff < 3600000) { // Less than 1 hour
        label = 'Recent';
      } else if (timeDiff < 86400000) { // Less than 24 hours
        label = 'Today';
      } else {
        label = 'Earlier';
      }
      
      const existingGroup = groups.find(g => g.label === label);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ label, messages: [message] });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByTime(messages);

  // Handle scroll behavior
  const handleScroll = () => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll button if user has scrolled up
    setShowScrollButton(distanceFromBottom > 100);
    
    // Disable auto-scroll if user manually scrolls up
    if (distanceFromBottom > 50) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && messages.length > previousMessageCount.current) {
      scrollToBottom();
    }
    previousMessageCount.current = messages.length;
  }, [messages, autoScroll]);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setAutoScroll(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Loading size="lg" text="Loading messages..." />
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <EmptyState
          icon="message"
          title={emptyStateTitle}
          description={emptyStateDescription}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      {/* Messages container */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AnimatePresence mode="popLayout">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {/* Time group label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-medium text-gray-500 px-2">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Messages in group */}
              <div className="space-y-4">
                {group.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: groupIndex * 0.1 + index * 0.05,
                    }}
                  >
                    <MessageCard
                      message={message}
                      isHighlighted={message.id === highlightedMessageId}
                      onVote={onVote ? (value) => onVote(message.id, value) : undefined}
                      onReply={onReply ? () => onReply(message.id) : undefined}
                      onReport={onReport ? () => onReport(message.id) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {/* Bottom padding for scroll */}
        <div className="h-4" />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToBottom}
              className="rounded-full shadow-lg"
            >
              <ArrowDown className="w-4 h-4 mr-1" />
              New messages
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Infinite scroll hook
export const useInfiniteScroll = (
  callback: () => void,
  options?: {
    threshold?: number;
    rootMargin?: string;
  }
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '50px',
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [callback, options?.threshold, options?.rootMargin]);

  return { targetRef, isIntersecting };
};

// Styled version
export const getMessageListStyles = () => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
    WebkitOverflowScrolling: 'touch' as const,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.colors.gray[100],
      borderRadius: theme.borderRadius.full,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.colors.gray[300],
      borderRadius: theme.borderRadius.full,
      '&:hover': {
        backgroundColor: theme.colors.gray[400],
      },
    },
  },
  groupLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  groupLabelText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[500],
    padding: `0 ${theme.spacing[2]}`,
  },
  divider: {
    flex: 1,
    height: '1px',
    backgroundColor: theme.colors.gray[200],
  },
});