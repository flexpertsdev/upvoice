import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '../../types';
import type { ParticipantActivity } from '../../types/moderation.types';
import { 
  User, 
  MessageSquare, 
  ThumbsUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit3
} from '@untitled-ui/icons-react';

interface ParticipantMonitorProps {
  sessionId: string;
  participants: Participant[];
}

type SortBy = 'activity' | 'messages' | 'votes' | 'status';

export const ParticipantMonitor: React.FC<ParticipantMonitorProps> = ({
  sessionId,
  participants
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('activity');
  const [showInactive, setShowInactive] = useState(false);

  // Calculate participant activities
  const participantActivities = useMemo<ParticipantActivity[]>(() => {
    return participants.map(participant => {
      const messageCount = participant.messageCount || 0;
      const voteCount = participant.votes?.length || 0;
      const lastActivity = participant.lastActivity || Date.now();
      const isActive = participant.status === 'active' && 
        (Date.now() - lastActivity) < 120000; // Active in last 2 minutes
      
      return {
        participantId: participant.id,
        participant,
        lastActivityTime: lastActivity,
        messageCount,
        voteCount,
        averageVoteValue: 0.65, // This would be calculated from actual votes
        isActive,
        isTyping: participant.isTyping || false,
        currentScreen: isActive ? 
          (participant.isTyping ? 'message' : 'voting') : 
          'waiting'
      };
    });
  }, [participants]);

  // Sort and filter activities
  const sortedActivities = useMemo(() => {
    const filtered = showInactive 
      ? participantActivities 
      : participantActivities.filter(a => a.isActive);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return b.lastActivityTime - a.lastActivityTime;
        case 'messages':
          return b.messageCount - a.messageCount;
        case 'votes':
          return b.voteCount - a.voteCount;
        case 'status':
          return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [participantActivities, sortBy, showInactive]);

  const getStatusIcon = (activity: ParticipantActivity) => {
    if (!activity.isActive) return XCircle;
    if (activity.isTyping) return Edit3;
    return CheckCircle;
  };

  const getStatusColor = (activity: ParticipantActivity) => {
    if (!activity.isActive) return 'text-gray-400';
    if (activity.isTyping) return 'text-blue-600';
    return 'text-green-600';
  };

  const formatLastActivity = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return 'Over 1h ago';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            {sortedActivities.length} of {participants.length} shown
          </span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="sr-only"
            />
            <div className={`
              relative w-9 h-5 transition-colors rounded-full
              ${showInactive ? 'bg-primary-600' : 'bg-gray-300'}
            `}>
              <div className={`
                absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full
                transition-transform ${showInactive ? 'translate-x-4' : ''}
              `} />
            </div>
            <span className="ml-2 text-sm text-gray-700">Show inactive</span>
          </label>
        </div>

        {/* Sort Options */}
        <div className="flex space-x-2">
          {[
            { value: 'activity', label: 'Activity' },
            { value: 'messages', label: 'Messages' },
            { value: 'votes', label: 'Votes' },
            { value: 'status', label: 'Status' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortBy)}
              className={`
                px-3 py-1 text-xs rounded-full transition-colors
                ${sortBy === option.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto">
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <User className="h-8 w-8 mb-2" />
            <p className="text-sm">No participants to show</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedActivities.map((activity, index) => {
              const StatusIcon = getStatusIcon(activity);
              const statusColor = getStatusColor(activity);
              
              return (
                <motion.div
                  key={activity.participantId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    p-3 hover:bg-gray-50 transition-colors
                    ${!activity.isActive ? 'opacity-60' : ''}
                  `}
                >
                  {/* Participant Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {activity.participant.name}
                      </span>
                      {activity.participant.role === 'moderator' && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                          Mod
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatLastActivity(activity.lastActivityTime)}</span>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{activity.messageCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{activity.voteCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Avg:</span>
                      <span className="text-gray-600">
                        {(activity.averageVoteValue * 2 - 1).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {activity.isTyping && (
                    <div className="mt-1 text-xs text-primary-600 flex items-center">
                      <Edit3 className="h-3 w-3 mr-1 animate-pulse" />
                      <span>Typing...</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-3">
            <span>
              <span className="font-medium text-green-600">
                {participantActivities.filter(a => a.isActive).length}
              </span> active
            </span>
            <span>
              <span className="font-medium text-gray-900">
                {participantActivities.reduce((sum, a) => sum + a.messageCount, 0)}
              </span> messages
            </span>
          </div>
          {participantActivities.some(a => !a.isActive && (Date.now() - a.lastActivityTime) > 300000) && (
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Inactive alerts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};