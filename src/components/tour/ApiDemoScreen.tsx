import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { usePreventRepeats } from '../../lib/hooks/usePreventDoubleClick';
import { executeApiRequest } from '../../lib/api/client';
import { useRequestState } from '../../store/useApiStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

// 模拟 API 函数
async function simulateApiCall(action: string): Promise<string> {
  // 这个会被网络模拟层拦截
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new Error('Network error'));
      } else {
        resolve(`Successfully executed: ${action} at ${new Date().toLocaleTimeString()}`);
      }
    }, 1500);
  });
}

export const ApiDemoScreen: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const { execute: safeSave, isLoading: isSaving } = usePreventRepeats();
  
  // 获取请求状态（演示用）
  const { isLoading: requestLoading, error, retryCount } = useRequestState('demo-save');

  const handleSave = async () => {
    await safeSave(async () => {
      try {
        const result = await executeApiRequest({
          id: 'demo-save',
          requestFn: () => simulateApiCall('Save Member'),
          maxRetries: 3,
        });
        
        setResults(prev => [result, ...prev].slice(0, 5));
        Alert.alert('成功', '操作成功！');
      } catch (err) {
        // 错误已经通过 Toast 显示了，这里可以做其他处理
        console.error('操作失败', err);
      }
    });
  };

  const handleDelete = async () => {
    // 直接使用 executeWithLock
    // 或者使用 usePreventRepeats Hook
    try {
      const result = await executeApiRequest({
        id: 'demo-delete',
        requestFn: () => simulateApiCall('Delete Member'),
        maxRetries: 2,
      });
      
      setResults(prev => [result, ...prev].slice(0, 5));
      Alert.alert('成功', '删除成功！');
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const handleClearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 API 层演示</Text>
        <Text style={styles.subtitle}>
          前往设置页面的「开发调试」区域，先配置网络模拟模式
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>操作按钮</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSaving && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>保存成员</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>删除成员</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            💡 提示：快速点击「保存成员」多次，试试防重复点击功能！
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>操作结果</Text>
            {results.length > 0 && (
              <TouchableOpacity onPress={handleClearResults}>
                <Text style={styles.clearButton}>清空</Text>
              </TouchableOpacity>
            )}
          </View>

          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无操作结果</Text>
              <Text style={styles.emptyHint}>点击上方按钮开始测试</Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {results.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultText}>✅ {result}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能说明</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>防重复点击</Text>
                <Text style={styles.featureDesc}>
                  操作进行时，按钮会禁用，防止重复提交
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>自动重试</Text>
                <Text style={styles.featureDesc}>
                  网络不稳定时自动重试 3 次，指数退避
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔔</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Toast 提示</Text>
                <Text style={styles.featureDesc}>
                  根据错误类型显示友好的提示消息
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔙</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>手动重试</Text>
                <Text style={styles.featureDesc}>
                  Toast 上提供重试按钮，用户可以手动重试
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h2,
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.h4,
    color: '#374151',
  },
  clearButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resultsList: {
    gap: 8,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultText: {
    fontSize: 14,
    color: '#1F2937',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
