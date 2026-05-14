export interface InviteCode {
  code: string;
  familyId: string;
  familyName: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface FamilyMember {
  id: string;
  email: string;
  role: MemberRole;
  joinedAt: Date;
}

export const collaborationService = {
  sendInvite: async (email: string, familyId: string) => {
    return { success: true };
  },
  
  acceptInvite: async (inviteId: string) => {
    return { success: true };
  },
  
  rejectInvite: async (inviteId: string) => {
    return { success: true };
  },
  
  getCollaborators: async (familyId: string) => {
    return { data: [], error: null };
  },
  
  removeCollaborator: async (familyId: string, userId: string) => {
    return { success: true };
  },
  
  validateInviteCode: async (code: string) => {
    return { valid: true, familyName: '测试家族', familyId: 'family-123' };
  },
  
  joinFamilyByCode: async (code: string) => {
    return { success: true, familyId: 'family-123', familyName: '测试家族' };
  },
  
  createInviteCode: async (familyId: string, role: MemberRole = 'editor') => {
    return { success: true, code: 'TEST123', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
  },
  
  getInviteCodes: async (familyId: string) => {
    return { data: [], error: null };
  },
  
  revokeInviteCode: async (familyId: string, code: string) => {
    return { success: true };
  },
  
  getFamilyMembers: async (familyId: string) => {
    return { data: [], error: null };
  },
  
  updateMemberRole: async (familyId: string, userId: string, role: MemberRole) => {
    return { success: true };
  },
  
  removeMember: async (familyId: string, userId: string) => {
    return { success: true };
  },
};

export const validateInviteCode = collaborationService.validateInviteCode;
export const joinFamilyByCode = collaborationService.joinFamilyByCode;
export const createInviteCode = collaborationService.createInviteCode;
export const getInviteCodes = collaborationService.getInviteCodes;
export const revokeInviteCode = collaborationService.revokeInviteCode;
export const getFamilyMembers = collaborationService.getFamilyMembers;
export const updateMemberRole = collaborationService.updateMemberRole;
export const removeMember = collaborationService.removeMember;