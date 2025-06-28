import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@config/firebase';
import type { User, AnonymousUser } from '@/types';

class AuthService {
  private currentUser: FirebaseUser | null = null;

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  /**
   * Sign in anonymously for session participation
   */
  async signInAnonymously(sessionId: string, displayName?: string): Promise<AnonymousUser> {
    const credential = await signInAnonymously(auth);
    const user = credential.user;

    const anonymousUser: AnonymousUser = {
      sessionId,
      displayName: displayName || this.generateAnonymousName(),
      color: this.generateUserColor(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Store anonymous user data
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      uid: user.uid,
      isAnonymous: true,
      ...anonymousUser,
      lastLoginAt: serverTimestamp()
    });

    return anonymousUser;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = await this.getUserData(credential.user.uid);
    
    // Update last login
    await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
      lastLoginAt: serverTimestamp()
    }, { merge: true });

    return user;
  }

  /**
   * Create a new user account
   */
  async createAccount(
    email: string,
    password: string,
    displayName: string,
    organizationId?: string
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(credential.user, { displayName });

    // Create user document
    const userData: User = {
      uid: credential.user.uid,
      email,
      displayName,
      isAnonymous: false,
      organizationId,
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sessionStart: true,
          sessionEnd: true,
          mentions: true,
          reports: false
        },
        privacy: {
          showEmail: false,
          allowAnalytics: true,
          shareDataWithOrg: true
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
          keyboardNavigation: true
        }
      },
      createdAt: new Date(),
      lastLoginAt: new Date(),
      sessionsCreated: 0,
      sessionsParticipated: 0,
      totalMessages: 0,
      totalVotes: 0
    };

    await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), userData);

    return userData;
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) return null;
    return this.getUserData(this.currentUser.uid);
  }

  /**
   * Get user data from Firestore
   */
  private async getUserData(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    return userDoc.data() as User;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Check if user is anonymous
   */
  isAnonymous(): boolean {
    return this.currentUser?.isAnonymous ?? false;
  }

  /**
   * Generate random anonymous display name
   */
  private generateAnonymousName(): string {
    const adjectives = ['Swift', 'Clever', 'Wise', 'Bright', 'Quick', 'Sharp', 'Bold', 'Calm'];
    const animals = ['Fox', 'Owl', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Hawk'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective} ${animal}`;
  }

  /**
   * Generate random user color
   */
  private generateUserColor(): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#8B5CF6',
      '#F59E0B', '#EAB308', '#EC4899', '#6B7280'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getUserData(firebaseUser.uid);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();