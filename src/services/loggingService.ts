import { FirebaseError } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ActivityLog {
  id?: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Timestamp;
  category: 
    | 'dashboard'
    | 'events'
    | 'budget'
    | 'tasks'
    | 'guests'
    | 'vendors'
    | 'gifts'
    | 'outfits'
    | 'seating'
    | 'check-in'
    | 'documents'
    | 'contacts'
    | 'settings'
    | 'user';
  status: 'success' | 'error' | 'info' | 'warning';
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof FirebaseError) {
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        throw new Error('User does not have permission to perform this action');
      }
      if (error.code === 'unavailable') {
        // Try to reconnect
        await disableNetwork(db);
        await enableNetwork(db);
        await wait(RETRY_DELAY);
        return retryOperation(operation, retries - 1);
      }
    }
    throw error;
  }
};

export const logActivity = async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    await retryOperation(async () => {
      await addDoc(collection(db, 'activityLogs'), {
        ...log,
        timestamp: Timestamp.now(),
      });
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Re-throw the error if you want to handle it in the component
    throw error;
  }
};

export const getRecentActivities = async (limitCount: number = 50): Promise<ActivityLog[]> => {
  try {
    return await retryOperation(async () => {
      const q = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}; 