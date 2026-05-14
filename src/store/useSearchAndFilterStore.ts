import { create } from 'zustand';
import type { 
  MemberSearchQuery, 
  MemberFilter, 
  SearchAndFilterState 
} from '../types/familyTree';

interface SearchAndFilterStore extends SearchAndFilterState {
  setSearchText: (text: string) => void;
  setSearchFields: (fields: ('name' | 'birth_year' | 'birthplace')[]) => void;
  setGenerationFilter: (generation: number | null) => void;
  setGenderFilter: (gender: any | null) => void;
  setIsAliveFilter: (isAlive: boolean | null) => void;
  setFiltersVisible: (visible: boolean) => void;
  toggleFilters: () => void;
  resetAll: () => void;
  resetFilters: () => void;
  resetSearch: () => void;
  hasActiveFilters: () => boolean;
}

const initialState: SearchAndFilterState = {
  searchQuery: {
    searchText: '',
    searchFields: ['name', 'birth_year', 'birthplace'],
  },
  filters: {
    generation: null,
    gender: null,
    isAlive: null,
  },
  isFiltersVisible: false,
};

export const useSearchAndFilterStore = create<SearchAndFilterStore>((set, get) => ({
  ...initialState,

  setSearchText: (text) =>
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        searchText: text,
      },
    })),

  setSearchFields: (fields) =>
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        searchFields: fields,
      },
    })),

  setGenerationFilter: (generation) =>
    set((state) => ({
      filters: {
        ...state.filters,
        generation,
      },
    })),

  setGenderFilter: (gender) =>
    set((state) => ({
      filters: {
        ...state.filters,
        gender,
      },
    })),

  setIsAliveFilter: (isAlive) =>
    set((state) => ({
      filters: {
        ...state.filters,
        isAlive,
      },
    })),

  setFiltersVisible: (visible) =>
    set({ isFiltersVisible: visible }),

  toggleFilters: () =>
    set((state) => ({ isFiltersVisible: !state.isFiltersVisible })),

  resetAll: () =>
    set({
      ...initialState,
    }),

  resetFilters: () =>
    set((state) => ({
      filters: initialState.filters,
    })),

  resetSearch: () =>
    set((state) => ({
      searchQuery: initialState.searchQuery,
    })),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.filters.generation !== null ||
      state.filters.gender !== null ||
      state.filters.isAlive !== null
    );
  },
}));
