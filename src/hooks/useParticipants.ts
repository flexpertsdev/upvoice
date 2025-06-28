import { useState, useEffect, useCallback } from 'react';
import { Participant, ParticipantRole } from '@/types';
import { sessionService } from '@services/session.service';
import { useSessionStore } from '@stores/session.store';
import { useAuthStore } from '@stores/auth.store';
import toast from 'react-hot-toast';

interface UseParticipantsOptions {
  sessionId?: string;
  autoLoad?: boolean;
}

export const useParticipants = (options: UseParticipantsOptions = {}) => {
  const { session } = useSessionStore();
  const { user } = useAuthStore();
  const sessionId = options.sessionId || session?.id;

  const {
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
  } = useSessionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's participant
  const currentParticipant = participants.find(
    p => p.userId === user?.uid
  );

  // Check if current user is moderator
  const isModerator = currentParticipant?.role === 'moderator' || 
    (session && session.organizerId === user?.uid);

  // Load participants
  const loadParticipants = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const loadedParticipants = await sessionService.getParticipants(sessionId);
      
      // Clear and reload participants
      useSessionStore.setState({ participants: loadedParticipants });
    } catch (err) {
      console.error('Failed to load participants:', err);
      setError('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Subscribe to participant changes
  const subscribeToParticipants = useCallback(() => {
    if (!sessionId) return null;

    return sessionService.subscribeToParticipants(
      sessionId,
      (participant, changeType) => {
        switch (changeType) {
          case 'added':
            addParticipant(participant);
            if (participant.userId !== user?.uid) {
              toast(`${participant.displayName} joined the session`, {
                icon: '=K',
              });
            }
            break;
          case 'modified':
            updateParticipant(participant.id, participant);
            break;
          case 'removed':
            removeParticipant(participant.id);
            if (participant.userId !== user?.uid) {
              toast(`${participant.displayName} left the session`, {
                icon: '=K',
              });
            }
            break;
        }
      }
    );
  }, [sessionId, user?.uid, addParticipant, updateParticipant, removeParticipant]);

  // Update participant role (moderator only)
  const updateRole = async (
    participantId: string,
    role: ParticipantRole
  ): Promise<boolean> => {
    if (!isModerator) {
      toast.error('Only moderators can change roles');
      return false;
    }

    try {
      await sessionService.updateParticipantRole(sessionId!, participantId, role);
      updateParticipant(participantId, { role });
      toast.success('Role updated');
      return true;
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('Failed to update role');
      return false;
    }
  };

  // Remove participant (moderator only)
  const removeParticipantFromSession = async (
    participantId: string
  ): Promise<boolean> => {
    if (!isModerator) {
      toast.error('Only moderators can remove participants');
      return false;
    }

    try {
      await sessionService.removeParticipant(sessionId!, participantId);
      removeParticipant(participantId);
      toast.success('Participant removed');
      return true;
    } catch (err) {
      console.error('Failed to remove participant:', err);
      toast.error('Failed to remove participant');
      return false;
    }
  };

  // Update participant status
  const updateStatus = async (status: 'active' | 'idle'): Promise<boolean> => {
    if (!currentParticipant) return false;

    try {
      await sessionService.updateParticipantStatus(
        sessionId!,
        currentParticipant.id,
        status
      );
      updateParticipant(currentParticipant.id, { 
        status,
        lastActiveAt: new Date() 
      });
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      return false;
    }
  };

  // Get participants by role
  const getParticipantsByRole = useCallback((role: ParticipantRole) => {
    return participants.filter(p => p.role === role);
  }, [participants]);

  // Get active participants
  const getActiveParticipants = useCallback(() => {
    return participants.filter(p => p.status === 'active');
  }, [participants]);

  // Check if participant is speaking (for future voice features)
  const isSpeaking = useCallback((participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.isSpeaking || false;
  }, [participants]);

  // Auto-load and subscribe
  useEffect(() => {
    if (options.autoLoad !== false && sessionId) {
      loadParticipants();
      const unsubscribe = subscribeToParticipants();
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [sessionId, options.autoLoad]);

  // Update activity status periodically
  useEffect(() => {
    if (!currentParticipant) return;

    const interval = setInterval(() => {
      updateStatus('active');
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [currentParticipant]);

  return {
    participants,
    currentParticipant,
    isModerator,
    isLoading,
    error,
    
    // Actions
    updateRole,
    removeParticipant: removeParticipantFromSession,
    updateStatus,
    loadParticipants,
    
    // Helpers
    getParticipantsByRole,
    getActiveParticipants,
    isSpeaking,
    
    // Counts
    totalCount: participants.length,
    activeCount: getActiveParticipants().length,
    moderatorCount: getParticipantsByRole('moderator').length,
  };
};

// Hook for participant presence
export const usePresence = (sessionId: string) => {
  const { user, anonymousUser } = useAuthStore();
  const userId = user?.uid || anonymousUser?.uid;

  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());

  // Update presence
  const updatePresence = useCallback(async (online: boolean) => {
    if (!userId || !sessionId) return;

    try {
      await sessionService.updatePresence(sessionId, userId, online);
      setIsOnline(online);
      setLastSeen(new Date());
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  }, [sessionId, userId]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    const handleOnline = () => updatePresence(true);
    const handleOffline = () => updatePresence(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', () => updatePresence(false));

    // Initial presence
    updatePresence(true);

    // Heartbeat
    const interval = setInterval(() => {
      if (!document.hidden) {
        updatePresence(true);
      }
    }, 60000); // Every minute

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      updatePresence(false);
    };
  }, [updatePresence]);

  return {
    isOnline,
    lastSeen,
    updatePresence,
  };
};