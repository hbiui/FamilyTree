import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useTheme } from '../../context/ThemeContext';
import { captureException } from '../../config/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
    
    this.props.onError?.(error, errorInfo);
  }

  handleRetry(): void {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }
    
    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const colors = {
    background: '#FFFBF5',
    card: '#FFFFFF',
    text: '#1F2937',
    secondary: '#6B7280',
    error: '#EF4444',
    primary: '#EF4444',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          出错了
        </Text>
        
        <Text style={[styles.message, { color: colors.secondary }]}>
          很抱歉，应用遇到了一个错误。我们已经记录了这个问题，请稍后再试。
        </Text>
        
        {__DEV__ && error && (
          <View style={[styles.errorBox, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              错误详情（仅开发模式显示）
            </Text>
            <ScrollView style={styles.errorScroll} nestedScrollEnabled>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error.toString()}
              </Text>
            </ScrollView>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.secondary }]}
            onPress={() => {
              // 重启应用逻辑
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>
              返回首页
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorScroll: {
    maxHeight: 120,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;

export function withErrorBoundary(
  WrappedComponent: React.ComponentType<any>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WithErrorBoundary = (props: any) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {React.createElement(WrappedComponent, props)}
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithErrorBoundary;
}
