import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Guest {
  id: string;
  name: string;
  spouse: number;
  children: number;
  infants: number;
  hasInfant: boolean;
  country: string;
  guestType: string;
  priority: string;
  rsvpStatus: string;
}

export const bulkImportGuests = async (guests: Guest[]) => {
  try {
    // Create a batch write operation
    const batch = writeBatch(db);
    const guestsCollection = collection(db, 'guests');

    // Add each guest to the batch
    guests.forEach(guest => {
      // Create a document reference with the specified ID
      const guestRef = doc(guestsCollection, guest.id);
      // Add the guest data to the batch
      batch.set(guestRef, {
        name: guest.name,
        spouse: guest.spouse,
        children: guest.children,
        infants: guest.infants,
        hasInfant: guest.hasInfant,
        country: guest.country,
        guestType: guest.guestType,
        priority: guest.priority,
        rsvpStatus: guest.rsvpStatus,
        createdAt: new Date().toISOString()
      });
    });

    // Commit the batch
    await batch.commit();
    console.log('Successfully imported guests in bulk');
    return true;
  } catch (error) {
    console.error('Error importing guests in bulk:', error);
    throw error;
  }
};

// Example usage:
/*
const guestData = [
  {
    "id": "guest_1",
    "name": "Safa",
    "spouse": 1,
    "children": 0,
    "infants": 0,
    "hasInfant": false,
    "country": "CANADA",
    "guestType": "friend",
    "priority": "low",
    "rsvpStatus": "pending"
  },
  // ... more guests
];

// Call the function
bulkImportGuests(guestData)
  .then(() => console.log('Import completed'))
  .catch(error => console.error('Import failed:', error));
*/ 