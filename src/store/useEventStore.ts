import { create } from 'zustand';
import type { FamilyEventWithPeople } from '../types/familyTree';

interface EventState {
  // 家族全局事件
  familyEvents: FamilyEventWithPeople[];
  familyEventsPage: number;
  hasMoreFamilyEvents: boolean;
  isLoadingFamilyEvents: boolean;
  
  // 成员事件
  memberEvents: Record<string, FamilyEventWithPeople[]>; // { memberId: events[] }
  memberEventsPage: Record<string, number>; // { memberId: page }
  hasMoreMemberEvents: Record<string, boolean>; // { memberId: hasMore }
  isLoadingMemberEvents: boolean;
  
  // 通用状态
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // 方法
  // 家族事件
  setFamilyEvents: (events: FamilyEventWithPeople[], append?: boolean) => void;
  setFamilyEventsPage: (page: number) => void;
  setHasMoreFamilyEvents: (hasMore: boolean) => void;
  setLoadingFamilyEvents: (isLoading: boolean) => void;
  
  // 成员事件
  setMemberEvents: (memberId: string, events: FamilyEventWithPeople[], append?: boolean) => void;
  setMemberEventsPage: (memberId: string, page: number) => void;
  setHasMoreMemberEvents: (memberId: string, hasMore: boolean) => void;
  setLoadingMemberEvents: (isLoading: boolean) => void;
  
  // 通用
  addEvent: (event: FamilyEventWithPeople) => void;
  updateEvent: (eventId: string, updates: Partial<FamilyEventWithPeople>) => void;
  removeEvent: (eventId: string) => void;
  setError: (error: string | null) => void;
  setCreating: (isCreating: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
  setDeleting: (isDeleting: boolean) => void;
  clearMemberEvents: (memberId: string) => void;
  clearAllEvents: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  familyEvents: [],
  familyEventsPage: 1,
  hasMoreFamilyEvents: true,
  isLoadingFamilyEvents: false,
  
  memberEvents: {},
  memberEventsPage: {},
  hasMoreMemberEvents: {},
  isLoadingMemberEvents: false,
  
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // 家族事件
  setFamilyEvents: (events, append = false) =>
    set((state) => ({
      familyEvents: append ? [...state.familyEvents, ...events] : events,
    })),
  
  setFamilyEventsPage: (page) => set({ familyEventsPage: page }),
  
  setHasMoreFamilyEvents: (hasMore) => set({ hasMoreFamilyEvents: hasMore }),
  
  setLoadingFamilyEvents: (isLoading) => set({ isLoadingFamilyEvents: isLoading }),
  
  // 成员事件
  setMemberEvents: (memberId, events, append = false) =>
    set((state) => ({
      memberEvents: {
        ...state.memberEvents,
        [memberId]: append ? [...(state.memberEvents[memberId] || []), ...events] : events,
      },
    })),
  
  setMemberEventsPage: (memberId, page) =>
    set((state) => ({
      memberEventsPage: {
        ...state.memberEventsPage,
        [memberId]: page,
      },
    })),
  
  setHasMoreMemberEvents: (memberId, hasMore) =>
    set((state) => ({
      hasMoreMemberEvents: {
        ...state.hasMoreMemberEvents,
        [memberId]: hasMore,
      },
    })),
  
  setLoadingMemberEvents: (isLoading) => set({ isLoadingMemberEvents: isLoading }),
  
  // 通用
  addEvent: (event) =>
    set((state) => ({
      familyEvents: [event, ...state.familyEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    })),
  
  updateEvent: (eventId, updates) =>
    set((state) => {
      // 更新家族事件列表
      const updatedFamilyEvents = state.familyEvents.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      );

      // 更新成员事件列表
      const updatedMemberEvents: typeof state.memberEvents = {};
      Object.entries(state.memberEvents).forEach(([memberId, events]) => {
        updatedMemberEvents[memberId] = events.map((e) =>
          e.id === eventId ? { ...e, ...updates } : e
        );
      });

      return {
        familyEvents: updatedFamilyEvents,
        memberEvents: updatedMemberEvents,
      };
    }),
  
  removeEvent: (eventId) =>
    set((state) => {
      const updatedFamilyEvents = state.familyEvents.filter((e) => e.id !== eventId);

      const updatedMemberEvents: typeof state.memberEvents = {};
      Object.entries(state.memberEvents).forEach(([memberId, events]) => {
        updatedMemberEvents[memberId] = events.filter((e) => e.id !== eventId);
      });

      return {
        familyEvents: updatedFamilyEvents,
        memberEvents: updatedMemberEvents,
      };
    }),
  
  setError: (error) => set({ error }),
  
  setCreating: (isCreating) => set({ isCreating }),
  
  setUpdating: (isUpdating) => set({ isUpdating }),
  
  setDeleting: (isDeleting) => set({ isDeleting }),
  
  clearMemberEvents: (memberId) =>
    set((state) => ({
      memberEvents: { ...state.memberEvents, [memberId]: [] },
      memberEventsPage: { ...state.memberEventsPage, [memberId]: 1 },
      hasMoreMemberEvents: { ...state.hasMoreMemberEvents, [memberId]: true },
    })),
  
  clearAllEvents: () =>
    set({
      familyEvents: [],
      familyEventsPage: 1,
      hasMoreFamilyEvents: true,
      memberEvents: {},
      memberEventsPage: {},
      hasMoreMemberEvents: {},
      error: null,
    }),
}));