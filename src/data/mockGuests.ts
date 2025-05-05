import { Guest } from '../types/guest';

export const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'John Doe',
    spouse: 'Jane Doe',
    children: ['Alice', 'Bob'],
    hasInfant: false,
    gender: 'male',
    country: 'USA',
    priority: 'high',
    guestType: 'friend',
    rsvpStatus: 'pending'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    spouse: 'Mike Smith',
    children: ['Emma'],
    hasInfant: true,
    gender: 'female',
    country: 'UK',
    priority: 'medium',
    guestType: 'relative',
    rsvpStatus: 'accepted'
  },
  {
    id: '3',
    name: 'Alex Johnson',
    hasInfant: false,
    gender: 'other',
    country: 'Canada',
    priority: 'low',
    guestType: 'colleague',
    rsvpStatus: 'declined'
  }
]; 