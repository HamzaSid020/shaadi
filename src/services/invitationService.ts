import { addDoc, collection, query, where, getDocs, Timestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { UserRole } from '../types/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { nanoid } from 'nanoid';

interface InvitationData {
  token: string;
  weddingId: string;
  role: UserRole;
  email?: string;
  name?: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'used' | 'expired';
  usedBy?: string;
  usedAt?: Date;
}

export const generateInvitationToken = async (
  weddingId: string,
  role: UserRole,
  createdBy: string,
  email?: string,
  name?: string,
  expiresInDays: number = 30
) => {
  const token = nanoid(10); // Generate a short, unique token
  const invitationData: InvitationData = {
    token,
    weddingId,
    role,
    email,
    name,
    createdBy,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    status: 'pending'
  };

  const invitationsRef = collection(db, 'invitations');
  await addDoc(invitationsRef, invitationData);

  return token;
};

export const validateInvitationToken = async (token: string) => {
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, where('token', '==', token));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Invalid invitation token');
  }

  const invitation = querySnapshot.docs[0].data() as InvitationData;
  
  if (invitation.status === 'used') {
    throw new Error('This invitation has already been used');
  }

  if (invitation.status === 'expired' || invitation.expiresAt.getTime() < Date.now()) {
    await updateDoc(doc(db, 'invitations', querySnapshot.docs[0].id), {
      status: 'expired'
    });
    throw new Error('This invitation has expired');
  }

  return {
    invitationId: querySnapshot.docs[0].id,
    ...invitation
  };
};

export const createUserWithInvitation = async (
  invitationId: string,
  password: string,
  displayName: string
) => {
  const invitationRef = doc(db, 'invitations', invitationId);
  const invitationDoc = await getDoc(invitationRef);
  
  if (!invitationDoc.exists()) {
    throw new Error('Invalid invitation');
  }

  const invitation = invitationDoc.data() as InvitationData;
  
  // Generate a unique email if none provided
  const email = invitation.email || `guest-${invitation.token}@shaadi-app.com`;
  
  // Create the user account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'used',
    usedBy: userCredential.user.uid,
    usedAt: new Date()
  });

  // Return the created user and wedding info
  return {
    uid: userCredential.user.uid,
    email,
    role: invitation.role,
    weddingId: invitation.weddingId
  };
};

export const getInvitationsByWedding = async (weddingId: string) => {
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, where('weddingId', '==', weddingId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const generateBulkInvitations = async (
  weddingId: string,
  invitees: Array<{ role: UserRole; email?: string; name?: string }>,
  createdBy: string
) => {
  const tokens = await Promise.all(
    invitees.map(invitee => 
      generateInvitationToken(
        weddingId,
        invitee.role,
        createdBy,
        invitee.email,
        invitee.name
      )
    )
  );

  return tokens;
}; 