export interface Message {
  id: string;
  sessionId: string;
  participantId: string;
  content: string;
  timestamp: Date;
  
  // Message metadata
  type: MessageType;
  status: MessageStatus;
  parentId?: string; // For replies/threads
  
  // Voting
  votes: Vote[];
  upvoteCount: number;
  downvoteCount: number;
  score: number; // Normalized -1 to 1
  
  // Moderation
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationReason?: string;
  
  // AI Analysis
  sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
  aiFlags?: AIFlag[];
  
  // Display
  isHighlighted: boolean;
  isPinned: boolean;
  color?: string;
}

export type MessageType = 'text' | 'poll' | 'announcement' | 'system';
export type MessageStatus = 'active' | 'deleted' | 'hidden' | 'expired';

export interface Vote {
  participantId: string;
  value: number; // -1 to 1 scale
  timestamp: Date;
}

export interface AIFlag {
  type: 'inappropriate' | 'spam' | 'off-topic' | 'toxic';
  confidence: number;
  timestamp: Date;
}

export interface MessageFilter {
  sessionId?: string;
  participantId?: string;
  type?: MessageType;
  status?: MessageStatus;
  minScore?: number;
  hasVotes?: boolean;
  isModerated?: boolean;
  parentId?: string | null;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  topics?: string[];
  sentiment?: string;
}

export interface MessageStats {
  totalMessages: number;
  averageScore: number;
  totalVotes: number;
  participantCount: number;
  topicsDistribution: Record<string, number>;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface RingPosition {
  participantId: string;
  leftNeighbor: string;
  rightNeighbor: string;
  position: number;
  totalParticipants: number;
}