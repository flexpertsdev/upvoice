import { Message } from './message.types';

export interface SessionSettings {
  id: string;
  code: string; // Session join code
  title: string;
  description?: string;
  status: SessionStatus; // Current session status
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  maxParticipants?: number;
  allowAnonymous: boolean;
  requireModeration: boolean;
  votingEnabled: boolean;
  messageLifespan?: number; // minutes
  organizationId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Moderation settings
  moderators: string[];
  aiModerationEnabled: boolean;
  profanityFilter: boolean;
  
  // Access control
  accessCode?: string;
  requireEmail?: boolean;
  allowedDomains?: string[];
  
  // Theme customization
  primaryColor?: string;
  logoUrl?: string;
}

export interface SessionStats {
  totalMessages: number;
  activeParticipants: number;
  totalVotes: number;
  averageEngagement: number;
  topTopics?: string[];
  sentimentScore?: number;
  participationRate: number;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  sessionId: string;
  userId?: string;
  displayName: string;
  color: string;
  joinedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  isModerator: boolean;
  messageCount: number;
  voteCount: number;
  connectionId?: string;
  avatarUrl?: string;
  status?: 'active' | 'inactive';
  role?: 'participant' | 'moderator';
}

export interface SessionExport {
  session: SessionSettings;
  messages: Message[];
  participants: Participant[];
  stats: SessionStats;
  exportedAt: Date;
  exportedBy: string;
}

export type SessionStatus = 'scheduled' | 'active' | 'paused' | 'completed' | 'ended' | 'archived';

export type ParticipantRole = 'participant' | 'moderator' | 'host';

export interface SessionListItem {
  id: string;
  title: string;
  status: SessionStatus;
  startTime: Date;
  participantCount: number;
  messageCount: number;
  organizationId?: string;
}