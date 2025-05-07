import { logActivity } from '../services/loggingService';

type LogCategory = 
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

type LogStatus = 'success' | 'error' | 'info' | 'warning';

export const logUserAction = async (
  userId: string,
  action: string,
  details: string,
  category: LogCategory,
  status: LogStatus = 'success'
) => {
  try {
    await logActivity({
      userId,
      action,
      details,
      category,
      status,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}; 