import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParticipants } from '../../hooks/useParticipants';
import { useMessages } from '../../hooks/useMessages';
import { MessageCard } from '../session/cards/MessageCard';
import { VoteIndicator } from '../session/voting/VoteIndicator';
import type { ModeratorInsight, GhostViewParticipant } from '../../types/moderation.types';
import { 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  User,
  Clock,
  Activity
} from '@untitled-ui/icons-react';

interface GhostViewerProps {
  sessionId: string;
  insights?: ModeratorInsight[];
}

const GHOST_VIEW_COUNT = 6;
const REFRESH_INTERVAL = 30000; // 30 seconds

export const GhostViewer: React.FC<GhostViewerProps> = ({
  sessionId,
  insights = []
}) => {
  const { participants } = useParticipants({ sessionId });
  const { messages } = useMessages({ sessionId, limit: 50 });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh ghost views
  useEffect(() => {
    const interval = setInterval(() => {
      selectRandomParticipants();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [participants]);

  // Initial selection
  useEffect(() => {
    if (participants.length > 0 && selectedParticipants.length === 0) {
      selectRandomParticipants();
    }
  }, [participants]);

  const selectRandomParticipants = useCallback(() => {
    if (participants.length === 0) return;

    setIsRefreshing(true);
    const activeParticipants = participants.filter(p => p.status === 'active');
    const shuffled = [...activeParticipants].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(GHOST_VIEW_COUNT, activeParticipants.length));
    
    setSelectedParticipants(selected.map(p => p.id));
    setLastRefresh(Date.now());
    
    setTimeout(() => setIsRefreshing(false), 500);
  }, [participants]);

  const ghostViews = useMemo<GhostViewParticipant[]>(() => {
    return selectedParticipants.map(participantId => {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return null;

      // Find the participant's current message (most recent they haven't voted on)
      const participantVotes = participant.votes || [];
      const unvotedMessage = messages.find(msg => 
        msg.authorId !== participantId && 
        !participantVotes.includes(msg.id)
      );

      // Get recent votes for activity indicator
      const recentVotes = participantVotes
        .slice(-5)
        .map(voteId => {
          const message = messages.find(m => m.id === voteId);
          return message ? {
            id: voteId,
            messageId: voteId,
            participantId,
            value: Math.random(), // Simulated vote value
            timestamp: Date.now() - Math.random() * 60000
          } : null;
        })
        .filter(Boolean) as any[];

      return {
        participantId,
        participant,
        currentMessage: unvotedMessage || null,
        isVoting: Math.random() > 0.7, // Simulate voting state
        recentVotes,
        lastActivity: Date.now() - Math.random() * 120000 // Within last 2 minutes
      };
    }).filter(Boolean) as GhostViewParticipant[];
  }, [selectedParticipants, participants, messages]);

  const formatLastActivity = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Active now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Viewing {ghostViews.length} participants
          </span>
        </div>
        <button
          onClick={selectRandomParticipants}
          disabled={isRefreshing}
          className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Ghost View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {ghostViews.map((view, index) => (
            <motion.div
              key={view.participantId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Participant Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary-100 rounded-full">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {view.participant.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastActivity(view.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {/* Current State */}
              <div className="p-4">
                {view.currentMessage ? (
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 mb-2">
                      {view.isVoting ? 'Currently voting on:' : 'Viewing message:'}
                    </div>
                    <div className="transform scale-90 origin-top-left">
                      <MessageCard
                        message={view.currentMessage}
                        compact
                        showVoting={false}
                      />
                    </div>
                    {view.isVoting && (
                      <div className="mt-2">
                        <VoteIndicator
                          value={0.7}
                          showAverage={false}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Activity className="h-8 w-8 mb-2" />
                    <p className="text-sm">Waiting for new messages</p>
                  </div>
                )}

                {/* Activity Indicator */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Messages: {view.participant.messageCount || 0}</span>
                    <span>Votes: {view.recentVotes.length}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      view.isVoting ? 'bg-amber-500' :
                      view.currentMessage ? 'bg-green-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-xs text-gray-600">
                      {view.isVoting ? 'Voting' :
                       view.currentMessage ? 'Reading' :
                       'Idle'}
                    </span>
                  </div>
                  {view.participant.isTyping && (
                    <span className="text-xs text-primary-600">Typing...</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Participants */}
      {ghostViews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">No active participants to monitor</p>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
        <RefreshCw className="h-3 w-3 mr-1" />
        <span>Auto-refreshes every 30 seconds</span>
      </div>
    </div>
  );
};