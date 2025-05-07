import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { app } from './firebaseService';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, UserRole, ROLE_PERMISSIONS } from '../types/auth';

const auth = getAuth(app);

// User Management
export const createUser = async (
  email: string,
  password: string,
  role: UserRole = 'guest',
  additionalData?: {
    displayName?: string;
    weddingDate?: string;
    partnerName?: string;
    isWeddingAdmin?: boolean;
  }
): Promise<UserProfile> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: additionalData?.displayName || email.split('@')[0],
      role,
      phoneNumber: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      weddingDate: additionalData?.weddingDate,
      partnerName: additionalData?.partnerName,
      isWeddingAdmin: additionalData?.isWeddingAdmin || false,
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return userProfile;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userProfile = userDoc.data() as UserProfile;
    await updateDoc(doc(db, 'users', user.uid), {
      lastLoginAt: serverTimestamp(),
    });

    return userProfile;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Role Management
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, newRole: UserRole): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  try {
    const usersQuery = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// Permission Management
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

export const getUserPermissions = (userRole: UserRole): string[] => {
  return ROLE_PERMISSIONS[userRole];
};

// Profile Management
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserEmail = async (newEmail: string, password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Reauthenticate user if needed
    await signInWithEmailAndPassword(auth, user.email!, password);
    await updateEmail(user, newEmail);
    
    await updateDoc(doc(db, 'users', user.uid), {
      email: newEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

export const updateUserPassword = async (newPassword: string, currentPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Reauthenticate user
    await signInWithEmailAndPassword(auth, user.email!, currentPassword);
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Auto sign out after 15 minutes of inactivity
let inactivityTimer: NodeJS.Timeout | null = null;

export const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(async () => {
    await signOutUser();
  }, 15 * 60 * 1000); // 15 minutes
};

// Set up event listeners for user activity
export const setupInactivityTimer = () => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });

  // Start the timer
  resetInactivityTimer();
};

// Clean up event listeners
export const cleanupInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.removeEventListener(event, resetInactivityTimer);
  });
}; 