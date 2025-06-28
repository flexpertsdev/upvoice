import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageMetadata } from '@/types';
import { messageService } from '@services/message.service';
import { useSessionStore } from '@stores/session.store';
import { useAuthStore } from '@stores/auth.store';
import { MessageRing } from '@utils/messageRing';
import toast from 'react-hot-toast';

interface UseMessagesOptions {
  sessionId?: string;
  autoLoad?: boolean;
  pageSize?: number;
}

export const useMessages = (options: UseMessagesOptions = {}) => {
  const { currentSession } = useSessionStore();
  const { user, anonymousUser } = useAuthStore();
  const sessionId = options.sessionId || currentSession?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messageRingRef = useRef<MessageRing | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize message ring
  useEffect(() => {
    if (!sessionId) return;

    messageRingRef.current = new MessageRing(sessionId);
    
    return () => {
      messageRingRef.current = null;
    };
  }, [sessionId]);

  // Load initial messages
  const loadMessages = useCallback(async (reset: boolean = true) => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const loadedMessages = await messageService.getSessionMessages(
        sessionId,
        options.pageSize || 50
      );

      if (reset) {
        setMessages(loadedMessages);
      } else {
        setMessages(prev => [...prev, ...loadedMessages]);
      }

      setHasMore(loadedMessages.length === (options.pageSize || 50));
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, options.pageSize]);

  // Subscribe to real-time messages
  const subscribeToMessages = useCallback(() => {
    if (!sessionId) return;

    unsubscribeRef.current = messageService.subscribeToSessionMessages(
      sessionId,
      (newMessage) => {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) return prev;

          // Add to beginning (newest first) or end based on your preference
          return [newMessage, ...prev];
        });

        // Distribute through ring if it's from current user
        const currentUserId = user?.uid || anonymousUser?.uid;
        if (newMessage.participant.userId === currentUserId && messageRingRef.current) {
          messageRingRef.current.distributeMessage(newMessage);
        }
      }
    );
  }, [sessionId, user, anonymousUser]);

  // Send a message
  const sendMessage = async (
    content: string,
    parentMessageId?: string,
    metadata?: Partial<MessageMetadata>
  ): Promise<Message | null> => {
    if (!sessionId || !session) return null;

    const userId = user?.uid || anonymousUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to send messages');
      return null;
    }

    const participant = useSessionStore.getState().participants.find(
      p => p.userId === userId
    );

    if (!participant) {
      toast.error('You must join the session to send messages');
      return null;
    }

    try {
      setIsSending(true);
      
      const message = await messageService.sendMessage({
        sessionId,
        content,
        participant,
        parentMessageId,
        metadata,
      });

      // Message will be added via real-time subscription
      toast.success('Message sent');
      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
      return null;
    } finally {
      setIsSending(false);
    }
  };

  // Delete a message (moderator only)
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted');
      return true;
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message');
      return false;
    }
  };

  // Flag a message for moderation
  const flagMessage = async (messageId: string, reason: string): Promise<boolean> => {
    try {
      await messageService.flagMessage(messageId, reason);
      toast.success('Message flagged for review');
      return true;
    } catch (err) {
      console.error('Failed to flag message:', err);
      toast.error('Failed to flag message');
      return false;
    }
  };

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !sessionId) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    try {
      setIsLoading(true);
      const moreMessages = await messageService.getSessionMessages(
        sessionId,
        options.pageSize || 50,
        lastMessage.timestamp
      );

      setMessages(prev => [...prev, ...moreMessages]);
      setHasMore(moreMessages.length === (options.pageSize || 50));
    } catch (err) {
      console.error('Failed to load more messages:', err);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages, hasMore, isLoading, options.pageSize]);

  // Auto-load messages and subscribe
  useEffect(() => {
    if (options.autoLoad !== false && sessionId) {
      loadMessages();
      subscribeToMessages();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId, options.autoLoad]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    isSending,
    sendMessage,
    deleteMessage,
    flagMessage,
    loadMessages,
    loadMore,
    refresh: () => loadMessages(true),
  };
};

// Hook for message search
export const useMessageSearch = (sessionId: string) => {
  const [results, setResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setQuery(searchQuery);
    setIsSearching(true);

    try {
      // In a real app, this would be a server-side search
      const allMessages = await messageService.getSessionMessages(sessionId, 1000);
      const filtered = allMessages.filter(m =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.participant.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    results,
    isSearching,
    search,
    clearSearch,
  };
};

// Hook for message analytics
export const useMessageAnalytics = (sessionId: string) => {
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    averageLength: 0,
    messagesPerMinute: 0,
    topParticipants: [] as Array<{ participant: string; count: number }>,
    sentimentDistribution: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
  });

  const calculateAnalytics = useCallback(async () => {
    try {
      const messages = await messageService.getSessionMessages(sessionId, 1000);
      
      if (messages.length === 0) return;

      // Total messages
      const totalMessages = messages.length;

      // Average message length
      const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
      const averageLength = Math.round(totalLength / totalMessages);

      // Messages per minute
      const sessionDuration = messages.length > 1
        ? (messages[0].timestamp.getTime() - messages[messages.length - 1].timestamp.getTime()) / 60000
        : 0;
      const messagesPerMinute = sessionDuration > 0 
        ? Math.round(totalMessages / sessionDuration * 10) / 10 
        : 0;

      // Top participants
      const participantCounts = messages.reduce((acc, m) => {
        const name = m.participant.displayName;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topParticipants = Object.entries(participantCounts)
        .map(([participant, count]) => ({ participant, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Sentiment distribution (simplified - in real app would use AI)
      const sentimentDistribution = messages.reduce((acc, m) => {
        // Simple sentiment analysis based on keywords
        const positive = /good|great|excellent|love|awesome|fantastic/i.test(m.content);
        const negative = /bad|terrible|hate|awful|poor|worst/i.test(m.content);
        
        if (positive) acc.positive++;
        else if (negative) acc.negative++;
        else acc.neutral++;
        
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });

      setAnalytics({
        totalMessages,
        averageLength,
        messagesPerMinute,
        topParticipants,
        sentimentDistribution,
      });
    } catch (err) {
      console.error('Failed to calculate analytics:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      calculateAnalytics();
    }
  }, [sessionId, calculateAnalytics]);

  return analytics;
};