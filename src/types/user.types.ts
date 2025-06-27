/**
 * user.types.ts - User and Permission Type Definitions
 * 
 * Defines the structure for users, roles, and permissions.
 * Critical for maintaining the anonymous-but-verified model.
 * 
 * Key principles:
 * - Clear role separation
 * - Minimal PII storage
 * - Session-scoped identities
 * - Organization boundaries
 * 
 * Related files:
 * - services/auth.ts: Uses these types
 * - stores/authStore.ts: State management
 * - firestore.rules: Enforces permissions
 */

// Organization - Top level container
export interface Organization {
  id: string
  name: string
  plan: 'free' | 'professional' | 'enterprise'
  domain?: string // For email domain verification
  created: Date
  settings: OrganizationSettings
}

export interface OrganizationSettings {
  // Branding
  logoUrl?: string
  primaryColor?: string
  
  // Features
  enabledFeatures: string[]
  maxSessions: number
  maxParticipants: number
  
  // Security
  enforceSSO?: boolean
  allowedDomains?: string[]
}

// User roles within an organization
export interface OrganizationMember {
  id: string
  email: string // Only stored for moderators/admins
  role: 'admin' | 'moderator' | 'viewer'
  organizationId: string
  created: Date
}

// Anonymous participant in a session
export interface SessionParticipant {
  id: string // Random ID, unique per session
  sessionId: string
  joinedAt: Date
  lastActive: Date
  isActive: boolean
  
  // No email or identifying info stored here!
  // This maintains anonymity
  
  // Activity metrics (anonymous)
  stats: {
    messagesWritten: number
    messagesVoted: number
    avgResponseTime: number
  }
}

// Permission check results
export interface PermissionCheck {
  allowed: boolean
  reason?: string
  requiresAuth?: boolean
}

// Session access control
export interface SessionAccess {
  id: string
  sessionId: string
  type: 'public' | 'allowlist' | 'domain'
  
  // For allowlist type
  allowedEmails?: string[]
  
  // For domain type
  allowedDomains?: string[]
  
  // Access settings
  requiresVerification: boolean
  maxParticipants?: number
}

// Audit trail (for compliance)
export interface AccessLog {
  id: string
  timestamp: Date
  action: 'session_joined' | 'session_created' | 'permission_denied'
  
  // What happened
  sessionId?: string
  organizationId?: string
  
  // Who (hashed for participants)
  actorId: string
  actorType: 'participant' | 'moderator' | 'admin'
  
  // No message content ever logged!
}