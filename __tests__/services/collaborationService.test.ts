import { 
  collaborationService, 
  validateInviteCode, 
  joinFamilyByCode,
  createInviteCode,
  getInviteCodes,
  revokeInviteCode,
  getFamilyMembers,
  updateMemberRole,
  removeMember,
  InviteCode, 
  MemberRole, 
  FamilyMember 
} from '../../src/services/collaborationService';

describe('collaborationService', () => {
  describe('sendInvite', () => {
    it('should send an invite successfully', async () => {
      const result = await collaborationService.sendInvite('test@example.com', 'family-123');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('acceptInvite', () => {
    it('should accept an invite successfully', async () => {
      const result = await collaborationService.acceptInvite('invite-123');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('rejectInvite', () => {
    it('should reject an invite successfully', async () => {
      const result = await collaborationService.rejectInvite('invite-123');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('getCollaborators', () => {
    it('should return empty collaborators list', async () => {
      const result = await collaborationService.getCollaborators('family-123');
      
      expect(result).toEqual({ data: [], error: null });
    });
  });

  describe('removeCollaborator', () => {
    it('should remove a collaborator successfully', async () => {
      const result = await collaborationService.removeCollaborator('family-123', 'user-123');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('validateInviteCode', () => {
    it('should validate an invite code', async () => {
      const result = await validateInviteCode('TEST123');
      
      expect(result.valid).toBe(true);
      expect(result.familyName).toBe('测试家族');
      expect(result.familyId).toBe('family-123');
    });
  });

  describe('joinFamilyByCode', () => {
    it('should join a family by invite code', async () => {
      const result = await joinFamilyByCode('TEST123');
      
      expect(result.success).toBe(true);
      expect(result.familyId).toBe('family-123');
      expect(result.familyName).toBe('测试家族');
    });
  });

  describe('createInviteCode', () => {
    it('should create an invite code with default editor role', async () => {
      const result = await createInviteCode('family-123');
      
      expect(result.success).toBe(true);
      expect(result.code).toBe('TEST123');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should create an invite code with custom role', async () => {
      const result = await createInviteCode('family-123', 'viewer');
      
      expect(result.success).toBe(true);
      expect(result.code).toBe('TEST123');
    });
  });

  describe('getInviteCodes', () => {
    it('should return empty invite codes list', async () => {
      const result = await getInviteCodes('family-123');
      
      expect(result).toEqual({ data: [], error: null });
    });
  });

  describe('revokeInviteCode', () => {
    it('should revoke an invite code successfully', async () => {
      const result = await revokeInviteCode('family-123', 'TEST123');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('getFamilyMembers', () => {
    it('should return empty family members list', async () => {
      const result = await getFamilyMembers('family-123');
      
      expect(result).toEqual({ data: [], error: null });
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const result = await updateMemberRole('family-123', 'user-123', 'viewer');
      
      expect(result).toEqual({ success: true });
    });

    it('should update member role to owner', async () => {
      const result = await updateMemberRole('family-123', 'user-123', 'owner');
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('removeMember', () => {
    it('should remove a member successfully', async () => {
      const result = await removeMember('family-123', 'user-123');
      
      expect(result).toEqual({ success: true });
    });
  });
});

describe('Type exports', () => {
  it('should export InviteCode interface', () => {
    const inviteCode: InviteCode = {
      code: 'TEST123',
      familyId: 'family-123',
      familyName: '王氏家族',
      expiresAt: new Date(),
      createdAt: new Date(),
      used: false,
    };
    
    expect(inviteCode.code).toBe('TEST123');
    expect(inviteCode.familyId).toBe('family-123');
  });

  it('should export MemberRole type', () => {
    const roles: MemberRole[] = ['owner', 'editor', 'viewer'];
    
    expect(roles).toContain('owner');
    expect(roles).toContain('editor');
    expect(roles).toContain('viewer');
  });

  it('should export FamilyMember interface', () => {
    const member: FamilyMember = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'editor',
      joinedAt: new Date(),
    };
    
    expect(member.id).toBe('user-123');
    expect(member.email).toBe('test@example.com');
    expect(member.role).toBe('editor');
  });
});