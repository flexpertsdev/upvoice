/**
 * index.ts - Cloud Functions Entry Point
 * 
 * Exports all Firebase Cloud Functions for upVoice.
 * Functions are organized by type:
 * - Triggers: Firestore event handlers
 * - Scheduled: Cron jobs
 * - API: HTTP endpoints
 * 
 * Best practices:
 * - Keep functions small and focused
 * - Use TypeScript for type safety
 * - Handle errors gracefully
 * - Log important events
 * - Set appropriate timeouts
 * - Use environment config
 * 
 * Related files:
 * - triggers/*: Firestore triggers
 * - scheduled/*: Scheduled functions
 * - api/*: HTTP endpoints
 * - utils/*: Shared utilities
 */

import * as functions from 'firebase-functions'

// Configure regions for better performance
const FUNCTION_REGION = 'us-central1' // Or your preferred region

// Set default timeout and memory
const DEFAULT_RUNTIME_OPTIONS: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '512MB' as const,
}

// ===== FIRESTORE TRIGGERS =====

// Message created - Handle propagation and analysis
export { onMessageCreate } from './triggers/onMessageCreate'

// Vote created - Update message stats and propagation
export { onVoteCreate } from './triggers/onVoteCreate'

// Session updated - Handle status changes
export { onSessionUpdate } from './triggers/onSessionUpdate'

// ===== SCHEDULED FUNCTIONS =====

// Clean up old sessions
export { cleanupSessions } from './scheduled/cleanupSessions'

// Generate session reports
export { generateReports } from './scheduled/generateReports'

// ===== HTTP API ENDPOINTS =====

// Session management
export { createSession } from './api/createSession'
export { joinSession } from './api/joinSession'

// AI analysis
export { analyzeSession } from './api/analyzeSession'

// Data export
export { exportData } from './api/exportData'

// ===== CALLABLE FUNCTIONS =====

// These can be called directly from the client SDK

// Submit a message
export const submitMessage = functions
  .region(FUNCTION_REGION)
  .runWith(DEFAULT_RUNTIME_OPTIONS)
  .https.onCall(async (data, context) => {
    // TODO: Implement message submission
    // - Validate input
    // - Check permissions
    // - Create message
    // - Trigger propagation
  })

// Record a vote
export const recordVote = functions
  .region(FUNCTION_REGION)
  .runWith(DEFAULT_RUNTIME_OPTIONS)
  .https.onCall(async (data, context) => {
    // TODO: Implement vote recording
    // - Validate vote data
    // - Check for duplicate
    // - Update message stats
    // - Adjust propagation
  })

// Get AI insights
export const getInsights = functions
  .region(FUNCTION_REGION)
  .runWith({ ...DEFAULT_RUNTIME_OPTIONS, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // TODO: Implement AI insights
    // - Check permissions
    // - Query analysis data
    // - Format response
    // - Cache results
  })