import type { Message, Participant, Vote } from './index';

export type ModeratorTab = 'dashboard' | 'ghost' | 'analytics' | 'participants';

export interface SessionMetrics {
  totalParticipants: number;
  activeParticipants: number;
  totalMessages: number;
  messagesPerMinute: number;
  totalVotes: number;
  votesPerMinute: number;
  averageEngagement: number;
  topicCompletionRate: number;
}

export interface ParticipantActivity {
  participantId: string;
  participant: Participant;
  lastActivityTime: number;
  messageCount: number;
  voteCount: number;
  averageVoteValue: number;
  isActive: boolean;
  isTyping: boolean;
  currentScreen?: 'message' | 'voting' | 'waiting';
  currentMessage?: Message;
}

export interface GhostViewParticipant {
  participantId: string;
  participant: Participant;
  currentMessage: Message | null;
  isVoting: boolean;
  recentVotes: Vote[];
  lastActivity: number;
}

export interface ModeratorInsight {
  id: string;
  type: 'engagement' | 'sentiment' | 'activity' | 'alert';
  title: string;
  description: string;
  value?: number | string;
  trend?: 'up' | 'down' | 'stable';
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

export interface ViralMessage {
  message: Message;
  propagationCount: number;
  reachPercentage: number;
  averageVote: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ProberMessage {
  id: string;
  content: string;
  targetType: 'all' | 'segment' | 'random';
  targetSegment?: string[];
  scheduledTime?: number;
  sentTime?: number;
  status: 'draft' | 'scheduled' | 'sent';
}

export interface SessionControl {
  action: 'pause' | 'resume' | 'end' | 'next_topic' | 'extend_time';
  timestamp: number;
  moderatorId: string;
  reason?: string;
}

export interface ModeratorPermissions {
  canPauseSession: boolean;
  canEndSession: boolean;
  canSkipTopic: boolean;
  canSendProbers: boolean;
  canRemoveParticipants: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}