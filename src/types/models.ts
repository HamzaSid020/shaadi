export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  time: string;
  location: string;
  type: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  description?: string;
  attendees?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Completed';
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: string;
  cost: number;
  contact: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: 'bride' | 'groom' | 'family' | 'friends' | 'other';
  relationship: string;
  rsvpStatus: 'pending' | 'attending' | 'not-attending';
  plusOne: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  tableNumber?: number;
  checkedIn?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outfit {
  id: string;
  name: string;
  type: string;
  event: string;
  status: 'Not Started' | 'In Progress' | 'Ready';
  cost: number;
  vendor?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  status: 'Pending' | 'Completed';
  dueDate?: Date;
  fileUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gift {
  id: string;
  item: string;
  giver: string;
  occasion: string;
  received: boolean;
  thankyouSent: boolean;
  value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'ceremony' | 'reception' | 'preparation' | 'other';
  status: 'upcoming' | 'in-progress' | 'completed';
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  category: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Seating {
  id: string;
  tableName: string;
  capacity: number;
  assigned: string[];
  category: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckIn {
  id: string;
  guestName: string;
  status: 'Expected' | 'Arrived' | 'No Show';
  arrivalTime?: Date;
  tableNumber?: string;
  plusOne?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeatingArrangement {
  id: string;
  tableNumber: string;
  capacity: number;
  category: 'VIP' | 'Family' | 'Regular';
  status: 'Available' | 'Reserved' | 'Occupied';
  assignedGuests: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 