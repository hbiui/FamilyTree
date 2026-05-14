import { create } from 'zustand';
import type {
  RelationParseResult,
  PhotoEnhancementResult,
  ParsedPerson,
  ParsedRelation,
} from '../types/familyTree';

interface AIState {
  parseResult: RelationParseResult | null;
  enhancementResult: PhotoEnhancementResult | null;
  isParsing: boolean;
  isEnhancing: boolean;
  parseError: string | null;
  enhanceError: string | null;

  setParseResult: (result: RelationParseResult | null) => void;
  setEnhancementResult: (result: PhotoEnhancementResult | null) => void;
  setIsParsing: (isParsing: boolean) => void;
  setIsEnhancing: (isEnhancing: boolean) => void;
  setParseError: (error: string | null) => void;
  setEnhanceError: (error: string | null) => void;
  clearParseState: () => void;
  clearEnhanceState: () => void;
  updateParsedPerson: (id: string, updates: Partial<ParsedPerson>) => void;
  updateParsedRelation: (
    index: number,
    updates: Partial<ParsedRelation>
  ) => void;
  removeParsedPerson: (id: string) => void;
  removeParsedRelation: (index: number) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  parseResult: null,
  enhancementResult: null,
  isParsing: false,
  isEnhancing: false,
  parseError: null,
  enhanceError: null,

  setParseResult: (result) => set({ parseResult: result }),
  setEnhancementResult: (result) => set({ enhancementResult: result }),
  setIsParsing: (isParsing) => set({ isParsing }),
  setIsEnhancing: (isEnhancing) => set({ isEnhancing }),
  setParseError: (error) => set({ parseError: error }),
  setEnhanceError: (error) => set({ enhanceError: error }),

  clearParseState: () =>
    set({
      parseResult: null,
      parseError: null,
    }),

  clearEnhanceState: () =>
    set({
      enhancementResult: null,
      enhanceError: null,
    }),

  updateParsedPerson: (id, updates) =>
    set((state) => {
      if (!state.parseResult) return state;
      return {
        parseResult: {
          ...state.parseResult,
          persons: state.parseResult.persons.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      };
    }),

  updateParsedRelation: (index, updates) =>
    set((state) => {
      if (!state.parseResult) return state;
      const newRelations = [...state.parseResult.relations];
      newRelations[index] = { ...newRelations[index], ...updates };
      return {
        parseResult: {
          ...state.parseResult,
          relations: newRelations,
        },
      };
    }),

  removeParsedPerson: (id) =>
    set((state) => {
      if (!state.parseResult) return state;
      return {
        parseResult: {
          ...state.parseResult,
          persons: state.parseResult.persons.filter((p) => p.id !== id),
          relations: state.parseResult.relations.filter(
            (r) => r.from_id !== id && r.to_id !== id
          ),
        },
      };
    }),

  removeParsedRelation: (index) =>
    set((state) => {
      if (!state.parseResult) return state;
      const newRelations = [...state.parseResult.relations];
      newRelations.splice(index, 1);
      return {
        parseResult: {
          ...state.parseResult,
          relations: newRelations,
        },
      };
    }),
}));
