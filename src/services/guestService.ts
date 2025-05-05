import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Guest } from '../types/guest';

// Query keys
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters: string) => [...guestKeys.lists(), { filters }] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: string) => [...guestKeys.details(), id] as const,
};

// Fetch all guests
export const getGuests = async (): Promise<Guest[]> => {
  try {
    console.log('Fetching guests from Firestore...');
    const guestsCollection = collection(db, 'guests');
    const querySnapshot = await getDocs(guestsCollection);
    
    if (querySnapshot.empty) {
      console.log('No guests found in Firestore');
      return [];
    }

    const guests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing guest document:', doc.id, data);
      return {
        id: doc.id,
        name: data.name || '',
        spouse: Number(data.spouse) || 0,
        children: Number(data.children) || 0,
        infants: Number(data.infants) || 0,
        gender: data.gender || 'other',
        country: data.country || '',
        priority: data.priority || 'medium',
        guestType: data.guestType || 'other',
        rsvpStatus: data.rsvpStatus || 'pending',
      } as Guest;
    });

    console.log('Successfully fetched guests:', guests);
    return guests;
  } catch (error) {
    console.error('Error fetching guests:', error);
    throw error;
  }
};

// Search guests
export const searchGuests = async (searchTerm: string): Promise<Guest[]> => {
  const q = query(collection(db, 'guests'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Guest))
    .filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Filter guests
export const filterGuests = async (filters: {
  priority?: string;
  guestType?: string;
  rsvpStatus?: string;
  country?: string;
}): Promise<Guest[]> => {
  const q = query(collection(db, 'guests'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Guest))
    .filter(guest => {
      if (filters.priority && guest.priority !== filters.priority) return false;
      if (filters.guestType && guest.guestType !== filters.guestType) return false;
      if (filters.rsvpStatus && guest.rsvpStatus !== filters.rsvpStatus) return false;
      if (filters.country && guest.country !== filters.country) return false;
      return true;
    });
};

// Add a new guest
export const addGuest = async (guest: Omit<Guest, 'id'>): Promise<string> => {
  try {
    console.log('Adding new guest:', guest);
    const docRef = await addDoc(collection(db, 'guests'), guest);
    console.log('Guest added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding guest:', error);
    throw error;
  }
};

// Update a guest
export const updateGuest = async (id: string, guest: Partial<Guest>): Promise<void> => {
  try {
    console.log('Updating guest:', id, guest);
    const guestRef = doc(db, 'guests', id);
    await updateDoc(guestRef, guest);
    console.log('Guest updated successfully');
  } catch (error) {
    console.error('Error updating guest:', error);
    throw error;
  }
};

// Delete a guest
export const deleteGuest = async (id: string): Promise<void> => {
  try {
    console.log('Deleting guest:', id);
    const guestRef = doc(db, 'guests', id);
    await deleteDoc(guestRef);
    console.log('Guest deleted successfully');
  } catch (error) {
    console.error('Error deleting guest:', error);
    throw error;
  }
}; 