import { PerformanceObserver, performance } from 'perf_hooks';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  pageLoads: Record<string, number>;
  apiCalls: Record<string, { count: number; avgDuration: number; errors: number }>;
  userInteractions: Record<string, number>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private pageLoads: Record<string, number[]> = {};
  private apiCalls: Record<string, { durations: number[]; errors: number }> = {};
  private userInteractions: Record<string, number> = {};

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, unknown>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.set(id, {
      name,
      startTime: Date.now(),
      metadata,
    });
    
    return id;
  }

  endMeasure(id: string): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    
    if (!metric) {
      console.warn(`Performance metric not found: ${id}`);
      return null;
    }
    
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    this.metrics.delete(id);
    
    this.reportMetric(metric);
    
    return metric;
  }

  measurePageLoad(pageName: string, startTime: number): number {
    const duration = Date.now() - startTime;
    
    if (!this.pageLoads[pageName]) {
      this.pageLoads[pageName] = [];
    }
    
    this.pageLoads[pageName].push(duration);
    
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Page loaded: ${pageName}`,
      data: {
        duration_ms: duration,
        platform: Platform.OS,
      },
      level: 'info',
    });
    
    if (duration > 1000) {
      Sentry.captureMessage(`Slow page load: ${pageName} (${duration}ms)`, 'warning');
    }
    
    return duration;
  }

  measureApiCall(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean
  ): void {
    if (!this.apiCalls[endpoint]) {
      this.apiCalls[endpoint] = { durations: [], errors: 0 };
    }
    
    this.apiCalls[endpoint].durations.push(duration);
    
    if (!success) {
      this.apiCalls[endpoint].errors++;
    }
    
    Sentry.addBreadcrumb({
      category: 'http',
      message: `API call: ${method} ${endpoint}`,
      data: {
        duration_ms: duration,
        success,
        platform: Platform.OS,
      },
      level: success ? 'info' : 'error',
    });
    
    if (duration > 5000) {
      Sentry.captureMessage(
        `Slow API call: ${method} ${endpoint} (${duration}ms)`,
        'warning'
      );
    }
  }

  trackUserInteraction(action: string): void {
    if (!this.userInteractions[action]) {
      this.userInteractions[action] = 0;
    }
    
    this.userInteractions[action]++;
    
    Sentry.addBreadcrumb({
      category: 'user',
      message: `User action: ${action}`,
      level: 'info',
    });
  }

  private reportMetric(metric: PerformanceMetric): void {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Performance: ${metric.name}`,
      data: {
        duration_ms: metric.duration,
        ...metric.metadata,
      },
      level: 'info',
    });
  }

  getReport(): PerformanceReport {
    const pageLoadsReport: Record<string, number> = {};
    Object.entries(this.pageLoads).forEach(([page, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      pageLoadsReport[page] = Math.round(avg);
    });

    const apiCallsReport: Record<string, { count: number; avgDuration: number; errors: number }> = {};
    Object.entries(this.apiCalls).forEach(([endpoint, data]) => {
      const avg = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      apiCallsReport[endpoint] = {
        count: data.durations.length,
        avgDuration: Math.round(avg),
        errors: data.errors,
      };
    });

    return {
      metrics: Array.from(this.metrics.values()),
      pageLoads: pageLoadsReport,
      apiCalls: apiCallsReport,
      userInteractions: this.userInteractions,
    };
  }

  reset(): void {
    this.metrics.clear();
    this.pageLoads = {};
    this.apiCalls = {};
    this.userInteractions = {};
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export const withPerformanceTracking = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  const id = performanceMonitor.startMeasure(name, metadata);
  
  try {
    const result = await fn();
    performanceMonitor.endMeasure(id);
    return result;
  } catch (error) {
    performanceMonitor.endMeasure(id);
    throw error;
  }
};

export const usePageLoadTracking = (pageName: string) => {
  const startTime = Date.now();
  
  return {
    trackLoad: () => {
      return performanceMonitor.measurePageLoad(pageName, startTime);
    },
  };
};

export const useApiTracking = () => {
  return {
    trackCall: async <T>(
      endpoint: string,
      method: string,
      fn: () => Promise<T>
    ): Promise<T> => {
      const startTime = Date.now();
      
      try {
        const result = await fn();
        const duration = Date.now() - startTime;
        performanceMonitor.measureApiCall(endpoint, method, duration, true);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        performanceMonitor.measureApiCall(endpoint, method, duration, false);
        throw error;
      }
    },
  };
};

export default performanceMonitor;
