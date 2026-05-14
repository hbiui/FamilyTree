import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useEventStore } from '../../src/store/useEventStore';
import { useFamilyStore } from '../../src/store/useFamilyStore';
import { getFamilyEvents } from '../../src/services/familyEventService';
import EventCard from '../../src/components/event/EventCard';
import type { FamilyEventWithPeople } from '../../src/types/familyTree';

export default function TimelinePage() {
  const { currentFamily } = useFamilyStore();
  const {
    familyEvents,
    familyEventsPage,
    hasMoreFamilyEvents,
    isLoadingFamilyEvents,
    setFamilyEvents,
    setFamilyEventsPage,
    setHasMoreFamilyEvents,
    setLoadingFamilyEvents,
    setError,
  } = useEventStore();

  const loadEvents = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!currentFamily || isLoadingFamilyEvents) return;

      setLoadingFamilyEvents(true);
      try {
        const result = await getFamilyEvents(currentFamily.id, page);

        if (result.success && result.events) {
          setFamilyEvents(result.events, append);
          setFamilyEventsPage(page);
          setHasMoreFamilyEvents(result.hasMore ?? false);
        } else {
          setError(result.error || '加载事件失败');
        }
      } catch (error) {
        setError('加载事件失败');
      } finally {
        setLoadingFamilyEvents(false);
      }
    },
    [
      currentFamily,
      isLoadingFamilyEvents,
      setFamilyEvents,
      setFamilyEventsPage,
      setHasMoreFamilyEvents,
      setLoadingFamilyEvents,
      setError,
    ]
  );

  useEffect(() => {
    loadEvents(1);
  }, [currentFamily?.id]);

  const handleLoadMore = () => {
    if (hasMoreFamilyEvents && !isLoadingFamilyEvents) {
      loadEvents(familyEventsPage + 1, true);
    }
  };

  const renderFooter = () => {
    if (!hasMoreFamilyEvents || familyEvents.length === 0) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingFamilyEvents && familyEvents.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📜</Text>
        <Text style={styles.emptyTitle}>暂无大事记</Text>
        <Text style={styles.emptyDesc}>记录重要时刻，让家族记忆永存</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: '家族大事记',
          headerStyle: { backgroundColor: '#FFFBF5' },
          headerTintColor: '#1F2937',
        }}
      />

      <FlatList
        data={familyEvents}
        renderItem={({ item, index }) => (
          <EventCard
            event={item}
            index={index}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          familyEvents.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  list: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});