export interface Guest {
  id: string;
  name: string;
  spouse: number;
  children: number;
  infants: number;
  country: string;
  guestType: string;
  priority: string;
  rsvpStatus: string;
  gender?: string;
} 