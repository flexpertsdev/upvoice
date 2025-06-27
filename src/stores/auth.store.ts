import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@services/auth.service';
import type { User, AnonymousUser } from '@types';

interface AuthState {
  user: User | null;
  anonymousUser: AnonymousUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signInAnonymously: (sessionId: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (
    email: string,
    password: string,
    displayName: string,
    organizationId?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        anonymousUser: null,
        isLoading: true,
        error: null,

        signInAnonymously: async (sessionId: string, displayName?: string) => {
          set({ isLoading: true, error: null });
          try {
            const anonymousUser = await authService.signInAnonymously(sessionId, displayName);
            set({ anonymousUser, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        signInWithEmail: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const user = await authService.signInWithEmail(email, password);
            set({ user, anonymousUser: null, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        createAccount: async (
          email: string,
          password: string,
          displayName: string,
          organizationId?: string
        ) => {
          set({ isLoading: true, error: null });
          try {
            const user = await authService.createAccount(
              email,
              password,
              displayName,
              organizationId
            );
            set({ user, anonymousUser: null, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        signOut: async () => {
          set({ isLoading: true, error: null });
          try {
            await authService.signOut();
            set({ user: null, anonymousUser: null, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        resetPassword: async (email: string) => {
          set({ isLoading: true, error: null });
          try {
            await authService.sendPasswordResetEmail(email);
            set({ isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        updateUser: (updates: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...updates } });
          }
        },

        clearError: () => set({ error: null }),

        initializeAuth: () => {
          // Subscribe to auth state changes
          authService.onAuthStateChange((user) => {
            set({ user, isLoading: false });
          });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          anonymousUser: state.anonymousUser
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);

// Selectors
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectIsAnonymous = (state: AuthState) => !!state.anonymousUser;
export const selectCurrentUserId = (state: AuthState) => 
  state.user?.uid || state.anonymousUser?.sessionId || null;
export const selectDisplayName = (state: AuthState) =>
  state.user?.displayName || state.anonymousUser?.displayName || 'Anonymous';