import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { FirebaseConfig } from '@/types';

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in production)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Firebase collections
export const COLLECTIONS = {
  SESSIONS: 'sessions',
  MESSAGES: 'messages',
  PARTICIPANTS: 'participants',
  VOTES: 'votes',
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  REPORTS: 'reports',
  ANALYTICS: 'analytics'
} as const;

// Firebase function names
export const FUNCTIONS = {
  CREATE_SESSION: 'createSession',
  JOIN_SESSION: 'joinSession',
  SEND_MESSAGE: 'sendMessage',
  VOTE_MESSAGE: 'voteMessage',
  MODERATE_MESSAGE: 'moderateMessage',
  EXPORT_SESSION: 'exportSession',
  ANALYZE_SESSION: 'analyzeSession',
  CLEANUP_EXPIRED_MESSAGES: 'cleanupExpiredMessages'
} as const;

// Rate limiting
export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 10,
  VOTES_PER_MINUTE: 30,
  SESSION_JOINS_PER_HOUR: 20
} as const;

// Default values
export const DEFAULTS = {
  MESSAGE_LIFESPAN_MINUTES: 60,
  MAX_PARTICIPANTS: 100,
  SESSION_DURATION_HOURS: 2,
  ANONYMOUS_DISPLAY_NAMES: [
    'Blue Jay', 'Red Fox', 'Green Turtle', 'Purple Butterfly',
    'Orange Tiger', 'Yellow Canary', 'Pink Flamingo', 'Gray Wolf',
    'Brown Bear', 'Black Panther', 'White Swan', 'Silver Dolphin'
  ],
  PARTICIPANT_COLORS: [
    '#3B82F6', '#EF4444', '#10B981', '#8B5CF6',
    '#F59E0B', '#EAB308', '#EC4899', '#6B7280',
    '#92400E', '#1F2937', '#F3F4F6', '#6366F1'
  ]
} as const;