export type UserRole = 'admin' | 'organizer' | 'guest' | 'vendor';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: string[]; // Permission IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber: string;
  photoURL: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  weddingDate?: string;
  partnerName?: string;
  isWeddingAdmin?: boolean;
}

// Predefined permissions matrix
export const PERMISSIONS = {
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_ROLES: 'users:manage_roles',
  },
  EVENTS: {
    CREATE: 'events:create',
    READ: 'events:read',
    UPDATE: 'events:update',
    DELETE: 'events:delete',
  },
  BUDGET: {
    CREATE: 'budget:create',
    READ: 'budget:read',
    UPDATE: 'budget:update',
    DELETE: 'budget:delete',
  },
  GUESTS: {
    CREATE: 'guests:create',
    READ: 'guests:read',
    UPDATE: 'guests:update',
    DELETE: 'guests:delete',
    MANAGE_RSVP: 'guests:manage_rsvp',
  },
  VENDORS: {
    CREATE: 'vendors:create',
    READ: 'vendors:read',
    UPDATE: 'vendors:update',
    DELETE: 'vendors:delete',
  },
  TASKS: {
    CREATE: 'tasks:create',
    READ: 'tasks:read',
    UPDATE: 'tasks:update',
    DELETE: 'tasks:delete',
    ASSIGN: 'tasks:assign',
  },
  DOCUMENTS: {
    CREATE: 'documents:create',
    READ: 'documents:read',
    UPDATE: 'documents:update',
    DELETE: 'documents:delete',
    SHARE: 'documents:share',
  },
  CONTACTS: {
    CREATE: 'contacts:create',
    READ: 'contacts:read',
    UPDATE: 'contacts:update',
    DELETE: 'contacts:delete',
  },
  SETTINGS: {
    READ: 'settings:read',
    UPDATE: 'settings:update',
  },
} as const;

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS).flatMap(resource => Object.values(resource)),
  organizer: [
    ...Object.values(PERMISSIONS.EVENTS),
    ...Object.values(PERMISSIONS.BUDGET),
    ...Object.values(PERMISSIONS.GUESTS),
    ...Object.values(PERMISSIONS.VENDORS),
    PERMISSIONS.SETTINGS.READ,
    PERMISSIONS.SETTINGS.UPDATE,
  ],
  guest: [
    PERMISSIONS.EVENTS.READ,
    PERMISSIONS.GUESTS.READ,
    PERMISSIONS.GUESTS.MANAGE_RSVP,
  ],
  vendor: [
    PERMISSIONS.EVENTS.READ,
    PERMISSIONS.VENDORS.READ,
    PERMISSIONS.VENDORS.UPDATE,
  ],
}; 