import { create } from 'zustand';

interface Family {
  id: string;
  name: string;
  surname?: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
}

interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  totalMembers: number;
  isLoading: boolean;
  error: string | null;
  
  setFamilies: (families: Family[]) => void;
  addFamily: (family: Family) => void;
  updateFamily: (id: string, updates: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  setCurrentFamily: (family: Family | null) => void;
  setTotalMembers: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  families: [],
  currentFamily: null,
  totalMembers: 0,
  isLoading: false,
  error: null,

  setFamilies: (families) => set({ families }),
  
  addFamily: (family) => set((state) => ({
    families: [...state.families, family]
  })),
  
  updateFamily: (id, updates) => set((state) => ({
    families: state.families.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    )
  })),
  
  deleteFamily: (id) => set((state) => ({
    families: state.families.filter((f) => f.id !== id)
  })),
  
  setCurrentFamily: (family) => set({ currentFamily: family }),
  
  setTotalMembers: (count) => set({ totalMembers: count }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
