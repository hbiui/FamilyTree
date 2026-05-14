import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { captureException, captureMessage } from '../../src/config/sentry';
import { performanceMonitor } from '../../src/utils/performance';

const TestErrorScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testJavaScriptError = () => {
    try {
      addResult('触发 JavaScript 错误...');
      throw new Error('Test JavaScript Error - 这是一条测试错误消息');
    } catch (error) {
      captureException(error, { testType: 'javascript_error' });
      addResult('✅ JavaScript 错误已上报到 Sentry');
    }
  };

  const testTypeError = () => {
    try {
      addResult('触发 TypeError...');
      const obj: any = null;
      obj.nonExistentMethod();
    } catch (error) {
      captureException(error, { testType: 'type_error' });
      addResult('✅ TypeError 已上报到 Sentry');
    }
  };

  const testAsyncError = async () => {
    addResult('触发异步错误...');
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Test Async Error - 这是一条异步测试错误'));
        }, 1000);
      });
    } catch (error) {
      captureException(error, { testType: 'async_error' });
      addResult('✅ 异步错误已上报到 Sentry');
    }
  };

  const testMessage = () => {
    addResult('发送测试消息...');
    captureMessage('Test Message - 这是一条测试消息', 'info');
    addResult('✅ 测试消息已上报到 Sentry');
  };

  const testWarning = () => {
    addResult('发送警告消息...');
    captureMessage('Test Warning - 这是一条警告消息', 'warning');
    addResult('✅ 警告消息已上报到 Sentry');
  };

  const testPerformance = () => {
    addResult('测试性能监控...');
    
    const id = performanceMonitor.startMeasure('test_operation', {
      test: true,
      type: 'performance_test',
    });
    
    setTimeout(() => {
      performanceMonitor.endMeasure(id);
      addResult('✅ 性能指标已记录');
    }, 500);
  };

  const testPageLoad = () => {
    addResult('测试页面加载时间...');
    const startTime = Date.now() - 1000;
    const duration = performanceMonitor.measurePageLoad('TestPage', startTime);
    addResult(`✅ 页面加载时间已记录: ${duration}ms`);
  };

  const testApiCall = () => {
    addResult('测试 API 调用监控...');
    performanceMonitor.measureApiCall('/api/test', 'GET', 1234, true);
    addResult('✅ API 调用已记录');
  };

  const testSlowApiCall = () => {
    addResult('测试慢 API 调用...');
    performanceMonitor.measureApiCall('/api/slow', 'POST', 6000, false);
    addResult('✅ 慢 API 调用已记录（应触发警告）');
  };

  const testBreadcrumb = () => {
    addResult('添加面包屑...');
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test breadcrumb - 这是一条测试面包屑',
      level: 'info',
    });
    addResult('✅ 面包屑已添加');
  };

  const testUser = () => {
    addResult('设置用户信息...');
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
    addResult('✅ 用户信息已设置');
  };

  const getPerformanceReport = () => {
    const report = performanceMonitor.getReport();
    addResult(`性能报告: ${JSON.stringify(report, null, 2)}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testButtons = [
    { label: '🔴 触发 JavaScript 错误', onPress: testJavaScriptError, color: '#EF4444' },
    { label: '🔴 触发 TypeError', onPress: testTypeError, color: '#EF4444' },
    { label: '🔴 触发异步错误', onPress: testAsyncError, color: '#EF4444' },
    { label: '📝 发送测试消息', onPress: testMessage, color: '#3B82F6' },
    { label: '⚠️ 发送警告消息', onPress: testWarning, color: '#F59E0B' },
    { label: '⚡ 测试性能监控', onPress: testPerformance, color: '#10B981' },
    { label: '📄 测试页面加载', onPress: testPageLoad, color: '#10B981' },
    { label: '🌐 测试 API 调用', onPress: testApiCall, color: '#8B5CF6' },
    { label: '🐢 测试慢 API 调用', onPress: testSlowApiCall, color: '#8B5CF6' },
    { label: '🍞 添加面包屑', onPress: testBreadcrumb, color: '#6B7280' },
    { label: '👤 设置用户信息', onPress: testUser, color: '#6B7280' },
    { label: '📊 获取性能报告', onPress: getPerformanceReport, color: '#6B7280' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sentry & 性能监控测试</Text>
        <Text style={styles.subtitle}>点击按钮触发测试事件</Text>
      </View>

      <ScrollView style={styles.buttonContainer}>
        {testButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: button.color }]}
            onPress={button.onPress}
          >
            <Text style={styles.buttonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>测试结果</Text>
          <TouchableOpacity onPress={clearResults}>
            <Text style={styles.clearButton}>清除</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.resultsScroll}>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>暂无测试结果</Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.resultItem}>
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    flex: 1,
    padding: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  resultsScroll: {
    flex: 1,
    padding: 12,
  },
  noResults: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  resultItem: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default TestErrorScreen;
