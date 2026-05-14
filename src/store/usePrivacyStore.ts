import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrivacyLevel, PersonPrivacy } from '../types/familyTree';

interface PrivacyState {
  currentUserId: string | null;
  privacySettings: Map<string, PersonPrivacy>;
  defaultPrivacyLevel: PrivacyLevel;
  isAuthorized: boolean;

  setCurrentUserId: (userId: string | null) => void;
  setPrivacySettings: (personId: string, settings: PersonPrivacy) => void;
  setDefaultPrivacyLevel: (level: PrivacyLevel) => void;
  setIsAuthorized: (authorized: boolean) => void;
  getFieldPrivacy: (personId: string, field: keyof PersonPrivacy) => PrivacyLevel;
  canViewField: (personId: string, field: keyof PersonPrivacy, isFamilyMember: boolean, isOwner: boolean) => boolean;
  getPrivacyLabel: (level: PrivacyLevel) => string;
  getPrivacyDescription: (level: PrivacyLevel) => string;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      privacySettings: new Map(),
      defaultPrivacyLevel: 'family',
      isAuthorized: true,

      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      
      setPrivacySettings: (personId, settings) => set((state) => {
        const newSettings = new Map(state.privacySettings);
        newSettings.set(personId, { ...state.privacySettings.get(personId), ...settings });
        return { privacySettings: newSettings };
      }),
      
      setDefaultPrivacyLevel: (level) => set({ defaultPrivacyLevel: level }),
      
      setIsAuthorized: (authorized) => set({ isAuthorized: authorized }),
      
      getFieldPrivacy: (personId, field) => {
        const state = get();
        const personSettings = state.privacySettings.get(personId);
        return personSettings?.[field] || state.defaultPrivacyLevel;
      },
      
      canViewField: (personId, field, isFamilyMember, isOwner) => {
        const state = get();
        if (!state.isAuthorized) return false;
        if (isOwner) return true;
        
        const privacyLevel = state.getFieldPrivacy(personId, field);
        
        switch (privacyLevel) {
          case 'private':
            return isOwner;
          case 'family':
            return isFamilyMember || isOwner;
          case 'public':
            return true;
          default:
            return isFamilyMember;
        }
      },
      
      getPrivacyLabel: (level) => {
        switch (level) {
          case 'private':
            return '仅自己可见';
          case 'family':
            return '家族内可见';
          case 'public':
            return '公开可见';
          default:
            return '家族内可见';
        }
      },
      
      getPrivacyDescription: (level) => {
        switch (level) {
          case 'private':
            return '只有您自己可以看到这些信息';
          case 'family':
            return '只有家族成员可以看到这些信息';
          case 'public':
            return '所有人都可以看到这些信息';
          default:
            return '只有家族成员可以看到这些信息';
        }
      },
    }),
    {
      name: 'privacy-storage',
    }
  )
);
