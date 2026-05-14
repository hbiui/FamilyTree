import { useApiStore, ErrorInfo, ERROR_MESSAGES, shouldRetry } from '@/store/useApiStore';
import { useNetworkStore } from '@/store/useNetworkStore';

// 请求配置
export interface ApiRequestConfig<T = any> {
  id: string;
  requestFn: () => Promise<T>;
  maxRetries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ErrorInfo) => void;
  onRetry?: (retryCount: number) => void;
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 指数退避延迟
function getRetryDelay(retryCount: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000);
}

// 分析 Supabase 错误类型
function analyzeSupabaseError(error: any): ErrorInfo {
  if (!error) {
    return {
      type: 'unknown',
      message: ERROR_MESSAGES.unknown,
    };
  }
  
  // 网络错误
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('Network Error') ||
      error.name === 'TypeError') {
    return {
      type: 'network',
      message: ERROR_MESSAGES.network,
    };
  }
  
  // 超时
  if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
    return {
      type: 'timeout',
      message: ERROR_MESSAGES.timeout,
    };
  }
  
  // Supabase 状态码
  const statusCode = error.status || error.code;
  
  if (statusCode === 401) {
    return {
      type: 'auth',
      message: ERROR_MESSAGES.auth,
      code: String(statusCode),
    };
  }
  
  if (statusCode === 403) {
    return {
      type: 'auth',
      message: ERROR_MESSAGES.auth,
      code: String(statusCode),
    };
  }
  
  if (statusCode === 404) {
    return {
      type: 'unknown',
      message: ERROR_MESSAGES.unknown,
      code: String(statusCode),
    };
  }
  
  if (statusCode === 409) {
    return {
      type: 'validation',
      message: ERROR_MESSAGES.validation,
      code: String(statusCode),
    };
  }
  
  if (statusCode === 422) {
    return {
      type: 'validation',
      message: ERROR_MESSAGES.validation,
      code: String(statusCode),
    };
  }
  
  if (statusCode && statusCode >= 500) {
    return {
      type: 'server',
      message: ERROR_MESSAGES.server,
      code: String(statusCode),
    };
  }
  
  return {
    type: 'unknown',
    message: ERROR_MESSAGES.unknown,
    code: statusCode ? String(statusCode) : undefined,
  };
}

// 核心请求执行函数
export async function executeApiRequest<T>(
  config: ApiRequestConfig<T>
): Promise<T> {
  const {
    id,
    requestFn,
    maxRetries = 3,
    retryDelay = 1000,
    showErrorToast = true,
    onSuccess,
    onError,
    onRetry,
  } = config;
  
  const { 
    startRequest, 
    finishRequest, 
    setRequestError,
    clearRequestState,
    showToast 
  } = useApiStore.getState();
  
  const { isOnline } = useNetworkStore.getState();
  
  let lastError: ErrorInfo | null = null;
  
  startRequest(id);
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 如果离线且不是最后一次尝试，直接跳过
      if (!isOnline && attempt < maxRetries) {
        await delay(getRetryDelay(attempt, retryDelay));
        continue;
      }
      
      const data = await requestFn();
      
      finishRequest(id);
      clearRequestState(id);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
      
    } catch (error) {
      lastError = analyzeSupabaseError(error);
      
      // 如果是最后一次尝试或者不应该重试
      if (attempt >= maxRetries || !shouldRetry(lastError.type)) {
        setRequestError(id, lastError);
        
        if (onError) {
          onError(lastError);
        }
        
        throw lastError;
      }
      
      // 显示重试提示
      if (onRetry) {
        onRetry(attempt + 1);
      }
      
      // 等待后重试
      const delayTime = getRetryDelay(attempt, retryDelay);
      await delay(delayTime);
    }
  }
  
  // 理论上不会到这里，但为了类型安全
  throw lastError || {
    type: 'unknown' as const,
    message: ERROR_MESSAGES.unknown,
  };
}

// 简化的请求 Hook
export function useApiRequest() {
  const { isOnline } = useNetworkStore();
  
  const executeRequest = async <T>(config: ApiRequestConfig<T>) => {
    return await executeApiRequest(config);
  };
  
  return {
    executeRequest,
    isOnline,
  };
}

// 手动重试函数
export async function retryRequest<T>(
  requestId: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const config: ApiRequestConfig<T> = {
    id: requestId,
    requestFn,
  };
  return await executeApiRequest(config);
}
