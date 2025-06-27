import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';
import { authService } from '@services/auth.service';

export function useAuth() {
  const {
    user,
    anonymousUser,
    isLoading,
    error,
    signInAnonymously,
    signInWithEmail,
    createAccount,
    signOut,
    resetPassword,
    clearError,
    initializeAuth
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth listener on mount
    initializeAuth();
  }, [initializeAuth]);

  return {
    // State
    user,
    anonymousUser,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAnonymous: !!anonymousUser || user?.isAnonymous,
    
    // Computed values
    displayName: user?.displayName || anonymousUser?.displayName || 'Anonymous',
    userId: user?.uid || anonymousUser?.sessionId || null,
    
    // Actions
    signInAnonymously,
    signInWithEmail,
    createAccount,
    signOut,
    resetPassword,
    clearError
  };
}

// Hook for requiring authentication
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // In a real app, you'd use react-router to redirect
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

// Hook for anonymous session authentication
export function useAnonymousAuth(sessionId: string) {
  const { signInAnonymously, isAnonymous, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (!isAnonymous && sessionId && !isLoading) {
      signInAnonymously(sessionId);
    }
  }, [sessionId, isAnonymous, isLoading, signInAnonymously]);
  
  return { isReady: isAnonymous && !isLoading, error };
}