import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useCacheStore } from '../../store/useCacheStore';
import { useOfflineQueueStore } from '../../store/useOfflineQueueStore';

export const OfflineDebugPanel: React.FC = () => {
  const networkState = useNetworkStore();
  const cacheState = useCacheStore();
  const queueState = useOfflineQueueStore();

  const simulateOffline = () => {
    networkState.setNetworkStatus({
      isConnected: false,
      isInternetReachable: false,
    });
    Alert.alert('已模拟离线', '现在处于离线模式');
  };

  const simulateOnline = () => {
    networkState.setNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
    });
    Alert.alert('已模拟在线', '现在恢复在线模式');
  };

  const clearAllData = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有缓存和离线队列吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            cacheState.clearAllCache();
            queueState.clearQueue();
            Alert.alert('已清除', '所有缓存数据已清除');
          },
        },
      ]
    );
  };

  const addTestOperation = () => {
    queueState.addOperation('update_member', 'test-member-123', {
      name: 'Test Member',
      updatedAt: new Date().toISOString(),
    });
    Alert.alert('已添加', '测试操作已添加到队列');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 离线模式调试</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>网络状态</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>状态:</Text>
          <Text style={[
            styles.value,
            { color: networkState.isConnected ? '#10B981' : '#EF4444' }
          ]}>
            {networkState.isConnected ? '在线' : '离线'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>类型:</Text>
          <Text style={styles.value}>{networkState.type}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={simulateOffline}>
            <Text style={styles.buttonText}>模拟离线</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={simulateOnline}>
            <Text style={styles.buttonText}>模拟在线</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>缓存状态</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>家族:</Text>
          <Text style={styles.value}>{cacheState.cachedFamilies.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>成员:</Text>
          <Text style={styles.value}>{cacheState.cachedMembers.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>上次同步:</Text>
          <Text style={styles.value}>
            {cacheState.lastSyncAt ? cacheState.lastSyncAt.toLocaleTimeString() : '从未'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>离线队列</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>待同步:</Text>
          <Text style={[
            styles.value,
            { color: queueState.operations.length > 0 ? '#F59E0B' : '#6B7280' }
          ]}>
            {queueState.operations.length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>同步中:</Text>
          <Text style={styles.value}>
            {queueState.isSyncing ? '是' : '否'}
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.blueButton]} 
            onPress={addTestOperation}
          >
            <Text style={styles.buttonText}>添加测试操作</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.orangeButton]} 
            onPress={queueState.startSync}
            disabled={queueState.isSyncing}
          >
            <Text style={styles.buttonText}>
              {queueState.isSyncing ? '同步中...' : '开始同步'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={clearAllData}
        >
          <Text style={styles.buttonText}>清除所有缓存和队列</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  greenButton: {
    backgroundColor: '#10B981',
  },
  blueButton: {
    backgroundColor: '#3B82F6',
  },
  orangeButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
