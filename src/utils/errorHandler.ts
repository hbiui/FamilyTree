import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { captureException, captureMessage } from '../config/sentry';

interface ErrorHandlerOptions {
  showDialog?: boolean;
  customHandler?: (error: Error, isFatal: boolean) => void;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private isInitialized: boolean = false;
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  private readonly ERROR_THRESHOLD = 5;
  private readonly ERROR_WINDOW = 60000;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  initialize(options: ErrorHandlerOptions = {}): void {
    if (this.isInitialized) {
      console.warn('GlobalErrorHandler already initialized');
      return;
    }

    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.handleGlobalError(error, isFatal, options, defaultErrorHandler);
    });

    this.setupUnhandledRejectionHandler();
    
    this.setupAppStateListener();
    
    this.isInitialized = true;
    console.log('GlobalErrorHandler initialized');
  }

  private handleGlobalError(
    error: Error,
    isFatal: boolean,
    options: ErrorHandlerOptions,
    defaultHandler: ((error: Error, isFatal?: boolean) => void) | null
  ): void {
    const now = Date.now();
    
    if (now - this.lastErrorTime < this.ERROR_WINDOW) {
      this.errorCount++;
    } else {
      this.errorCount = 1;
    }
    
    this.lastErrorTime = now;

    captureException(error, {
      isFatal,
      errorCount: this.errorCount,
      timestamp: now,
    });

    console.error('Global Error:', error);
    console.error('Is Fatal:', isFatal);

    if (options.customHandler) {
      options.customHandler(error, isFatal);
      return;
    }

    if (this.errorCount >= this.ERROR_THRESHOLD) {
      captureMessage('Error threshold exceeded, possible infinite loop', 'error');
      return;
    }

    if (options.showDialog !== false) {
      this.showErrorDialog(error, isFatal);
    }

    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  }

  private setupUnhandledRejectionHandler(): void {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        
        captureException(error, {
          type: 'unhandledrejection',
        });
        
        console.error('Unhandled Promise Rejection:', error);
      });
    }
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      Sentry.addBreadcrumb({
        category: 'app.state',
        message: `App state changed to ${nextAppState}`,
        level: 'info',
      });
    });
  }

  private showErrorDialog(error: Error, isFatal: boolean): void {
    const title = isFatal ? '应用发生严重错误' : '发生错误';
    const message = __DEV__
      ? `错误: ${error.message}\n\n堆栈: ${error.stack?.substring(0, 200)}...`
      : '应用遇到了一个错误，我们已经记录了这个问题。请尝试重新启动应用。';
    
    Alert.alert(
      title,
      message,
      [
        { text: '确定', onPress: () => {} },
        { 
          text: '复制错误信息', 
          onPress: () => {
            // 复制到剪贴板
          }
        },
      ]
    );
  }

  wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      try {
        const result = fn(...args);
        
        if (result instanceof Promise) {
          return result.catch((error) => {
            captureException(error, { context, function: fn.name });
            throw error;
          }) as ReturnType<T>;
        }
        
        return result;
      } catch (error) {
        captureException(error, { context, function: fn.name });
        throw error;
      }
    }) as T;
  }

  wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (error) {
        captureException(error, { context, function: fn.name });
        throw error;
      }
    }) as T;
  }

  getErrorStats(): { count: number; lastTime: number } {
    return {
      count: this.errorCount,
      lastTime: this.lastErrorTime,
    };
  }

  resetErrorStats(): void {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }
}

export const globalErrorHandler = GlobalErrorHandler.getInstance();

export const initializeErrorHandler = (options?: ErrorHandlerOptions) => {
  globalErrorHandler.initialize(options);
};

export const wrapFunction = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T => {
  return globalErrorHandler.wrapFunction(fn, context);
};

export const wrapAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return globalErrorHandler.wrapAsyncFunction(fn, context);
};

export default globalErrorHandler;
