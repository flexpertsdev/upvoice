import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, SessionSettings, Participant } from '@types';
import { sessionService } from '@services/session.service';
import { useSessionStore } from '@stores/session.store';
import { useAuthStore } from '@stores/auth.store';
import toast from 'react-hot-toast';

interface UseSessionOptions {
  sessionId?: string;
  sessionCode?: string;
  autoJoin?: boolean;
}

export const useSession = (options: UseSessionOptions = {}) => {
  const navigate = useNavigate();
  const { user, anonymousUser } = useAuthStore();
  const {
    session,
    isLoading,
    error,
    setSession,
    setLoading,
    setError,
    addParticipant,
    removeParticipant,
    updateParticipant,
  } = useSessionStore();

  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load session by ID or code
  useEffect(() => {
    if (options.sessionId || options.sessionCode) {
      loadSession();
    }
  }, [options.sessionId, options.sessionCode]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);

      let loadedSession: Session | null = null;

      if (options.sessionId) {
        loadedSession = await sessionService.getSession(options.sessionId);
      } else if (options.sessionCode) {
        loadedSession = await sessionService.getSessionByCode(options.sessionCode);
      }

      if (loadedSession) {
        setSession(loadedSession);
        
        // Auto-join if enabled and not already a participant
        if (options.autoJoin && !isParticipant(loadedSession)) {
          await joinSession(loadedSession.id);
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Create a new session
  const createSession = async (
    title: string,
    settings?: Partial<SessionSettings>
  ): Promise<Session | null> => {
    if (!user) {
      toast.error('You must be logged in to create a session');
      navigate('/login');
      return null;
    }

    try {
      setIsCreating(true);
      const newSession = await sessionService.createSession({
        title,
        organizerId: user.uid,
        settings: {
          maxParticipants: 50,
          allowAnonymous: true,
          requireApproval: false,
          enableVoting: true,
          enableModeration: true,
          votingType: 'slider',
          sessionDuration: 60,
          ...settings,
        },
      });

      setSession(newSession);
      toast.success('Session created successfully!');
      
      // Navigate to the session page
      navigate(`/session/${newSession.id}`);
      
      return newSession;
    } catch (err) {
      console.error('Failed to create session:', err);
      toast.error('Failed to create session');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Join a session
  const joinSession = async (
    sessionIdOrCode: string,
    displayName?: string
  ): Promise<boolean> => {
    try {
      setIsJoining(true);
      
      // Determine if it's an ID or code
      const isCode = sessionIdOrCode.length === 6 && /^[A-Z0-9]+$/.test(sessionIdOrCode);
      
      // Get session if joining by code
      let targetSession = session;
      if (isCode && (!session || session.code !== sessionIdOrCode)) {
        targetSession = await sessionService.getSessionByCode(sessionIdOrCode);
        if (targetSession) {
          setSession(targetSession);
        }
      }

      if (!targetSession) {
        throw new Error('Session not found');
      }

      // Check if already a participant
      if (isParticipant(targetSession)) {
        toast.info('You are already in this session');
        return true;
      }

      // Check session capacity
      if (targetSession.settings.maxParticipants && 
          targetSession.participantCount >= targetSession.settings.maxParticipants) {
        throw new Error('Session is full');
      }

      // Create participant
      const participant: Participant = {
        id: user?.uid || anonymousUser?.uid || '',
        userId: user?.uid,
        sessionId: targetSession.id,
        displayName: displayName || user?.displayName || anonymousUser?.displayName || 'Anonymous',
        email: user?.email,
        avatarUrl: user?.photoURL,
        role: 'participant',
        status: 'active',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
      };

      // Add to session
      await sessionService.joinSession(targetSession.id, participant);
      addParticipant(participant);
      
      toast.success('Joined session successfully!');
      navigate(`/session/${targetSession.id}`);
      
      return true;
    } catch (err) {
      console.error('Failed to join session:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to join session');
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  // Leave a session
  const leaveSession = async (): Promise<void> => {
    if (!session) return;

    try {
      const participantId = user?.uid || anonymousUser?.uid;
      if (!participantId) return;

      await sessionService.leaveSession(session.id, participantId);
      removeParticipant(participantId);
      
      toast.success('Left session');
      navigate('/');
    } catch (err) {
      console.error('Failed to leave session:', err);
      toast.error('Failed to leave session');
    }
  };

  // Update session settings (organizer only)
  const updateSession = async (
    updates: Partial<Session>
  ): Promise<boolean> => {
    if (!session || !isOrganizer()) {
      toast.error('You do not have permission to update this session');
      return false;
    }

    try {
      setIsUpdating(true);
      const updatedSession = await sessionService.updateSession(session.id, updates);
      setSession(updatedSession);
      toast.success('Session updated');
      return true;
    } catch (err) {
      console.error('Failed to update session:', err);
      toast.error('Failed to update session');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Start session (organizer only)
  const startSession = async (): Promise<boolean> => {
    if (!session || !isOrganizer()) {
      toast.error('You do not have permission to start this session');
      return false;
    }

    return updateSession({
      status: 'active',
      startTime: new Date(),
    });
  };

  // End session (organizer only)
  const endSession = async (): Promise<boolean> => {
    if (!session || !isOrganizer()) {
      toast.error('You do not have permission to end this session');
      return false;
    }

    return updateSession({
      status: 'completed',
      endTime: new Date(),
    });
  };

  // Pause/resume session (organizer only)
  const togglePause = async (): Promise<boolean> => {
    if (!session || !isOrganizer()) {
      toast.error('You do not have permission to pause this session');
      return false;
    }

    return updateSession({
      status: session.status === 'paused' ? 'active' : 'paused',
    });
  };

  // Helper functions
  const isParticipant = useCallback((targetSession?: Session): boolean => {
    const checkSession = targetSession || session;
    if (!checkSession) return false;
    
    const userId = user?.uid || anonymousUser?.uid;
    if (!userId) return false;

    return checkSession.participantIds?.includes(userId) || false;
  }, [session, user, anonymousUser]);

  const isOrganizer = useCallback((): boolean => {
    if (!session || !user) return false;
    return session.organizerId === user.uid;
  }, [session, user]);

  const isModerator = useCallback((): boolean => {
    if (!session) return false;
    const userId = user?.uid || anonymousUser?.uid;
    if (!userId) return false;

    const participant = useSessionStore.getState().participants.find(
      p => p.userId === userId
    );
    return participant?.role === 'moderator' || isOrganizer();
  }, [session, user, anonymousUser]);

  // Get session URL
  const getSessionUrl = useCallback((): string => {
    if (!session) return '';
    return `${window.location.origin}/join/${session.code}`;
  }, [session]);

  // Copy session code to clipboard
  const copySessionCode = useCallback(async (): Promise<void> => {
    if (!session) return;
    
    try {
      await navigator.clipboard.writeText(session.code);
      toast.success('Session code copied!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  }, [session]);

  // Copy session URL to clipboard
  const copySessionUrl = useCallback(async (): Promise<void> => {
    if (!session) return;
    
    try {
      await navigator.clipboard.writeText(getSessionUrl());
      toast.success('Session link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  }, [session, getSessionUrl]);

  return {
    // State
    session,
    isLoading,
    error,
    isJoining,
    isCreating,
    isUpdating,
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    updateSession,
    startSession,
    endSession,
    togglePause,
    loadSession,
    
    // Helpers
    isParticipant: isParticipant(),
    isOrganizer: isOrganizer(),
    isModerator: isModerator(),
    getSessionUrl,
    copySessionCode,
    copySessionUrl,
  };
};

// Hook for session list/search
export const useSessionList = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserSessions = async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const userSessions = await sessionService.getUserSessions(user.uid);
      setSessions(userSessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const searchSessions = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // In a real app, this would search on the backend
      const allSessions = await sessionService.getUserSessions(
        useAuthStore.getState().user?.uid || ''
      );
      const filtered = allSessions.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.code.includes(query.toUpperCase())
      );
      setSessions(filtered);
    } catch (err) {
      console.error('Failed to search sessions:', err);
      setError('Failed to search sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserSessions();
  }, []);

  return {
    sessions,
    isLoading,
    error,
    loadUserSessions,
    searchSessions,
  };
};