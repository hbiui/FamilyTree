import { useState, useCallback, useRef } from 'react';

interface UseDebouncedActionOptions {
  delay?: number;
  leading?: boolean;
}

export function useDebouncedAction(
  action: (...args: any[]) => any,
  options: UseDebouncedActionOptions = {}
) {
  const { delay = 500, leading = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  
  const execute = useCallback(
    (...args: any[]) => {
      // 如果正在执行，直接返回
      if (isExecutingRef.current) {
        return;
      }
      
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 如果是 leading 模式，立即执行
      if (leading) {
        isExecutingRef.current = true;
        try {
          return action(...args);
        } finally {
          // 延迟后允许再次点击
          timeoutRef.current = setTimeout(() => {
            isExecutingRef.current = false;
          }, delay);
        }
      } else {
        // trailing 模式，延迟执行
        isExecutingRef.current = true;
        timeoutRef.current = setTimeout(() => {
          try {
            action(...args);
          } finally {
            isExecutingRef.current = false;
          }
        }, delay);
      }
    },
    [action, delay, leading]
  );
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isExecutingRef.current = false;
  }, []);
  
  return {
    execute,
    cancel,
    isExecuting: isExecutingRef.current,
  };
}

// 防重复点击 Hook - 专门用于按钮等交互
export function usePreventDoubleClick(
  delay: number = 500
) {
  const [isLoading, setIsLoading] = useState(false);
  
  const executeWithLock = useCallback(
    async (fn: (...args: any[]) => any, ...args: any[]) => {
      if (isLoading) return;
      
      setIsLoading(true);
      
      try {
        const result = await fn(...args);
        return result;
      } finally {
        // 确保延迟后解锁
        setTimeout(() => {
          setIsLoading(false);
        }, delay);
      }
    },
    [isLoading, delay]
  );
  
  const unlock = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  return {
    isLoading,
    executeWithLock,
    unlock,
  };
}

// 简化的 Hook，直接返回一个包装函数
export function usePreventRepeats(
  fn: (...args: any[]) => any,
  delay: number = 500
) {
  const { isLoading, executeWithLock } = usePreventDoubleClick(delay);
  
  const execute = useCallback(
    (...args: any[]) => {
      return executeWithLock(fn, ...args);
    },
    [fn, executeWithLock]
  );
  
  return {
    execute,
    isLoading,
  };
}
