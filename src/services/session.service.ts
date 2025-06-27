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
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  Unsubscribe
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, COLLECTIONS, FUNCTIONS, DEFAULTS } from '@config/firebase';
import type {
  SessionSettings,
  SessionStats,
  Participant,
  SessionListItem,
  SessionStatus
} from '@types';

class SessionService {
  /**
   * Create a new session
   */
  async createSession(settings: Partial<SessionSettings>): Promise<SessionSettings> {
    const createSessionFn = httpsCallable<Partial<SessionSettings>, SessionSettings>(
      functions,
      FUNCTIONS.CREATE_SESSION
    );
    
    const result = await createSessionFn({
      ...settings,
      startTime: settings.startTime || new Date(),
      allowAnonymous: settings.allowAnonymous ?? true,
      requireModeration: settings.requireModeration ?? false,
      votingEnabled: settings.votingEnabled ?? true,
      maxParticipants: settings.maxParticipants || DEFAULTS.MAX_PARTICIPANTS,
      messageLifespan: settings.messageLifespan || DEFAULTS.MESSAGE_LIFESPAN_MINUTES
    });

    return result.data;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionSettings | null> {
    const sessionDoc = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
    if (!sessionDoc.exists()) return null;
    
    return {
      id: sessionDoc.id,
      ...sessionDoc.data()
    } as SessionSettings;
  }

  /**
   * Get session by access code
   */
  async getSessionByCode(accessCode: string): Promise<SessionSettings | null> {
    const q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where('accessCode', '==', accessCode),
      where('isActive', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const sessionDoc = snapshot.docs[0];
    return {
      id: sessionDoc.id,
      ...sessionDoc.data()
    } as SessionSettings;
  }

  /**
   * Join a session
   */
  async joinSession(
    sessionId: string,
    participantData: Partial<Participant>
  ): Promise<Participant> {
    const joinSessionFn = httpsCallable<
      { sessionId: string; participantData: Partial<Participant> },
      Participant
    >(functions, FUNCTIONS.JOIN_SESSION);
    
    const result = await joinSessionFn({ sessionId, participantData });
    return result.data;
  }

  /**
   * Update session settings
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionSettings>
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionId), {
      isActive: false,
      endTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get session participants
   */
  async getParticipants(sessionId: string): Promise<Participant[]> {
    const q = query(
      collection(db, COLLECTIONS.PARTICIPANTS),
      where('sessionId', '==', sessionId),
      where('isActive', '==', true),
      orderBy('joinedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Participant));
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<SessionStats> {
    const statsDoc = await getDoc(
      doc(db, COLLECTIONS.ANALYTICS, `sessions/${sessionId}/stats/current`)
    );
    
    if (!statsDoc.exists()) {
      return {
        totalMessages: 0,
        activeParticipants: 0,
        totalVotes: 0,
        averageEngagement: 0,
        participationRate: 0,
        updatedAt: new Date()
      };
    }
    
    return statsDoc.data() as SessionStats;
  }

  /**
   * List user's sessions
   */
  async listUserSessions(
    userId: string,
    status?: SessionStatus
  ): Promise<SessionListItem[]> {
    let q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where('createdBy', '==', userId),
      orderBy('startTime', 'desc'),
      limit(50)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        status: this.getSessionStatus(data),
        startTime: data.startTime.toDate(),
        participantCount: data.participantCount || 0,
        messageCount: data.messageCount || 0,
        organizationId: data.organizationId
      } as SessionListItem;
    });
  }

  /**
   * List organization sessions
   */
  async listOrganizationSessions(
    organizationId: string,
    status?: SessionStatus
  ): Promise<SessionListItem[]> {
    let q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where('organizationId', '==', organizationId),
      orderBy('startTime', 'desc'),
      limit(100)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        status: this.getSessionStatus(data),
        startTime: data.startTime.toDate(),
        participantCount: data.participantCount || 0,
        messageCount: data.messageCount || 0,
        organizationId: data.organizationId
      } as SessionListItem;
    });
  }

  /**
   * Subscribe to session updates
   */
  subscribeToSession(
    sessionId: string,
    callback: (session: SessionSettings) => void
  ): Unsubscribe {
    return onSnapshot(doc(db, COLLECTIONS.SESSIONS, sessionId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as SessionSettings);
      }
    });
  }

  /**
   * Subscribe to participants updates
   */
  subscribeToParticipants(
    sessionId: string,
    callback: (participants: Participant[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.PARTICIPANTS),
      where('sessionId', '==', sessionId),
      where('isActive', '==', true)
    );
    
    return onSnapshot(q, (snapshot) => {
      const participants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Participant));
      callback(participants);
    });
  }

  /**
   * Subscribe to session stats
   */
  subscribeToStats(
    sessionId: string,
    callback: (stats: SessionStats) => void
  ): Unsubscribe {
    return onSnapshot(
      doc(db, COLLECTIONS.ANALYTICS, `sessions/${sessionId}/stats/current`),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as SessionStats);
        }
      }
    );
  }

  /**
   * Export session data
   */
  async exportSession(sessionId: string): Promise<string> {
    const exportSessionFn = httpsCallable<{ sessionId: string }, { exportUrl: string }>(
      functions,
      FUNCTIONS.EXPORT_SESSION
    );
    
    const result = await exportSessionFn({ sessionId });
    return result.data.exportUrl;
  }

  /**
   * Determine session status
   */
  private getSessionStatus(session: any): SessionStatus {
    const now = new Date();
    const startTime = session.startTime.toDate();
    const endTime = session.endTime?.toDate();
    
    if (session.isArchived) return 'archived';
    if (endTime && endTime < now) return 'ended';
    if (session.isPaused) return 'paused';
    if (session.isActive && startTime <= now) return 'active';
    if (startTime > now) return 'scheduled';
    return 'ended';
  }

  /**
   * Generate access code
   */
  generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const sessionService = new SessionService();