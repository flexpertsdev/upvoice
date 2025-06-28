// Session types
export type {
  SessionSettings,
  SessionSettings as Session, // Alias for backward compatibility
  SessionStats,
  Participant,
  ParticipantRole,
  SessionExport,
  SessionStatus,
  SessionListItem
} from './session.types';

// Add SessionType enum
export enum SessionType {
  presentation = 'presentation',
  meeting = 'meeting',
  townhall = 'townhall',
  classroom = 'classroom',
  ama = 'ama',
  custom = 'custom'
}

// Message types
export type {
  Message,
  MessageType,
  MessageStatus,
  Vote,
  AIFlag,
  MessageFilter,
  MessageStats,
  RingPosition,
  MessageMetadata
} from './message.types';

// User types
export type {
  User,
  UserRole,
  OrganizationRole,
  UserPreferences,
  NotificationPreferences,
  PrivacyPreferences,
  AccessibilityPreferences,
  AnonymousUser,
  Organization,
  OrganizationSettings
} from './user.types';

// Common types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}