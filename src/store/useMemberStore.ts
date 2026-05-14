import { create } from 'zustand';

type Gender = 'male' | 'female' | 'unknown';

interface Person {
  id: string;
  family_id: string;
  name: string;
  name_pinyin?: string;
  birth_date?: string;
  death_date?: string;
  gender: Gender;
  avatar_url?: string;
  bio?: string;
  birthplace?: string;
  occupation?: string;
  generation?: number;
  is_alive: boolean;
  parent_id?: string;
  mother_id?: string;
  created_at: string;
  updated_at: string;
}

interface MemberState {
  members: Person[];
  currentMember: Person | null;
  isLoading: boolean;
  error: string | null;

  setMembers: (members: Person[]) => void;
  addMember: (member: Person) => void;
  updateMember: (id: string, updates: Partial<Person>) => void;
  deleteMember: (id: string) => void;
  setCurrentMember: (member: Person | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  currentMember: null,
  isLoading: false,
  error: null,

  setMembers: (members) => set({ members }),
  
  addMember: (member) => set((state) => ({
    members: [...state.members, member]
  })),
  
  updateMember: (id, updates) => set((state) => ({
    members: state.members.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    )
  })),
  
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id)
  })),
  
  setCurrentMember: (member) => set({ currentMember: member }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
