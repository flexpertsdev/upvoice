import { useState, useCallback, useEffect } from 'react';
import { Vote, Message } from '@/types';
import { voteService } from '@services/vote.service';
import { useAuthStore } from '@stores/auth.store';
import { useSessionStore } from '@stores/session.store';
import toast from 'react-hot-toast';

interface UseVotingOptions {
  messageId?: string;
  autoLoad?: boolean;
}

export const useVoting = (options: UseVotingOptions = {}) => {
  const { user, anonymousUser } = useAuthStore();
  const userId = user?.uid || anonymousUser?.uid;
  
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate vote statistics
  const voteStats = useCallback(() => {
    if (votes.length === 0) {
      return {
        count: 0,
        average: 0,
        distribution: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
        percentages: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
      };
    }

    const count = votes.length;
    const sum = votes.reduce((acc, v) => acc + v.value, 0);
    const average = sum / count;

    const distribution = votes.reduce(
      (acc, v) => {
        if (v.value > 0.3) acc.positive++;
        else if (v.value < -0.3) acc.negative++;
        else acc.neutral++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    const percentages = {
      positive: Math.round((distribution.positive / count) * 100),
      neutral: Math.round((distribution.neutral / count) * 100),
      negative: Math.round((distribution.negative / count) * 100),
    };

    return {
      count,
      average,
      distribution,
      percentages,
    };
  }, [votes]);

  // Load votes for a message
  const loadVotes = useCallback(async (messageId: string) => {
    if (!messageId) return;

    try {
      setIsLoading(true);
      setError(null);

      const loadedVotes = await voteService.getMessageVotes(messageId);
      setVotes(loadedVotes);

      // Find user's vote
      if (userId) {
        const foundUserVote = loadedVotes.find(v => v.userId === userId);
        setUserVote(foundUserVote || null);
      }
    } catch (err) {
      console.error('Failed to load votes:', err);
      setError('Failed to load votes');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Submit a vote
  const submitVote = async (
    messageId: string,
    value: number
  ): Promise<Vote | null> => {
    if (!userId) {
      toast.error('You must be logged in to vote');
      return null;
    }

    // Validate vote value (-1 to 1)
    if (value < -1 || value > 1) {
      toast.error('Invalid vote value');
      return null;
    }

    try {
      setIsVoting(true);
      setError(null);

      // Check if user already voted
      if (userVote) {
        // Update existing vote
        const updatedVote = await voteService.updateVote(userVote.id, value);
        setUserVote(updatedVote);
        setVotes(prev => prev.map(v => v.id === updatedVote.id ? updatedVote : v));
        toast.success('Vote updated');
        return updatedVote;
      } else {
        // Create new vote
        const participant = useSessionStore.getState().participants.find(
          p => p.userId === userId
        );

        if (!participant) {
          toast.error('You must be a participant to vote');
          return null;
        }

        const newVote = await voteService.submitVote({
          messageId,
          userId,
          participantId: participant.id,
          value,
        });

        setUserVote(newVote);
        setVotes(prev => [...prev, newVote]);
        toast.success('Vote submitted');
        return newVote;
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
      toast.error('Failed to submit vote');
      return null;
    } finally {
      setIsVoting(false);
    }
  };

  // Remove a vote
  const removeVote = async (messageId: string): Promise<boolean> => {
    if (!userVote) return false;

    try {
      setIsVoting(true);
      await voteService.deleteVote(userVote.id);
      
      setVotes(prev => prev.filter(v => v.id !== userVote.id));
      setUserVote(null);
      
      toast.success('Vote removed');
      return true;
    } catch (err) {
      console.error('Failed to remove vote:', err);
      toast.error('Failed to remove vote');
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  // Subscribe to vote updates
  const subscribeToVotes = useCallback((messageId: string) => {
    if (!messageId) return null;

    return voteService.subscribeToMessageVotes(
      messageId,
      (vote, changeType) => {
        switch (changeType) {
          case 'added':
            setVotes(prev => [...prev, vote]);
            if (vote.userId === userId) {
              setUserVote(vote);
            }
            break;
          case 'modified':
            setVotes(prev => prev.map(v => v.id === vote.id ? vote : v));
            if (vote.userId === userId) {
              setUserVote(vote);
            }
            break;
          case 'removed':
            setVotes(prev => prev.filter(v => v.id !== vote.id));
            if (vote.userId === userId) {
              setUserVote(null);
            }
            break;
        }
      }
    );
  }, [userId]);

  // Auto-load votes if messageId provided
  useEffect(() => {
    if (options.autoLoad !== false && options.messageId) {
      loadVotes(options.messageId);
      const unsubscribe = subscribeToVotes(options.messageId);
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [options.messageId, options.autoLoad]);

  const stats = voteStats();

  return {
    votes,
    userVote,
    isVoting,
    isLoading,
    error,
    
    // Actions
    submitVote,
    removeVote,
    loadVotes,
    
    // Statistics
    voteCount: stats.count,
    averageVote: stats.average,
    voteDistribution: stats.distribution,
    votePercentages: stats.percentages,
    
    // Helpers
    hasVoted: !!userVote,
    canVote: !!userId && !userVote,
  };
};

// Hook for session-wide voting analytics
export const useVotingAnalytics = (sessionId: string) => {
  const [analytics, setAnalytics] = useState({
    totalVotes: 0,
    uniqueVoters: 0,
    averageVoteValue: 0,
    mostPositiveMessage: null as Message | null,
    mostNegativeMessage: null as Message | null,
    participationRate: 0,
    votesByTime: [] as Array<{ time: Date; count: number; average: number }>,
  });

  const calculateAnalytics = useCallback(async () => {
    if (!sessionId) return;

    try {
      const data = await voteService.getSessionVotingAnalytics(sessionId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load voting analytics:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    calculateAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(calculateAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [calculateAnalytics]);

  return analytics;
};

// Hook for bulk voting (moderator feature)
export const useBulkVoting = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const submitBulkVotes = async (
    votes: Array<{ messageId: string; value: number }>
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      
      const results = await Promise.all(
        votes.map(({ messageId, value }) =>
          voteService.submitVote({
            messageId,
            userId: 'system',
            participantId: 'system',
            value,
          }).catch(() => null)
        )
      );

      const successCount = results.filter(r => r !== null).length;
      toast.success(`${successCount} votes submitted`);
      
      return successCount === votes.length;
    } catch (err) {
      console.error('Failed to submit bulk votes:', err);
      toast.error('Failed to submit bulk votes');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    submitBulkVotes,
  };
};