/**
 * message.types.ts - Message Type Definitions
 * 
 * Defines the structure of messages in discussions.
 * Messages are the core content unit - anonymous thoughts
 * that propagate through the viral ring system.
 * 
 * Related files:
 * - services/messages.ts: Message creation and retrieval
 * - services/propagation.ts: Ring-based spread algorithm
 * - components/session/cards/MessageCard.tsx: Display component
 */

import { Timestamp } from 'firebase/firestore'

// Message types with different behaviors
export type MessageType = 
  | 'participant'  // Normal anonymous message
  | 'moderator'    // Visible moderator message (branded, non-votable)
  | 'prober'       // Looks like participant message but sent to all
  | 'super'        // Random distribution for idea spreading
  | 'system'       // System announcements

// Main message interface
export interface Message {
  id: string
  sessionId: string
  
  // Content
  text: string
  type: MessageType
  
  // Anonymous author
  authorId: string // Random ID per session
  
  // Timestamp
  created: Timestamp
  
  // Propagation data
  propagation: MessagePropagation
  
  // Aggregated stats (updated async)
  stats: MessageStats
  
  // Moderation
  flagged?: boolean
  flagReason?: string
}

// How the message spreads through rings
export interface MessagePropagation {
  // Current ring distribution
  rings: number[] // Array of participant IDs in each ring
  
  // Propagation state
  currentRing: number
  maxRing: number
  
  // Speed factors
  baseSpeed: number
  viralCoefficient: number // Based on votes
  
  // Spread tracking
  totalReach: number // How many have seen it
  spreadRate: number // Messages per minute
}

// Aggregated message statistics
export interface MessageStats {
  // Voting data
  voteCount: number
  averageScore: number // 0-1 scale
  scoreDistribution: number[] // Histogram of scores
  
  // Engagement
  responseTime: number // Avg seconds to vote
  viralScore: number // How viral it went
  
  // AI analysis (added async)
  sentiment?: number // -1 to 1
  topics?: string[] // Extracted topics
  entities?: string[] // Named entities
}

// Vote on a message
export interface Vote {
  id: string
  messageId: string
  sessionId: string
  
  // Anonymous voter
  voterId: string // Participant ID
  
  // Vote data
  score: number // 0-1 scale
  intensity: number // Swipe velocity
  direction: 'left' | 'right'
  
  // Timing
  created: Timestamp
  responseTime: number // Seconds after seeing
}

// Message draft (for offline support)
export interface MessageDraft {
  localId: string // Client-side ID
  sessionId: string
  text: string
  created: Date
  synced: boolean
  error?: string
}

// AI analysis result for a message
export interface MessageAnalysis {
  messageId: string
  
  // NLP results
  sentiment: {
    score: number // -1 to 1
    magnitude: number // Strength
  }
  
  // Extracted information
  entities: Array<{
    name: string
    type: string
    salience: number
  }>
  
  // Topics/themes
  topics: Array<{
    name: string
    confidence: number
  }>
  
  // Behavioral insights
  influence: {
    isInfluential: boolean
    influenceScore: number
    reason?: string
  }
}