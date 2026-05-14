import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useCacheStore } from '../../store/useCacheStore';
import { useOfflineQueueStore } from '../../store/useOfflineQueueStore';
import { useFamilyStore } from '../../store/useFamilyStore';
import { useMemberStore } from '../../store/useMemberStore';
import { OfflineBanner } from './OfflineBanner';

interface OfflineModeProviderProps {
  children: React.ReactNode;
}

export const OfflineModeProvider: React.FC<OfflineModeProviderProps> = ({ 
  children 
}) => {
  const { initializeNetworkListener, checkNetwork, isConnected } = useNetworkStore();
  const { loadFromMMKV } = useCacheStore();
  const { loadFromMMKV: loadQueueFromMMKV, startSync } = useOfflineQueueStore();
  const { currentFamily, members } = useFamilyStore();
  const { members: memberList } = useMemberStore();

  useEffect(() => {
    loadFromMMKV();
    loadQueueFromMMKV();
    
    checkNetwork();
    
    const unsubscribe = initializeNetworkListener();
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isConnected) {
      startSync();
    }
  }, [isConnected]);

  useEffect(() => {
    if (currentFamily) {
      useCacheStore.getState().addCachedFamily({
        id: currentFamily.id,
        name: currentFamily.name,
        cachedAt: new Date(),
        data: currentFamily,
      });
    }
  }, [currentFamily]);

  useEffect(() => {
    if (memberList.length > 0) {
      const recentMembers = memberList.slice(0, 20);
      recentMembers.forEach((member) => {
        useCacheStore.getState().addCachedMember({
          id: member.id,
          name: member.name,
          familyId: member.family_id,
          lastViewed: new Date(),
          data: member,
        });
      });
    }
  }, [memberList]);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
