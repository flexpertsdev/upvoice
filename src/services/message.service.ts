import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  Unsubscribe,
  DocumentSnapshot
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, COLLECTIONS, FUNCTIONS, RATE_LIMITS } from '@config/firebase';
import type {
  Message,
  MessageFilter,
  MessageStats,
  Vote,
  RingPosition,
  MessageType,
  MessageStatus
} from '@/types';

class MessageService {
  private rateLimitMap = new Map<string, number[]>();

  /**
   * Send a message to the session
   */
  async sendMessage(
    sessionId: string,
    participantId: string,
    content: string,
    type: MessageType = 'text',
    parentId?: string
  ): Promise<Message> {
    // Check rate limit
    if (!this.checkRateLimit(participantId, 'message')) {
      throw new Error('Rate limit exceeded. Please wait before sending another message.');
    }

    const sendMessageFn = httpsCallable<
      {
        sessionId: string;
        participantId: string;
        content: string;
        type: MessageType;
        parentId?: string;
      },
      Message
    >(functions, FUNCTIONS.SEND_MESSAGE);

    const result = await sendMessageFn({
      sessionId,
      participantId,
      content,
      type,
      parentId
    });

    return result.data;
  }

  /**
   * Vote on a message
   */
  async voteOnMessage(
    messageId: string,
    participantId: string,
    value: number // -1 to 1
  ): Promise<void> {
    // Check rate limit
    if (!this.checkRateLimit(participantId, 'vote')) {
      throw new Error('Rate limit exceeded. Please wait before voting again.');
    }

    // Ensure value is between -1 and 1
    const normalizedValue = Math.max(-1, Math.min(1, value));

    const voteMessageFn = httpsCallable<
      {
        messageId: string;
        participantId: string;
        value: number;
      },
      void
    >(functions, FUNCTIONS.VOTE_MESSAGE);

    await voteMessageFn({
      messageId,
      participantId,
      value: normalizedValue
    });
  }

  /**
   * Get messages for a session
   */
  async getMessages(
    filter: MessageFilter,
    pageSize: number = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ messages: Message[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(collection(db, COLLECTIONS.MESSAGES));

    // Apply filters
    if (filter.sessionId) {
      q = query(q, where('sessionId', '==', filter.sessionId));
    }
    if (filter.participantId) {
      q = query(q, where('participantId', '==', filter.participantId));
    }
    if (filter.type) {
      q = query(q, where('type', '==', filter.type));
    }
    if (filter.status) {
      q = query(q, where('status', '==', filter.status));
    }
    if (filter.minScore !== undefined) {
      q = query(q, where('score', '>=', filter.minScore));
    }
    if (filter.isModerated !== undefined) {
      q = query(q, where('isModerated', '==', filter.isModerated));
    }
    if (filter.parentId !== undefined) {
      if (filter.parentId === null) {
        q = query(q, where('parentId', '==', null));
      } else {
        q = query(q, where('parentId', '==', filter.parentId));
      }
    }

    // Order and pagination
    q = query(q, orderBy('timestamp', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));

    return {
      messages,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  }

  /**
   * Get a single message
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const messageDoc = await getDoc(doc(db, COLLECTIONS.MESSAGES, messageId));
    if (!messageDoc.exists()) return null;

    return {
      id: messageDoc.id,
      ...messageDoc.data()
    } as Message;
  }

  /**
   * Subscribe to new messages
   */
  subscribeToMessages(
    sessionId: string,
    callback: (messages: Message[]) => void,
    limit: number = 100
  ): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('sessionId', '==', sessionId),
      where('status', '==', 'active'),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    });
  }

  /**
   * Subscribe to message updates
   */
  subscribeToMessage(
    messageId: string,
    callback: (message: Message | null) => void
  ): Unsubscribe {
    return onSnapshot(doc(db, COLLECTIONS.MESSAGES, messageId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as Message);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Moderate a message
   */
  async moderateMessage(
    messageId: string,
    moderatorId: string,
    action: 'hide' | 'delete',
    reason?: string
  ): Promise<void> {
    const moderateMessageFn = httpsCallable<
      {
        messageId: string;
        moderatorId: string;
        action: string;
        reason?: string;
      },
      void
    >(functions, FUNCTIONS.MODERATE_MESSAGE);

    await moderateMessageFn({
      messageId,
      moderatorId,
      action,
      reason
    });
  }

  /**
   * Pin/unpin a message
   */
  async togglePinMessage(messageId: string, isPinned: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), {
      isPinned,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Highlight/unhighlight a message
   */
  async toggleHighlightMessage(messageId: string, isHighlighted: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), {
      isHighlighted,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get message statistics
   */
  async getMessageStats(sessionId: string): Promise<MessageStats> {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('sessionId', '==', sessionId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => doc.data() as Message);

    const stats: MessageStats = {
      totalMessages: messages.length,
      averageScore: 0,
      totalVotes: 0,
      participantCount: new Set(messages.map(m => m.participantId)).size,
      topicsDistribution: {},
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      }
    };

    // Calculate statistics
    messages.forEach(message => {
      stats.totalVotes += message.votes.length;
      stats.averageScore += message.score;

      // Topics
      message.topics?.forEach(topic => {
        stats.topicsDistribution[topic] = (stats.topicsDistribution[topic] || 0) + 1;
      });

      // Sentiment
      if (message.sentiment) {
        stats.sentimentDistribution[message.sentiment]++;
      }
    });

    if (messages.length > 0) {
      stats.averageScore /= messages.length;
    }

    return stats;
  }

  /**
   * Get ring positions for participants
   */
  async getRingPositions(sessionId: string): Promise<RingPosition[]> {
    const participants = await getDocs(
      query(
        collection(db, COLLECTIONS.PARTICIPANTS),
        where('sessionId', '==', sessionId),
        where('isActive', '==', true),
        orderBy('joinedAt', 'asc')
      )
    );

    const positions: RingPosition[] = [];
    const participantIds = participants.docs.map(doc => doc.id);
    const total = participantIds.length;

    participantIds.forEach((id, index) => {
      positions.push({
        participantId: id,
        leftNeighbor: participantIds[(index - 1 + total) % total],
        rightNeighbor: participantIds[(index + 1) % total],
        position: index,
        totalParticipants: total
      });
    });

    return positions;
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(userId: string, action: 'message' | 'vote'): boolean {
    const now = Date.now();
    const key = `${userId}-${action}`;
    const timestamps = this.rateLimitMap.get(key) || [];

    // Remove old timestamps
    const cutoff = action === 'message' 
      ? now - 60000 // 1 minute for messages
      : now - 60000; // 1 minute for votes

    const recentTimestamps = timestamps.filter(t => t > cutoff);

    // Check limit
    const limit = action === 'message' 
      ? RATE_LIMITS.MESSAGES_PER_MINUTE
      : RATE_LIMITS.VOTES_PER_MINUTE;

    if (recentTimestamps.length >= limit) {
      return false;
    }

    // Add new timestamp
    recentTimestamps.push(now);
    this.rateLimitMap.set(key, recentTimestamps);

    return true;
  }

  /**
   * Format message for display
   */
  formatMessageContent(content: string, maxLength: number = 500): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(message: Message): number {
    const voteScore = message.score;
    const voteCount = message.votes.length;
    const recentVotes = message.votes.filter(v => 
      new Date(v.timestamp).getTime() > Date.now() - 3600000 // Last hour
    ).length;

    // Weighted score
    return (voteScore * 0.5) + (voteCount * 0.3) + (recentVotes * 0.2);
  }
}

export const messageService = new MessageService();