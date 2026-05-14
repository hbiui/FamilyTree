import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

interface NetworkStore extends NetworkState {
  setNetworkStatus: (status: Partial<NetworkState>) => void;
  checkNetwork: () => Promise<void>;
  initializeNetworkListener: () => () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  isConnected: true,
  isInternetReachable: null,
  type: 'unknown',
  lastOnline: null,
  lastOffline: null,

  setNetworkStatus: (status) => {
    set((state) => {
      const newState = { ...state, ...status };
      
      if (status.isConnected === true) {
        newState.lastOnline = new Date();
      } else if (status.isConnected === false) {
        newState.lastOffline = new Date();
      }
      
      return newState;
    });
  },

  checkNetwork: async () => {
    const state = await NetInfo.fetch();
    get().setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  },

  initializeNetworkListener: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      get().setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });
    
    return unsubscribe;
  },
}));
