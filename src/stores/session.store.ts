import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
import { sessionService } from '@services/session.service';
import type {
  SessionSettings,
  SessionStats,
  Participant,
  SessionListItem,
  Message
} from '@types';

interface SessionState {
  // Current session
  currentSession: SessionSettings | null;
  participants: Participant[];
  sessionStats: SessionStats | null;
  isHost: boolean;
  currentParticipant: Participant | null;

  // Session lists
  userSessions: SessionListItem[];
  organizationSessions: SessionListItem[];

  // UI state
  isLoading: boolean;
  error: string | null;
  isJoining: boolean;

  // Subscriptions
  unsubscribers: (() => void)[];

  // Actions
  createSession: (settings: Partial<SessionSettings>) => Promise<SessionSettings>;
  joinSession: (sessionId: string, participantData: Partial<Participant>) => Promise<void>;
  joinSessionByCode: (accessCode: string, participantData: Partial<Participant>) => Promise<void>;
  leaveSession: () => void;
  updateSession: (updates: Partial<SessionSettings>) => Promise<void>;
  endSession: () => Promise<void>;
  loadUserSessions: (userId: string) => Promise<void>;
  loadOrganizationSessions: (organizationId: string) => Promise<void>;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeAll: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentSession: null,
      participants: [],
      sessionStats: null,
      isHost: false,
      currentParticipant: null,
      userSessions: [],
      organizationSessions: [],
      isLoading: false,
      error: null,
      isJoining: false,
      unsubscribers: [],

      // Actions
      createSession: async (settings: Partial<SessionSettings>) => {
        set({ isLoading: true, error: null });
        try {
          const session = await sessionService.createSession(settings);
          set({
            currentSession: session,
            isHost: true,
            isLoading: false
          });
          
          // Subscribe to updates
          get().subscribeToSession(session.id);
          
          return session;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      joinSession: async (sessionId: string, participantData: Partial<Participant>) => {
        set({ isJoining: true, error: null });
        try {
          // Get session details
          const session = await sessionService.getSession(sessionId);
          if (!session) {
            throw new Error('Session not found');
          }

          // Join session
          const participant = await sessionService.joinSession(sessionId, participantData);
          
          set({
            currentSession: session,
            currentParticipant: participant,
            isHost: false,
            isJoining: false
          });

          // Subscribe to updates
          get().subscribeToSession(sessionId);
        } catch (error: any) {
          set({ error: error.message, isJoining: false });
          throw error;
        }
      },

      joinSessionByCode: async (accessCode: string, participantData: Partial<Participant>) => {
        set({ isJoining: true, error: null });
        try {
          // Find session by code
          const session = await sessionService.getSessionByCode(accessCode);
          if (!session) {
            throw new Error('Invalid access code');
          }

          // Join the session
          await get().joinSession(session.id, participantData);
        } catch (error: any) {
          set({ error: error.message, isJoining: false });
          throw error;
        }
      },

      leaveSession: () => {
        // Unsubscribe from all listeners
        get().unsubscribeAll();

        // Clear session data
        set({
          currentSession: null,
          participants: [],
          sessionStats: null,
          isHost: false,
          currentParticipant: null,
          error: null
        });
      },

      updateSession: async (updates: Partial<SessionSettings>) => {
        const session = get().currentSession;
        if (!session) return;

        set({ isLoading: true, error: null });
        try {
          await sessionService.updateSession(session.id, updates);
          set(
            produce((state: SessionState) => {
              if (state.currentSession) {
                Object.assign(state.currentSession, updates);
              }
              state.isLoading = false;
            })
          );
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      endSession: async () => {
        const session = get().currentSession;
        if (!session || !get().isHost) return;

        set({ isLoading: true, error: null });
        try {
          await sessionService.endSession(session.id);
          get().leaveSession();
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadUserSessions: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await sessionService.listUserSessions(userId);
          set({ userSessions: sessions, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadOrganizationSessions: async (organizationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await sessionService.listOrganizationSessions(organizationId);
          set({ organizationSessions: sessions, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      subscribeToSession: (sessionId: string) => {
        // Subscribe to session updates
        const unsubSession = sessionService.subscribeToSession(sessionId, (session) => {
          set({ currentSession: session });
        });

        // Subscribe to participants
        const unsubParticipants = sessionService.subscribeToParticipants(
          sessionId,
          (participants) => {
            set({ participants });
          }
        );

        // Subscribe to stats
        const unsubStats = sessionService.subscribeToStats(sessionId, (stats) => {
          set({ sessionStats: stats });
        });

        // Store unsubscribers
        set(
          produce((state: SessionState) => {
            state.unsubscribers.push(unsubSession, unsubParticipants, unsubStats);
          })
        );
      },

      unsubscribeAll: () => {
        const unsubscribers = get().unsubscribers;
        unsubscribers.forEach(unsub => unsub());
        set({ unsubscribers: [] });
      },

      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    })),
    {
      name: 'session-store'
    }
  )
);

// Selectors
export const selectIsInSession = (state: SessionState) => !!state.currentSession;
export const selectIsSessionActive = (state: SessionState) => 
  state.currentSession?.isActive ?? false;
export const selectParticipantCount = (state: SessionState) => 
  state.participants.length;
export const selectIsModerator = (state: SessionState) =>
  state.currentParticipant?.isModerator ?? state.isHost;