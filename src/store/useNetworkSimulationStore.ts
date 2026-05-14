import { create } from 'zustand';

export type NetworkSimulationMode = 
  | 'NORMAL'
  | 'SLOW'
  | 'OFFLINE'
  | 'THROTTLING'
  | 'TIMEOUT'
  | '500_ERROR'
  | '403_FORBIDDEN'
  | '404_NOT_FOUND';

interface NetworkSimulationState {
  mode: NetworkSimulationMode;
  isEnabled: boolean;
  delayMs: number;
  failureRate: number;
  
  setMode: (mode: NetworkSimulationMode) => void;
  toggle: () => void;
  setDelayMs: (delay: number) => void;
  setFailureRate: (rate: number) => void;
  reset: () => void;
  
  // 执行网络操作（带有模拟）
  executeWithNetworkSimulation: <T>(
    fn: () => Promise<T>,
    options?: {
      id?: string;
    }
  ) => Promise<T>;
}

const DEFAULT_SETTINGS = {
  mode: 'NORMAL' as NetworkSimulationMode,
  isEnabled: false,
  delayMs: 2000,
  failureRate: 0.5,
};

export const useNetworkSimulationStore = create<NetworkSimulationState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  
  setMode: (mode) => set({ mode }),
  
  toggle: () => set((state) => ({ 
    isEnabled: !state.isEnabled,
    mode: state.isEnabled ? 'NORMAL' : state.mode === 'NORMAL' ? 'OFFLINE' : state.mode
  })),
  
  setDelayMs: (delayMs) => set({ delayMs }),
  
  setFailureRate: (failureRate) => set({ failureRate }),
  
  reset: () => set(DEFAULT_SETTINGS),
  
  executeWithNetworkSimulation: async <T>(
    fn: () => Promise<T>,
    options = {}
  ): Promise<T> => {
    const { mode, isEnabled, delayMs, failureRate } = get();
    
    if (!isEnabled || mode === 'NORMAL') {
      return await fn();
    }
    
    console.log(`[NetworkSim] Applying simulation: ${mode}`);
    
    // 应用延迟
    if (mode !== 'OFFLINE') {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    // 根据模式模拟不同的网络问题
    switch (mode) {
      case 'OFFLINE':
        throw new Error('Failed to fetch');
        
      case 'TIMEOUT':
        throw new Error('Request timeout');
        
      case '500_ERROR':
        if (Math.random() < failureRate) {
          throw { status: 500, message: 'Internal Server Error' };
        }
        return await fn();
        
      case '403_FORBIDDEN':
        if (Math.random() < failureRate) {
          throw { status: 403, message: 'Forbidden' };
        }
        return await fn();
        
      case '404_NOT_FOUND':
        if (Math.random() < failureRate) {
          throw { status: 404, message: 'Not Found' };
        }
        return await fn();
        
      case 'THROTTLING':
        // 增加额外延迟，然后可能失败
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (Math.random() < failureRate) {
          throw new Error('Network throttled');
        }
        return await fn();
        
      case 'SLOW':
        // 只是慢，没有失败
        return await fn();
        
      default:
        return await fn();
    }
  },
}));

// 快捷方法
export function useNetworkSimulation() {
  return useNetworkSimulationStore();
}

// 便捷 Hook 用于组件
export function useNetworkSimulator() {
  const state = useNetworkSimulationStore();
  
  return {
    ...state,
    simulateOffline: () => state.setMode('OFFLINE'),
    simulateTimeout: () => state.setMode('TIMEOUT'),
    simulate500Error: () => state.setMode('500_ERROR'),
    simulate403Forbidden: () => state.setMode('403_FORBIDDEN'),
    simulate404NotFound: () => state.setMode('404_NOT_FOUND'),
    simulateThrottling: () => state.setMode('THROTTLING'),
    simulateSlowNetwork: () => state.setMode('SLOW'),
    resetSimulation: () => state.reset(),
  };
}
