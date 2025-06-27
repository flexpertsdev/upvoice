import { Message, Participant } from '@types';
import { doc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@config/firebase';

/**
 * MessageRing implements the ring topology for bidirectional message propagation.
 * Each participant maintains connections to their neighbors and forwards messages
 * in both directions around the ring.
 */
export class MessageRing {
  private sessionId: string;
  private participantId: string;
  private leftNeighbor: Participant | null = null;
  private rightNeighbor: Participant | null = null;
  private processedMessages = new Set<string>();
  private messageHandlers: ((message: Message) => void)[] = [];
  private unsubscribers: (() => void)[] = [];

  constructor(sessionId: string, participantId: string) {
    this.sessionId = sessionId;
    this.participantId = participantId;
  }

  /**
   * Initialize the ring connections
   */
  async initialize(participants: Participant[]) {
    // Sort participants by join time to maintain consistent ordering
    const sortedParticipants = [...participants].sort(
      (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
    );

    const currentIndex = sortedParticipants.findIndex(p => p.id === this.participantId);
    if (currentIndex === -1) {
      throw new Error('Current participant not found in ring');
    }

    const totalParticipants = sortedParticipants.length;

    // Determine neighbors in the ring
    this.leftNeighbor = sortedParticipants[
      (currentIndex - 1 + totalParticipants) % totalParticipants
    ];
    this.rightNeighbor = sortedParticipants[
      (currentIndex + 1) % totalParticipants
    ];

    // Subscribe to neighbor updates
    this.subscribeToNeighbors();
  }

  /**
   * Subscribe to neighbor status updates
   */
  private subscribeToNeighbors() {
    if (this.leftNeighbor) {
      const leftDoc = doc(
        db,
        COLLECTIONS.SESSIONS,
        this.sessionId,
        'participants',
        this.leftNeighbor.id
      );

      const unsubLeft = onSnapshot(leftDoc, (snapshot) => {
        if (!snapshot.exists() || snapshot.data()?.status !== 'active') {
          // Left neighbor disconnected, need to reconfigure ring
          this.handleNeighborDisconnect('left');
        }
      });

      this.unsubscribers.push(unsubLeft);
    }

    if (this.rightNeighbor) {
      const rightDoc = doc(
        db,
        COLLECTIONS.SESSIONS,
        this.sessionId,
        'participants',
        this.rightNeighbor.id
      );

      const unsubRight = onSnapshot(rightDoc, (snapshot) => {
        if (!snapshot.exists() || snapshot.data()?.status !== 'active') {
          // Right neighbor disconnected, need to reconfigure ring
          this.handleNeighborDisconnect('right');
        }
      });

      this.unsubscribers.push(unsubRight);
    }
  }

  /**
   * Handle neighbor disconnect and reconfigure ring
   */
  private async handleNeighborDisconnect(side: 'left' | 'right') {
    console.log(`${side} neighbor disconnected, reconfiguring ring...`);
    
    // In a real implementation, this would trigger a ring reconfiguration
    // For now, we'll just mark the neighbor as null
    if (side === 'left') {
      this.leftNeighbor = null;
    } else {
      this.rightNeighbor = null;
    }
  }

  /**
   * Distribute a message through the ring
   */
  async distributeMessage(message: Message) {
    // Add to processed set to avoid loops
    this.processedMessages.add(message.id);

    // Create ring metadata
    const ringMetadata = {
      originId: this.participantId,
      ttl: 10, // Time to live (hop count)
      direction: 'both' as const,
      timestamp: Timestamp.now(),
    };

    // Send to left neighbor
    if (this.leftNeighbor) {
      await this.forwardMessage(message, this.leftNeighbor.id, 'left', ringMetadata);
    }

    // Send to right neighbor
    if (this.rightNeighbor) {
      await this.forwardMessage(message, this.rightNeighbor.id, 'right', ringMetadata);
    }
  }

  /**
   * Forward a message to a specific neighbor
   */
  private async forwardMessage(
    message: Message,
    neighborId: string,
    direction: 'left' | 'right',
    ringMetadata: any
  ) {
    try {
      // In a real implementation, this would use a message queue or 
      // peer-to-peer connection. For now, we'll simulate it with Firestore
      const forwardDoc = doc(
        db,
        COLLECTIONS.SESSIONS,
        this.sessionId,
        'ring_messages',
        `${message.id}_${neighborId}`
      );

      await updateDoc(forwardDoc, {
        message,
        targetId: neighborId,
        direction,
        ringMetadata: {
          ...ringMetadata,
          ttl: ringMetadata.ttl - 1,
        },
        processed: false,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Failed to forward message to ${direction} neighbor:`, error);
    }
  }

  /**
   * Process incoming ring messages
   */
  subscribeToIncomingMessages() {
    const ringMessagesQuery = doc(
      db,
      COLLECTIONS.SESSIONS,
      this.sessionId,
      'ring_messages'
    );

    const unsubscribe = onSnapshot(ringMessagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          
          // Check if this message is for us and hasn't been processed
          if (data.targetId === this.participantId && !data.processed) {
            this.handleIncomingMessage(data);
          }
        }
      });
    });

    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Handle an incoming message from the ring
   */
  private async handleIncomingMessage(data: any) {
    const { message, direction, ringMetadata } = data;

    // Check if we've already processed this message
    if (this.processedMessages.has(message.id)) {
      return;
    }

    // Add to processed set
    this.processedMessages.add(message.id);

    // Notify handlers
    this.messageHandlers.forEach(handler => handler(message));

    // Continue propagation if TTL > 0
    if (ringMetadata.ttl > 0) {
      // Forward in the same direction
      const nextNeighbor = direction === 'left' ? this.leftNeighbor : this.rightNeighbor;
      if (nextNeighbor && nextNeighbor.id !== ringMetadata.originId) {
        await this.forwardMessage(message, nextNeighbor.id, direction, {
          ...ringMetadata,
          ttl: ringMetadata.ttl - 1,
        });
      }
    }

    // Mark as processed
    const processedDoc = doc(
      db,
      COLLECTIONS.SESSIONS,
      this.sessionId,
      'ring_messages',
      `${message.id}_${this.participantId}`
    );
    
    await updateDoc(processedDoc, { processed: true });
  }

  /**
   * Add a message handler
   */
  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  /**
   * Get ring statistics
   */
  getStats() {
    return {
      participantId: this.participantId,
      leftNeighbor: this.leftNeighbor?.id || null,
      rightNeighbor: this.rightNeighbor?.id || null,
      processedMessages: this.processedMessages.size,
      isComplete: !!(this.leftNeighbor && this.rightNeighbor),
    };
  }

  /**
   * Cleanup subscriptions
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.messageHandlers = [];
    this.processedMessages.clear();
  }
}

/**
 * Ring coordinator manages the overall ring topology
 */
export class RingCoordinator {
  private sessionId: string;
  private rings = new Map<string, MessageRing>();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Add a participant to the ring
   */
  async addParticipant(participant: Participant, allParticipants: Participant[]) {
    const ring = new MessageRing(this.sessionId, participant.id);
    await ring.initialize(allParticipants);
    ring.subscribeToIncomingMessages();
    
    this.rings.set(participant.id, ring);
    
    // Reconfigure all existing rings
    await this.reconfigureRings(allParticipants);
  }

  /**
   * Remove a participant from the ring
   */
  async removeParticipant(participantId: string, allParticipants: Participant[]) {
    const ring = this.rings.get(participantId);
    if (ring) {
      ring.destroy();
      this.rings.delete(participantId);
    }

    // Reconfigure remaining rings
    await this.reconfigureRings(allParticipants);
  }

  /**
   * Reconfigure all rings when topology changes
   */
  private async reconfigureRings(allParticipants: Participant[]) {
    const activeParticipants = allParticipants.filter(p => p.status === 'active');
    
    for (const [participantId, ring] of this.rings.entries()) {
      const participant = activeParticipants.find(p => p.id === participantId);
      if (participant) {
        await ring.initialize(activeParticipants);
      }
    }
  }

  /**
   * Get ring statistics for all participants
   */
  getRingStats() {
    const stats: any[] = [];
    this.rings.forEach((ring, participantId) => {
      stats.push({
        participantId,
        ...ring.getStats(),
      });
    });
    return stats;
  }

  /**
   * Cleanup all rings
   */
  destroy() {
    this.rings.forEach(ring => ring.destroy());
    this.rings.clear();
  }
}