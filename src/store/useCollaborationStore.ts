import { create } from 'zustand';
import type { MemberRole } from '../services/collaborationService';

export interface FamilyMember {
  id: string;
  email: string;
  role: MemberRole;
  joinedAt: Date;
}

export interface FamilyMembers {
  [key: string]: FamilyMember;
}

export interface CollaborationState {
  currentUser: string | null;
  currentFamilyId: string | null;
  collaborators: FamilyMember[];
  invites: string[];
  
  initializeCollaboration: (userId: string) => void;
  setMembers: (members: FamilyMember[]) => void;
  addCollaborator: (email: string) => void;
  removeCollaborator: (email: string) => void;
  sendInvite: (email: string) => void;
  acceptInvite: (inviteId: string) => void;
  setCurrentFamilyId: (familyId: string | null) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  currentUser: null,
  currentFamilyId: null,
  collaborators: [],
  invites: [],
  
  initializeCollaboration: (userId) => set({ currentUser: userId }),
  
  setMembers: (members) => set({ collaborators: members }),
  
  addCollaborator: (email) => set((state) => ({ 
    collaborators: [...state.collaborators, { 
      id: email, 
      email, 
      role: 'editor', 
      joinedAt: new Date() 
    }] 
  })),
  
  removeCollaborator: (email) => set((state) => ({ 
    collaborators: state.collaborators.filter((c) => c.email !== email) 
  })),
  
  sendInvite: (email) => set((state) => ({ invites: [...state.invites, email] })),
  
  acceptInvite: (inviteId) => set((state) => ({ 
    invites: state.invites.filter((_, i) => i !== parseInt(inviteId)) 
  })),
  
  setCurrentFamilyId: (familyId) => set({ currentFamilyId: familyId }),
}));