import { create } from 'zustand';

export type ErrorType = 'network' | 'timeout' | 'server' | 'auth' | 'validation' | 'rate_limit' | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  retryable?: boolean;
}

export const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: '网络连接失败，请检查网络设置',
  timeout: '请求超时，请稍后重试',
  server: '服务器错误，请稍后重试',
  auth: '登录状态失效，请重新登录',
  validation: '输入数据验证失败',
  rate_limit: '请求过于频繁，请稍后再试',
  unknown: '发生未知错误',
};

export const ERROR_RETRY_MESSAGES: Record<ErrorType, string> = {
  network: '网络连接失败，正在重试...',
  timeout: '请求超时，正在重试...',
  server: '服务器错误，正在重试...',
  auth: '登录状态失效，请重新登录',
  validation: '输入数据验证失败',
  rate_limit: '请求过于频繁，请稍后再试',
  unknown: '发生未知错误，正在重试...',
};

export const shouldRetry = (type: ErrorType): boolean => {
  return ['network', 'timeout', 'server', 'unknown'].includes(type);
};

// 单个 API 请求状态
interface ApiRequestState {
  id: string;
  isLoading: boolean;
  error: ErrorInfo | null;
  retryCount: number;
  lastRequestTime: number;
}

// 全局 API 状态
interface ApiState {
  // 请求状态管理
  requests: Map<string, ApiRequestState>;
  
  // Toast 显示的错误
  toasts: {
    id: string;
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
    retryAction?: () => void;
  }[];
  
  // 网络状态
  isOnline: boolean;
  
  // 操作方法
  startRequest: (requestId: string) => void;
  finishRequest: (requestId: string) => void;
  setRequestError: (requestId: string, error: ErrorInfo) => void;
  clearRequestState: (requestId: string) => void;
  
  // Toast 管理
  showToast: (toast: {
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
    retryAction?: () => void;
  }) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // 网络状态
  setIsOnline: (isOnline: boolean) => void;
}

// 生成唯一 ID
let toastIdCounter = 0;
const generateToastId = () => `toast-${++toastIdCounter}`;

export const useApiStore = create<ApiState>((set, get) => ({
  requests: new Map(),
  toasts: [],
  isOnline: true,
  
  startRequest: (requestId) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.set(requestId, {
        id: requestId,
        isLoading: true,
        error: null,
        retryCount: 0,
        lastRequestTime: Date.now(),
      });
      return { requests: newRequests };
    });
  },
  
  finishRequest: (requestId) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      const request = newRequests.get(requestId);
      if (request) {
        newRequests.set(requestId, {
          ...request,
          isLoading: false,
        });
      }
      return { requests: newRequests };
    });
  },
  
  setRequestError: (requestId, error) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      const request = newRequests.get(requestId);
      
      if (request) {
        newRequests.set(requestId, {
          ...request,
          isLoading: false,
          error,
          retryCount: request.retryCount + 1,
        });
      } else {
        newRequests.set(requestId, {
          id: requestId,
          isLoading: false,
          error,
          retryCount: 1,
          lastRequestTime: Date.now(),
        });
      }
      
      return { requests: newRequests };
    });
    
    // 自动显示错误 Toast
    if (shouldRetry(error.type)) {
      get().showToast({
        type: 'error',
        message: ERROR_RETRY_MESSAGES[error.type] || ERROR_MESSAGES[error.type],
      });
    } else {
      get().showToast({
        type: 'error',
        message: ERROR_MESSAGES[error.type],
      });
    }
  },
  
  clearRequestState: (requestId) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.delete(requestId);
      return { requests: newRequests };
    });
  },
  
  showToast: (toast) => {
    const id = generateToastId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
  
  setIsOnline: (isOnline) => {
    set({ isOnline });
  },
}));

// 便捷的 Hook 用于获取单个请求状态
export function useRequestState(requestId: string) {
  return useApiStore((state) => {
    const request = state.requests.get(requestId);
    return {
      isLoading: request?.isLoading ?? false,
      error: request?.error ?? null,
      retryCount: request?.retryCount ?? 0,
    };
  });
}
