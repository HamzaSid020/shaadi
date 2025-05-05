import { Guest } from '../types/guest';

export const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'John Doe',
    spouse: 1,
    children: 2,
    infants: 0,
    country: 'US',
    guestType: 'family',
    priority: 'high',
    rsvpStatus: 'pending'
  },
  {
    id: '2',
    name: 'Jane Smith',
    spouse: 0,
    children: 0,
    infants: 0,
    country: 'UK',
    guestType: 'friend',
    priority: 'medium',
    rsvpStatus: 'pending'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    spouse: 1,
    children: 0,
    infants: 0,
    country: 'CA',
    guestType: 'colleague',
    priority: 'low',
    rsvpStatus: 'confirmed'
  }
]; 