import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useOfflineQueueStore } from '../../store/useOfflineQueueStore';
import { Colors } from '../../constants/colors';

export const OfflineBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const { operations, isSyncing, startSync, syncError } = useOfflineQueueStore();
  
  const pendingCount = operations.length;
  const isOffline = !isConnected || isInternetReachable === false;

  if (!isOffline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isOffline ? styles.offlineContainer : styles.syncContainer
    ]}>
      <View style={styles.content}>
        <View style={styles.iconAndText}>
          <Ionicons 
            name={isOffline ? 'cloud-offline' : 'sync'} 
            size={18} 
            color="white" 
          />
          <Text style={styles.text}>
            {isOffline 
              ? '离线模式' 
              : pendingCount > 0 
                ? `${pendingCount} 个操作待同步` 
                : '已同步'
            }
          </Text>
        </View>
        
        {!isOffline && pendingCount > 0 && (
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={startSync}
            disabled={isSyncing}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? '同步中...' : '立即同步'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {syncError && (
        <Text style={styles.errorText}>{syncError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 1000,
  },
  offlineContainer: {
    backgroundColor: '#EF4444',
  },
  syncContainer: {
    backgroundColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 4,
  },
});
