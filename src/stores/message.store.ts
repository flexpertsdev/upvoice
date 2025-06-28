import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
import { messageService } from '@services/message.service';
import type { Message, MessageFilter, MessageStats, Vote, RingPosition } from '@/types';

interface MessageState {
  // Messages
  messages: Message[];
  pinnedMessages: Message[];
  highlightedMessages: Message[];
  
  // Ring positions
  ringPositions: RingPosition[];
  
  // Stats
  messageStats: MessageStats | null;
  
  // UI state
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastMessageDoc: any | null;
  hasMore: boolean;
  
  // Subscriptions
  unsubscriber: (() => void) | null;
  
  // Actions
  sendMessage: (
    sessionId: string,
    participantId: string,
    content: string,
    parentId?: string
  ) => Promise<void>;
  loadMessages: (filter: MessageFilter, reset?: boolean) => Promise<void>;
  voteOnMessage: (messageId: string, participantId: string, value: number) => Promise<void>;
  moderateMessage: (
    messageId: string,
    moderatorId: string,
    action: 'hide' | 'delete',
    reason?: string
  ) => Promise<void>;
  pinMessage: (messageId: string, isPinned: boolean) => Promise<void>;
  highlightMessage: (messageId: string, isHighlighted: boolean) => Promise<void>;
  subscribeToMessages: (sessionId: string) => void;
  unsubscribe: () => void;
  loadRingPositions: (sessionId: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useMessageStore = create<MessageState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      messages: [],
      pinnedMessages: [],
      highlightedMessages: [],
      ringPositions: [],
      messageStats: null,
      isLoading: false,
      isSending: false,
      error: null,
      lastMessageDoc: null,
      hasMore: true,
      unsubscriber: null,

      // Actions
      sendMessage: async (
        sessionId: string,
        participantId: string,
        content: string,
        parentId?: string
      ) => {
        set({ isSending: true, error: null });
        try {
          const message = await messageService.sendMessage(
            sessionId,
            participantId,
            content,
            'text',
            parentId
          );
          
          // Optimistically add to messages
          set(
            produce((state: MessageState) => {
              state.messages.unshift(message);
              state.isSending = false;
            })
          );
        } catch (error: any) {
          set({ error: error.message, isSending: false });
          throw error;
        }
      },

      loadMessages: async (filter: MessageFilter, reset: boolean = false) => {
        set({ isLoading: true, error: null });
        try {
          const lastDoc = reset ? undefined : get().lastMessageDoc;
          const { messages, lastDoc: newLastDoc } = await messageService.getMessages(
            filter,
            50,
            lastDoc
          );

          set(
            produce((state: MessageState) => {
              if (reset) {
                state.messages = messages;
              } else {
                // Avoid duplicates
                const existingIds = new Set(state.messages.map(m => m.id));
                const newMessages = messages.filter(m => !existingIds.has(m.id));
                state.messages.push(...newMessages);
              }
              
              state.lastMessageDoc = newLastDoc;
              state.hasMore = messages.length === 50;
              state.isLoading = false;
              
              // Update pinned and highlighted lists
              state.pinnedMessages = state.messages.filter(m => m.isPinned);
              state.highlightedMessages = state.messages.filter(m => m.isHighlighted);
            })
          );
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      voteOnMessage: async (messageId: string, participantId: string, value: number) => {
        try {
          await messageService.voteOnMessage(messageId, participantId, value);
          
          // Optimistically update vote
          set(
            produce((state: MessageState) => {
              const message = state.messages.find(m => m.id === messageId);
              if (message) {
                // Remove existing vote from this participant
                message.votes = message.votes.filter(v => v.participantId !== participantId);
                
                // Add new vote
                if (value !== 0) {
                  message.votes.push({
                    participantId,
                    value,
                    timestamp: new Date()
                  });
                }
                
                // Recalculate counts and score
                message.upvoteCount = message.votes.filter(v => v.value > 0).length;
                message.downvoteCount = message.votes.filter(v => v.value < 0).length;
                const totalVotes = message.votes.reduce((sum, v) => sum + v.value, 0);
                message.score = message.votes.length > 0 ? totalVotes / message.votes.length : 0;
              }
            })
          );
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      moderateMessage: async (
        messageId: string,
        moderatorId: string,
        action: 'hide' | 'delete',
        reason?: string
      ) => {
        try {
          await messageService.moderateMessage(messageId, moderatorId, action, reason);
          
          // Update message status
          set(
            produce((state: MessageState) => {
              const message = state.messages.find(m => m.id === messageId);
              if (message) {
                message.status = action === 'hide' ? 'hidden' : 'deleted';
                message.isModerated = true;
                message.moderatedBy = moderatorId;
                message.moderatedAt = new Date();
                message.moderationReason = reason;
              }
            })
          );
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      pinMessage: async (messageId: string, isPinned: boolean) => {
        try {
          await messageService.togglePinMessage(messageId, isPinned);
          
          set(
            produce((state: MessageState) => {
              const message = state.messages.find(m => m.id === messageId);
              if (message) {
                message.isPinned = isPinned;
                
                // Update pinned list
                if (isPinned) {
                  state.pinnedMessages.push(message);
                } else {
                  state.pinnedMessages = state.pinnedMessages.filter(m => m.id !== messageId);
                }
              }
            })
          );
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      highlightMessage: async (messageId: string, isHighlighted: boolean) => {
        try {
          await messageService.toggleHighlightMessage(messageId, isHighlighted);
          
          set(
            produce((state: MessageState) => {
              const message = state.messages.find(m => m.id === messageId);
              if (message) {
                message.isHighlighted = isHighlighted;
                
                // Update highlighted list
                if (isHighlighted) {
                  state.highlightedMessages.push(message);
                } else {
                  state.highlightedMessages = state.highlightedMessages.filter(
                    m => m.id !== messageId
                  );
                }
              }
            })
          );
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      subscribeToMessages: (sessionId: string) => {
        // Unsubscribe from previous session
        get().unsubscribe();

        // Subscribe to new messages
        const unsubscriber = messageService.subscribeToMessages(
          sessionId,
          (messages) => {
            set(
              produce((state: MessageState) => {
                // Merge new messages with existing ones
                const messageMap = new Map(state.messages.map(m => [m.id, m]));
                messages.forEach(message => {
                  messageMap.set(message.id, message);
                });
                
                state.messages = Array.from(messageMap.values())
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                
                // Update pinned and highlighted lists
                state.pinnedMessages = state.messages.filter(m => m.isPinned);
                state.highlightedMessages = state.messages.filter(m => m.isHighlighted);
              })
            );
          }
        );

        set({ unsubscriber });
      },

      unsubscribe: () => {
        const unsubscriber = get().unsubscriber;
        if (unsubscriber) {
          unsubscriber();
          set({ unsubscriber: null });
        }
      },

      loadRingPositions: async (sessionId: string) => {
        try {
          const positions = await messageService.getRingPositions(sessionId);
          set({ ringPositions: positions });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      clearMessages: () => {
        get().unsubscribe();
        set({
          messages: [],
          pinnedMessages: [],
          highlightedMessages: [],
          ringPositions: [],
          messageStats: null,
          lastMessageDoc: null,
          hasMore: true,
          error: null
        });
      },

      setError: (error: string | null) => set({ error })
    })),
    {
      name: 'message-store'
    }
  )
);

// Selectors
export const selectMessageById = (id: string) => (state: MessageState) =>
  state.messages.find(m => m.id === id);

export const selectMessagesByParticipant = (participantId: string) => (state: MessageState) =>
  state.messages.filter(m => m.participantId === participantId);

export const selectTopMessages = (limit: number = 10) => (state: MessageState) =>
  [...state.messages]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

export const selectRecentMessages = (minutes: number = 5) => (state: MessageState) => {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return state.messages.filter(m => m.timestamp.getTime() > cutoff);
};