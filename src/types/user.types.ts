import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
  organizationId?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
  
  // Organization-specific
  organizationRole?: OrganizationRole;
  departments?: string[];
  
  // Stats
  sessionsCreated: number;
  sessionsParticipated: number;
  totalMessages: number;
  totalVotes: number;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';
export type OrganizationRole = 'member' | 'manager' | 'owner';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sessionStart: boolean;
  sessionEnd: boolean;
  mentions: boolean;
  reports: boolean;
}

export interface PrivacyPreferences {
  showEmail: boolean;
  allowAnalytics: boolean;
  shareDataWithOrg: boolean;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  keyboardNavigation: boolean;
}

export interface AnonymousUser {
  uid: string; // Anonymous user ID
  sessionId: string;
  displayName: string;
  color: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  primaryColor?: string;
  
  // Settings
  settings: OrganizationSettings;
  
  // Billing
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingEmail?: string;
  
  // Stats
  memberCount: number;
  sessionCount: number;
  activeSessionCount: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface OrganizationSettings {
  requireEmailVerification: boolean;
  allowedEmailDomains?: string[];
  defaultSessionSettings: {
    requireModeration: boolean;
    aiModerationEnabled: boolean;
    profanityFilter: boolean;
    messageLifespan?: number;
    maxParticipants?: number;
  };
  branding: {
    primaryColor?: string;
    logoUrl?: string;
    customCSS?: string;
  };
  features: {
    aiAnalysis: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    ssoEnabled: boolean;
    advancedAnalytics: boolean;
  };
}