import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Flag, Share } from '@untitled-ui/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Message, Vote } from '@types';
import { Card, CardBody, Badge, Button } from '@components/ui';
import { ParticipantAvatar } from './ParticipantAvatar';
import { VoteSlider } from './VoteSlider';
import { useSessionStore } from '@stores/session.store';
import { useAuthStore } from '@stores/auth.store';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

interface MessageCardProps {
  message: Message;
  isHighlighted?: boolean;
  onVote?: (value: number) => void;
  onReply?: () => void;
  onReport?: () => void;
  showVoting?: boolean;
  className?: string;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  isHighlighted = false,
  onVote,
  onReply,
  onReport,
  showVoting = true,
  className,
}) => {
  const { user, anonymousUser } = useAuthStore();
  const currentUserId = user?.uid || anonymousUser?.uid;
  const [isVoting, setIsVoting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [localVote, setLocalVote] = useState<number | null>(null);

  // Get user's vote for this message
  const userVote = message.votes?.find(v => v.userId === currentUserId);
  const hasVoted = !!userVote;
  const currentVoteValue = userVote?.value ?? localVote;

  // Calculate aggregate metrics
  const voteCount = message.votes?.length || 0;
  const averageVote = voteCount > 0
    ? message.votes!.reduce((sum, v) => sum + v.value, 0) / voteCount
    : 0;

  // Sentiment color based on average vote
  const getSentimentColor = (value: number) => {
    if (value > 0.3) return 'text-success-600';
    if (value < -0.3) return 'text-error-600';
    return 'text-gray-600';
  };

  const handleVoteSubmit = (value: number) => {
    setLocalVote(value);
    setIsVoting(false);
    onVote?.(value);
  };

  const handleVoteCancel = () => {
    setIsVoting(false);
    setLocalVote(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'transition-all duration-200',
          isHighlighted && 'ring-2 ring-primary-500 ring-offset-2',
          'hover:shadow-md'
        )}
      >
        <CardBody className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <ParticipantAvatar
                participant={message.participant}
                size="md"
                showInitials
              />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {message.participant.displayName}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    {onReply && (
                      <button
                        onClick={() => {
                          setShowActions(false);
                          onReply();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Reply
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowActions(false);
                        // Share functionality
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Share className="w-4 h-4" />
                      Share
                    </button>
                    {onReport && (
                      <button
                        onClick={() => {
                          setShowActions(false);
                          onReport();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 w-full text-left"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
            
            {/* Parent message reference */}
            {message.parentMessageId && (
              <div className="mt-3 pl-3 border-l-2 border-gray-200">
                <p className="text-sm text-gray-500 italic">
                  Replying to a previous message
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div className="flex flex-wrap gap-2 mb-4">
              {message.metadata.sentiment && (
                <Badge variant="outline" size="sm">
                  Sentiment: {message.metadata.sentiment}
                </Badge>
              )}
              {message.metadata.topics?.map((topic, i) => (
                <Badge key={i} variant="secondary" size="sm">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer with voting */}
          {showVoting && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Vote count and average */}
                <div className="flex items-center gap-2">
                  <Heart className={cn(
                    'w-4 h-4',
                    hasVoted ? 'fill-primary-500 text-primary-500' : 'text-gray-400'
                  )} />
                  <span className="text-sm text-gray-600">{voteCount}</span>
                </div>

                {voteCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">Avg:</span>
                    <span className={cn('text-sm font-medium', getSentimentColor(averageVote))}>
                      {averageVote > 0 ? '+' : ''}{(averageVote * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Vote button */}
              {!hasVoted && !isVoting && onVote && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVoting(true)}
                >
                  Vote
                </Button>
              )}

              {hasVoted && currentVoteValue !== null && (
                <div className="text-sm text-gray-600">
                  Your vote: <span className={cn('font-medium', getSentimentColor(currentVoteValue))}>
                    {currentVoteValue > 0 ? '+' : ''}{(currentVoteValue * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Voting slider */}
          <AnimatePresence>
            {isVoting && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <VoteSlider
                  onVote={handleVoteSubmit}
                  onCancel={handleVoteCancel}
                  initialValue={currentVoteValue || undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Styled version
export const getMessageCardStyles = (isHighlighted: boolean = false) => {
  const base = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.gray[200]}`,
    padding: theme.spacing[6],
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: theme.boxShadow.md,
    },
  };

  if (isHighlighted) {
    return {
      ...base,
      boxShadow: `0 0 0 2px ${theme.colors.primary[500]}`,
    };
  }

  return base;
};