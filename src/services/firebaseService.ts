import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  DocumentData,
  addDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { Vendor, Gift, Outfit, Document, Contact, TimelineEvent, Budget, Task, Guest, Seating, SeatingArrangement } from '../types/models';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Generic CRUD Operations
export const createFirestoreDocument = async <T extends { id: string; createdAt: Date; updatedAt: Date }>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> => {
  const docRef = doc(collection(db, collectionName));
  const newDoc: T = {
    ...data,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as T;
  await setDoc(docRef, newDoc);
  return newDoc;
};

export const getFirestoreDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as T) : null;
};

export const updateFirestoreDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteFirestoreDocument = async (collectionName: string, id: string): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getFirestoreDocuments = async <T>(
  collectionName: string,
  filters?: Partial<T>
): Promise<T[]> => {
  let q = collection(db, collectionName) as Query<DocumentData>;
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        q = query(q, where(key, '==', value));
      }
    });
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    } as T;
  });
};

// Guest Functions
export const createGuest = async (guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guest> => {
  return createFirestoreDocument<Guest>('guests', guest);
};

export const getGuests = async (): Promise<Guest[]> => {
  return getFirestoreDocuments<Guest>('guests');
};

export const updateGuest = async (id: string, guest: Partial<Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('guests', id, guest);
};

export const deleteGuest = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('guests', id);
};

// Seating Functions
export const createSeating = async (seating: Omit<Seating, 'id' | 'createdAt' | 'updatedAt'>): Promise<Seating> => {
  return createFirestoreDocument<Seating>('seatings', seating);
};

export const getSeatings = async (): Promise<Seating[]> => {
  return getFirestoreDocuments<Seating>('seatings');
};

export const updateSeating = async (id: string, seating: Partial<Omit<Seating, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('seatings', id, seating);
};

export const deleteSeating = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('seatings', id);
};

// Outfit Functions
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outfit> => {
  return createFirestoreDocument<Outfit>('outfits', outfit);
};

export const getOutfits = async (): Promise<Outfit[]> => {
  return getFirestoreDocuments<Outfit>('outfits');
};

export const updateOutfit = async (id: string, outfit: Partial<Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('outfits', id, outfit);
};

export const deleteOutfit = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('outfits', id);
};

// Gift Functions
export const createGift = async (gift: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> => {
  return createFirestoreDocument<Gift>('gifts', gift);
};

export const getGifts = async (): Promise<Gift[]> => {
  return getFirestoreDocuments<Gift>('gifts');
};

export const updateGift = async (id: string, gift: Partial<Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('gifts', id, gift);
};

export const deleteGift = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('gifts', id);
};

// File Upload
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Event Functions
export const createEvent = async (event: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimelineEvent> => {
  return createFirestoreDocument<TimelineEvent>('events', event);
};

export const getEvents = async (): Promise<TimelineEvent[]> => {
  return getFirestoreDocuments<TimelineEvent>('events');
};

export const updateEvent = async (id: string, event: Partial<Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('events', id, event);
};

export const deleteEvent = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('events', id);
};

// Budget Functions
export const createBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
  return createFirestoreDocument<Budget>('budgets', budget);
};

export const getBudgets = async (): Promise<Budget[]> => {
  return getFirestoreDocuments<Budget>('budgets');
};

export const updateBudget = async (id: string, budget: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('budgets', id, budget);
};

export const deleteBudget = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('budgets', id);
};

// Task Functions
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  return createFirestoreDocument<Task>('tasks', task);
};

export const getTasks = async (): Promise<Task[]> => {
  return getFirestoreDocuments<Task>('tasks');
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('tasks', id, task);
};

export const deleteTask = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('tasks', id);
}; 

// Vendor Functions
export const createVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
  return createFirestoreDocument<Vendor>('vendors', vendor);
};

export const getVendors = async (): Promise<Vendor[]> => {
  return getFirestoreDocuments<Vendor>('vendors');
};

export const updateVendor = async (id: string, vendor: Partial<Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('vendors', id, vendor);
};

export const deleteVendor = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('vendors', id);
};

// Contact Functions
export const createContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
  return createFirestoreDocument<Contact>('contacts', contact);
};

export const getContacts = async (): Promise<Contact[]> => {
  return getFirestoreDocuments<Contact>('contacts');
};

export const updateContact = async (id: string, contact: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('contacts', id, contact);
};

export const deleteContact = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('contacts', id);
};

// Document Functions
export const createDocument = async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
  return createFirestoreDocument<Document>('documents', document);
};

export const getDocuments = async (): Promise<Document[]> => {
  return getFirestoreDocuments<Document>('documents');
};

export const updateDocument = async (id: string, document: Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateFirestoreDocument('documents', id, document);
};

export const deleteDocument = async (id: string): Promise<void> => {
  return deleteFirestoreDocument('documents', id);
};

// Seating Arrangement Functions
export const createSeatingArrangement = async (data: Omit<SeatingArrangement, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'seatingArrangements'), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const getSeatingArrangements = async () => {
  const querySnapshot = await getDocs(collection(db, 'seatingArrangements'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as SeatingArrangement[];
};

export const updateSeatingArrangement = async (id: string, data: Partial<SeatingArrangement>) => {
  const docRef = doc(db, 'seatingArrangements', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteSeatingArrangement = async (id: string) => {
  const docRef = doc(db, 'seatingArrangements', id);
  await deleteDoc(docRef);
};