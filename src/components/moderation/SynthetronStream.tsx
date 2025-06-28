import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '../../hooks/useMessages';
import { useVoting } from '../../hooks/useVoting';
import type { Message } from '../../types';
import type { ViralMessage } from '../../types/moderation.types';
import { 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Zap,
  MessageSquare
} from '@untitled-ui/icons-react';

interface SynthetronStreamProps {
  sessionId: string;
  maxItems?: number;
}

export const SynthetronStream: React.FC<SynthetronStreamProps> = ({
  sessionId,
  maxItems = 5
}) => {
  const { messages } = useMessages({ sessionId, limit: 100 });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calculate viral messages based on propagation history
  const viralMessages = useMemo<ViralMessage[]>(() => {
    return messages
      .filter(msg => msg.propagationHistory && msg.propagationHistory.length > 2)
      .map(msg => {
        const propagationCount = msg.propagationHistory?.length || 0;
        const totalParticipants = 50; // This would come from session data
        const reachPercentage = (propagationCount / totalParticipants) * 100;
        
        // Calculate average vote from propagation events
        const averageVote = msg.propagationHistory?.reduce((sum, event) => 
          sum + event.voteValue, 0) / (propagationCount || 1) || 0;
        
        // Determine sentiment
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (averageVote > 0.6) sentiment = 'positive';
        else if (averageVote < 0.4) sentiment = 'negative';

        return {
          message: msg,
          propagationCount,
          reachPercentage,
          averageVote,
          sentiment
        };
      })
      .sort((a, b) => b.propagationCount - a.propagationCount)
      .slice(0, maxItems);
  }, [messages, maxItems]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return ThumbsUp;
      case 'negative': return ThumbsDown;
      default: return MessageSquare;
    }
  };

  if (viralMessages.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Zap className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No viral messages yet</p>
        <p className="text-xs mt-1">Messages will appear here as they spread</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      <AnimatePresence>
        {viralMessages.map((viral, index) => {
          const SentimentIcon = getSentimentIcon(viral.sentiment);
          const isExpanded = expandedId === viral.message.id;
          
          return (
            <motion.div
              key={viral.message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : viral.message.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-full ${getSentimentColor(viral.sentiment)}`}>
                    <SentimentIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {viral.propagationCount} hops
                      </span>
                      <span className="text-xs text-gray-500">
                        " {Math.round(viral.reachPercentage)}% reach
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-primary-500" />
                      <span className="text-xs text-primary-600">
                        Viral velocity: {(viral.propagationCount / 5).toFixed(1)}/min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Avg vote
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {(viral.averageVote * 2 - 1).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {viral.message.content}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
                  >
                    {/* Propagation Path */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Propagation Path
                      </p>
                      <div className="flex items-center space-x-1 overflow-x-auto">
                        {viral.message.propagationHistory?.slice(0, 8).map((event, i) => (
                          <React.Fragment key={i}>
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-xs text-primary-700">
                                  {i + 1}
                                </span>
                              </div>
                            </div>
                            {i < 7 && i < viral.message.propagationHistory!.length - 1 && (
                              <div className="w-4 h-0.5 bg-gray-300" />
                            )}
                          </React.Fragment>
                        ))}
                        {viral.message.propagationHistory && viral.message.propagationHistory.length > 8 && (
                          <span className="text-xs text-gray-500 ml-2">
                            +{viral.message.propagationHistory.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">First seen:</span>
                        <span className="ml-1 text-gray-700">
                          {new Date(viral.message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Topic:</span>
                        <span className="ml-1 text-gray-700">
                          {viral.message.topicId || 'General'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Visual Indicator Bar */}
              <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    viral.sentiment === 'positive' ? 'bg-green-500' :
                    viral.sentiment === 'negative' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${viral.reachPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};