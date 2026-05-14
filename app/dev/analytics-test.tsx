import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { analytics, AnalyticsEvents, RelationTypes, InviteMethods, Genders } from '../../src/config/analytics';
import { useEventTracking } from '../../src/hooks/useAnalytics';

const AnalyticsTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const {
    logFamilyCreate,
    logMemberAdd,
    logRelationCalculate,
    logInviteSend,
    logGedcomExport,
    logPhotoRestore,
    logThemeSwitch,
    logLanguageSwitch,
  } = useEventTracking();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testScreenView = () => {
    analytics.logScreenView('test_screen', 'AnalyticsTestScreen');
    addResult('✅ 发送 screen_view 事件');
  };

  const testFamilyCreate = () => {
    logFamilyCreate(5, 2000);
    addResult('✅ 发送 family_create 事件（5 人，耗时 2s）');
  };

  const testMemberAdd = () => {
    logMemberAdd('test_family_123', Genders.MALE, 1990);
    addResult('✅ 发送 member_add 事件（男性，1990 年出生）');
  };

  const testRelationCalculate = () => {
    logRelationCalculate('test_family_123', 3, RelationTypes.DIRECT);
    addResult('✅ 发送 relation_calculate 事件（深度 3，直系亲属）');
  };

  const testInviteSend = () => {
    logInviteSend(InviteMethods.LINK, 'editor');
    addResult('✅ 发送 share_invite_send 事件（链接邀请，编辑权限）');
  };

  const testGedcomExport = () => {
    logGedcomExport(25, true, true);
    addResult('✅ 发送 gedcom_export 事件（25 人，含隐私数据，密码保护）');
  };

  const testPhotoRestore = () => {
    logPhotoRestore('photo_456', 50, 1500);
    addResult('✅ 发送 photo_restore 事件（50 年老照片，耗时 1.5s）');
  };

  const testThemeSwitch = () => {
    logThemeSwitch('dark');
    addResult('✅ 发送 theme_switch 事件（深色模式）');
  };

  const testLanguageSwitch = () => {
    logLanguageSwitch('zh-CN');
    addResult('✅ 发送 language_switch 事件（中文）');
  };

  const testCustomEvent = () => {
    analytics.logEvent('custom_test_event', {
      test_param: 'test_value',
      timestamp: Date.now(),
    });
    addResult('✅ 发送自定义事件 custom_test_event');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const viewEventQueue = () => {
    const queue = analytics.getEventQueue();
    addResult(`📊 事件队列长度: ${queue.length}`);
    queue.forEach(event => {
      addResult(`  - ${event.name} (${new Date(event.timestamp).toLocaleTimeString()})`);
    });
  };

  const testButtons = [
    { label: '📱 测试 screen_view', onPress: testScreenView, color: '#3B82F6' },
    { label: '👨‍👩‍👧‍👦 测试 family_create', onPress: testFamilyCreate, color: '#10B981' },
    { label: '👤 测试 member_add', onPress: testMemberAdd, color: '#8B5CF6' },
    { label: '🔗 测试 relation_calculate', onPress: testRelationCalculate, color: '#F59E0B' },
    { label: '📧 测试 share_invite_send', onPress: testInviteSend, color: '#EC4899' },
    { label: '📄 测试 gedcom_export', onPress: testGedcomExport, color: '#06B6D4' },
    { label: '📷 测试 photo_restore', onPress: testPhotoRestore, color: '#84CC16' },
    { label: '🎨 测试 theme_switch', onPress: testThemeSwitch, color: '#6366F1' },
    { label: '🌍 测试 language_switch', onPress: testLanguageSwitch, color: '#EF4444' },
    { label: '✨ 测试自定义事件', onPress: testCustomEvent, color: '#14B8A6' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>埋点测试页面</Text>
        <Text style={styles.subtitle}>点击按钮触发埋点事件</Text>
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
        
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6B7280' }]}
          onPress={viewEventQueue}
        >
          <Text style={styles.buttonText}>📊 查看事件队列</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#9CA3AF' }]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>🗑️ 清除测试结果</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>测试结果</Text>
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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

export default AnalyticsTestScreen;
