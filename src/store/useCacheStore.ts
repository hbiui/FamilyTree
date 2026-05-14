import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';

const mmkv = new MMKV();

export interface CachedFamily {
  id: string;
  name: string;
  cachedAt: Date;
  data: any;
}

export interface CachedMember {
  id: string;
  name: string;
  familyId: string;
  lastViewed: Date;
  data: any;
}

interface CacheStore {
  cachedFamilies: CachedFamily[];
  cachedMembers: CachedMember[];
  lastSyncAt: Date | null;

  setCachedFamilies: (families: CachedFamily[]) => void;
  addCachedFamily: (family: CachedFamily) => void;
  removeCachedFamily: (id: string) => void;
  getCachedFamily: (id: string) => CachedFamily | undefined;

  setCachedMembers: (members: CachedMember[]) => void;
  addCachedMember: (member: CachedMember) => void;
  removeCachedMember: (id: string) => void;
  getCachedMember: (id: string) => CachedMember | undefined;
  getRecentlyViewedMembers: (limit?: number) => CachedMember[];

  setLastSyncAt: (date: Date) => void;
  clearAllCache: () => void;

  saveToMMKV: () => void;
  loadFromMMKV: () => void;
}

const CACHE_KEYS = {
  FAMILIES: 'offline_cache_families',
  MEMBERS: 'offline_cache_members',
  LAST_SYNC: 'offline_cache_last_sync',
};

export const useCacheStore = create<CacheStore>((set, get) => ({
  cachedFamilies: [],
  cachedMembers: [],
  lastSyncAt: null,

  setCachedFamilies: (families) => {
    set({ cachedFamilies: families });
    get().saveToMMKV();
  },

  addCachedFamily: (family) => {
    set((state) => ({
      cachedFamilies: [
        ...state.cachedFamilies.filter((f) => f.id !== family.id),
        family,
      ],
    }));
    get().saveToMMKV();
  },

  removeCachedFamily: (id) => {
    set((state) => ({
      cachedFamilies: state.cachedFamilies.filter((f) => f.id !== id),
    }));
    get().saveToMMKV();
  },

  getCachedFamily: (id) => {
    return get().cachedFamilies.find((f) => f.id === id);
  },

  setCachedMembers: (members) => {
    set({ cachedMembers: members });
    get().saveToMMKV();
  },

  addCachedMember: (member) => {
    set((state) => ({
      cachedMembers: [
        ...state.cachedMembers.filter((m) => m.id !== member.id),
        member,
      ],
    }));
    get().saveToMMKV();
  },

  removeCachedMember: (id) => {
    set((state) => ({
      cachedMembers: state.cachedMembers.filter((m) => m.id !== id),
    }));
    get().saveToMMKV();
  },

  getCachedMember: (id) => {
    return get().cachedMembers.find((m) => m.id === id);
  },

  getRecentlyViewedMembers: (limit = 10) => {
    return [...get().cachedMembers]
      .sort((a, b) => b.lastViewed.getTime() - a.lastViewed.getTime())
      .slice(0, limit);
  },

  setLastSyncAt: (date) => {
    set({ lastSyncAt: date });
    get().saveToMMKV();
  },

  clearAllCache: () => {
    set({ cachedFamilies: [], cachedMembers: [], lastSyncAt: null });
    mmkv.delete(CACHE_KEYS.FAMILIES);
    mmkv.delete(CACHE_KEYS.MEMBERS);
    mmkv.delete(CACHE_KEYS.LAST_SYNC);
  },

  saveToMMKV: () => {
    const state = get();
    mmkv.set(CACHE_KEYS.FAMILIES, JSON.stringify(state.cachedFamilies));
    mmkv.set(CACHE_KEYS.MEMBERS, JSON.stringify(state.cachedMembers));
    if (state.lastSyncAt) {
      mmkv.set(CACHE_KEYS.LAST_SYNC, state.lastSyncAt.toISOString());
    }
  },

  loadFromMMKV: () => {
    try {
      const familiesJson = mmkv.getString(CACHE_KEYS.FAMILIES);
      const membersJson = mmkv.getString(CACHE_KEYS.MEMBERS);
      const lastSyncString = mmkv.getString(CACHE_KEYS.LAST_SYNC);

      const cachedFamilies = familiesJson 
        ? JSON.parse(familiesJson).map((f: any) => ({
            ...f,
            cachedAt: new Date(f.cachedAt),
          })) 
        : [];

      const cachedMembers = membersJson 
        ? JSON.parse(membersJson).map((m: any) => ({
            ...m,
            lastViewed: new Date(m.lastViewed),
          })) 
        : [];

      const lastSyncAt = lastSyncString ? new Date(lastSyncString) : null;

      set({ cachedFamilies, cachedMembers, lastSyncAt });
    } catch (error) {
      console.error('Failed to load cache from MMKV:', error);
    }
  },
}));
