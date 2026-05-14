import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE';
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    profilesSampleRate: __DEV__ ? 1.0 : 0.1,
    enableNative: true,
    enableNativeCrashHandling: true,
    attachStacktrace: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        enableAppStartTracking: true,
        enableNativeFramesTracking: true,
        enableStallTracking: true,
        enableUserInteractionTracing: true,
      }),
    ],
    beforeSend(event, hint) {
      if (__DEV__) {
        console.log('Sentry Event:', event);
        return null;
      }
      return event;
    },
  });
};

export const captureException = (
  error: Error | unknown,
  context?: Record<string, unknown>
) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info'
) => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: { id: string; email?: string; name?: string } | null) => {
  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
};

export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
};

export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

export const withPerformance = async <T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const transaction = startTransaction(name, operation);
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
};

export const measurePageLoad = (
  pageName: string,
  startTime: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Page loaded: ${pageName}`,
    data: {
      duration_ms: duration,
    },
    level: 'info',
  });
  
  captureMessage(`Page Load: ${pageName} (${duration}ms)`, 'info');
  
  return duration;
};

export const measureApiCall = async <T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      category: 'http',
      message: `API call: ${endpoint}`,
      data: {
        duration_ms: duration,
        status: 'success',
      },
      level: 'info',
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      category: 'http',
      message: `API call: ${endpoint}`,
      data: {
        duration_ms: duration,
        status: 'error',
      },
      level: 'error',
    });
    
    throw error;
  }
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  startTransaction,
  withPerformance,
  measurePageLoad,
  measureApiCall,
};
