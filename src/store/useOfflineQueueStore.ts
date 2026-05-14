import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { v4 as uuidv4 } from 'uuid';

const mmkv = new MMKV();

export type OfflineOperationType = 
  | 'add_member' 
  | 'update_member' 
  | 'delete_member' 
  | 'add_family' 
  | 'update_family' 
  | 'delete_family'
  | 'add_event'
  | 'update_event'
  | 'delete_event';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  entityId: string;
  data: any;
  timestamp: Date;
  retries: number;
  lastRetryAt?: Date;
  error?: string;
}

interface OfflineQueueStore {
  operations: OfflineOperation[];
  isSyncing: boolean;
  syncError: string | null;

  addOperation: (type: OfflineOperationType, entityId: string, data: any) => void;
  removeOperation: (id: string) => void;
  updateOperation: (id: string, updates: Partial<OfflineOperation>) => void;
  clearQueue: () => void;

  startSync: () => Promise<void>;
  setIsSyncing: (isSyncing: boolean) => void;
  setSyncError: (error: string | null) => void;

  saveToMMKV: () => void;
  loadFromMMKV: () => void;
}

const QUEUE_KEY = 'offline_operations_queue';

export const useOfflineQueueStore = create<OfflineQueueStore>((set, get) => ({
  operations: [],
  isSyncing: false,
  syncError: null,

  addOperation: (type, entityId, data) => {
    const operation: OfflineOperation = {
      id: uuidv4(),
      type,
      entityId,
      data,
      timestamp: new Date(),
      retries: 0,
    };

    set((state) => ({
      operations: [...state.operations, operation],
    }));

    get().saveToMMKV();
  },

  removeOperation: (id) => {
    set((state) => ({
      operations: state.operations.filter((op) => op.id !== id),
    }));
    get().saveToMMKV();
  },

  updateOperation: (id, updates) => {
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op
      ),
    }));
    get().saveToMMKV();
  },

  clearQueue: () => {
    set({ operations: [] });
    mmkv.delete(QUEUE_KEY);
  },

  startSync: async () => {
    const state = get();
    if (state.isSyncing || state.operations.length === 0) return;

    set({ isSyncing: true, syncError: null });

    try {
      for (const operation of [...state.operations].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )) {
        try {
          await syncOperation(operation);
          get().removeOperation(operation.id);
        } catch (error) {
          get().updateOperation(operation.id, {
            retries: operation.retries + 1,
            lastRetryAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          
          if (operation.retries >= 3) {
            console.error(`Operation ${operation.id} failed after 3 retries`);
          }
        }
      }
      
      set({ isSyncing: false });
    } catch (error) {
      set({ 
        isSyncing: false, 
        syncError: error instanceof Error ? error.message : 'Sync failed' 
      });
    }
  },

  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setSyncError: (error) => set({ syncError: error }),

  saveToMMKV: () => {
    const state = get();
    mmkv.set(QUEUE_KEY, JSON.stringify(state.operations));
  },

  loadFromMMKV: () => {
    try {
      const queueJson = mmkv.getString(QUEUE_KEY);
      if (queueJson) {
        const operations = JSON.parse(queueJson).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp),
          lastRetryAt: op.lastRetryAt ? new Date(op.lastRetryAt) : undefined,
        }));
        set({ operations });
      }
    } catch (error) {
      console.error('Failed to load offline queue from MMKV:', error);
    }
  },
}));

async function syncOperation(operation: OfflineOperation): Promise<void> {
  console.log(`Syncing operation: ${operation.type} for ${operation.entityId}`);
  
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  console.log(`Successfully synced: ${operation.id}`);
}
