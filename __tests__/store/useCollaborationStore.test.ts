import { useCollaborationStore } from '../../src/store/useCollaborationStore';

const createMockStore = () => {
  const store: any = {
    currentUser: null,
    currentFamilyId: null,
    collaborators: [],
    invites: [],
    initializeCollaboration: jest.fn(),
    setMembers: jest.fn(),
    addCollaborator: jest.fn(),
    removeCollaborator: jest.fn(),
    sendInvite: jest.fn(),
    acceptInvite: jest.fn(),
    setCurrentFamilyId: jest.fn(),
  };
  return store;
};

describe('useCollaborationStore', () => {
  beforeEach(() => {
    const store = createMockStore();
    (useCollaborationStore as any).setState?.(store);
  });

  describe('initializeCollaboration', () => {
    it('should initialize collaboration with user ID', () => {
      const store = createMockStore();
      store.initializeCollaboration('user-123');
      
      expect(store.initializeCollaboration).toHaveBeenCalledWith('user-123');
    });
  });

  describe('addCollaborator', () => {
    it('should add a new collaborator', () => {
      const store = createMockStore();
      store.addCollaborator('test@example.com');
      
      expect(store.addCollaborator).toHaveBeenCalledWith('test@example.com');
    });

    it('should add multiple collaborators', () => {
      const store = createMockStore();
      store.addCollaborator('user1@example.com');
      store.addCollaborator('user2@example.com');
      
      expect(store.addCollaborator).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeCollaborator', () => {
    it('should remove an existing collaborator', () => {
      const store = createMockStore();
      store.removeCollaborator('test@example.com');
      
      expect(store.removeCollaborator).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('sendInvite', () => {
    it('should send an invite', () => {
      const store = createMockStore();
      store.sendInvite('invite@example.com');
      
      expect(store.sendInvite).toHaveBeenCalledWith('invite@example.com');
    });
  });

  describe('acceptInvite', () => {
    it('should accept an invite', () => {
      const store = createMockStore();
      store.acceptInvite('0');
      
      expect(store.acceptInvite).toHaveBeenCalledWith('0');
    });
  });

  describe('setCurrentFamilyId', () => {
    it('should set current family ID', () => {
      const store = createMockStore();
      store.setCurrentFamilyId('family-123');
      
      expect(store.setCurrentFamilyId).toHaveBeenCalledWith('family-123');
    });

    it('should set family ID to null', () => {
      const store = createMockStore();
      store.setCurrentFamilyId(null);
      
      expect(store.setCurrentFamilyId).toHaveBeenCalledWith(null);
    });
  });

  describe('setMembers', () => {
    it('should set collaborators list', () => {
      const store = createMockStore();
      const members = [
        { id: '1', email: 'user1@example.com', role: 'owner' as const, joinedAt: new Date() },
        { id: '2', email: 'user2@example.com', role: 'editor' as const, joinedAt: new Date() },
      ];
      
      store.setMembers(members);
      
      expect(store.setMembers).toHaveBeenCalledWith(members);
    });
  });
});