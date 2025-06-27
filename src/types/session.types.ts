/**
 * session.types.ts - Session Type Definitions
 * 
 * Core data structures for discussion sessions.
 * These types define how sessions are created, configured,
 * and managed throughout their lifecycle.
 * 
 * Related files:
 * - services/session.ts: Session management logic
 * - stores/sessionStore.ts: Client-side state
 * - components/moderation/*: Moderator interfaces
 */

import { Timestamp } from 'firebase/firestore'

// Session lifecycle states
export type SessionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'

// Access control types
export type SessionAccessType = 'public' | 'allowlist' | 'domain' | 'password'

// Main session interface
export interface Session {
  id: string
  organizationId: string
  
  // Basic info
  title: string
  description?: string
  topic?: string // Current discussion topic
  
  // Status and timing
  status: SessionStatus
  created: Timestamp
  scheduled?: Timestamp // For future sessions
  started?: Timestamp
  ended?: Timestamp
  
  // Configuration
  config: SessionConfig
  
  // Live statistics
  stats: SessionStats
  
  // Moderator info (not visible to participants)
  moderatorIds: string[]
  createdBy: string
}

// Session configuration
export interface SessionConfig {
  // Access control
  accessType: SessionAccessType
  allowlist?: string[] // Email addresses for allowlist
  allowedDomains?: string[] // Email domains
  password?: string // Hashed password
  
  // Participation settings
  anonymous: boolean // Always true for participants
  maxParticipants?: number
  minParticipants?: number
  
  // Timing
  duration?: number // Minutes
  autoEnd: boolean
  
  // Features
  enableVoting: boolean
  enableMessaging: boolean
  enableObservers: boolean
  
  // Message settings
  messageMaxLength: number // Character limit
  messageRateLimit?: number // Messages per minute
  
  // Propagation settings
  propagationRings: number // Number of rings
  propagationSpeed: number // Base speed multiplier
}

// Real-time session statistics
export interface SessionStats {
  // Participation
  totalParticipants: number
  activeParticipants: number
  
  // Activity
  totalMessages: number
  totalVotes: number
  messagesPerMinute: number
  
  // Engagement
  avgVotesPerMessage: number
  avgResponseTime: number // Seconds
  participationRate: number // % who wrote messages
  
  // AI insights (updated periodically)
  topThemes?: string[]
  overallSentiment?: number
  lastAnalyzed?: Timestamp
}

// Session template for quick setup
export interface SessionTemplate {
  id: string
  name: string
  description: string
  category: 'general' | 'feedback' | 'brainstorm' | 'decision' | 'custom'
  
  // Pre-configured settings
  defaultConfig: Partial<SessionConfig>
  
  // Suggested prompts
  suggestedTopics?: string[]
  proberMessages?: string[]
  
  // Branding
  iconUrl?: string
}

// Session invitation
export interface SessionInvitation {
  id: string
  sessionId: string
  
  // Invitation details
  inviteCode: string // Short code for easy sharing
  inviteUrl: string // Full URL with code
  
  // Restrictions
  maxUses?: number
  usedCount: number
  expiresAt?: Timestamp
  
  // Tracking
  created: Timestamp
  createdBy: string
}