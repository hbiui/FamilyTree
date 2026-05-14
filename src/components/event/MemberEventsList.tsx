import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '../../store/useEventStore';
import { getMemberEvents } from '../../services/familyEventService';
import EmptyState from '../common/EmptyState';
import type { FamilyEventWithPeople } from '../../types/familyTree';

// 辅助函数和类型导入
import { EVENT_TYPE_CONFIG } from '../../services/familyEventService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MemberEventsListProps {
  personId: string;
  familyId: string;
}

export default function MemberEventsList({ personId, familyId }: MemberEventsListProps) {
  const router = useRouter();
  const {
    memberEvents,
    memberEventsPage,
    hasMoreMemberEvents,
    isLoadingMemberEvents,
    setMemberEvents,
    setMemberEventsPage,
    setHasMoreMemberEvents,
    setLoadingMemberEvents,
    setError,
  } = useEventStore();

  const events = memberEvents[personId] || [];
  const currentPage = memberEventsPage[personId] || 1;
  const hasMore = hasMoreMemberEvents[personId] ?? true;

  const loadEvents = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (isLoadingMemberEvents) return;

      setLoadingMemberEvents(true);
      try {
        const result = await getMemberEvents(personId, familyId, page);

        if (result.success && result.events) {
          setMemberEvents(personId, result.events, append);
          setMemberEventsPage(personId, page);
          setHasMoreMemberEvents(personId, result.hasMore ?? false);
        } else {
          setError(result.error || '加载事件失败');
        }
      } catch (error) {
        setError('加载事件失败');
      } finally {
        setLoadingMemberEvents(false);
      }
    },
    [
      personId,
      familyId,
      isLoadingMemberEvents,
      setMemberEvents,
      setMemberEventsPage,
      setHasMoreMemberEvents,
      setLoadingMemberEvents,
      setError,
    ]
  );

  useEffect(() => {
    loadEvents(1);
    return () => {
      // 清理
    };
  }, [loadEvents]);

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMemberEvents) {
      loadEvents(currentPage + 1, true);
    }
  };

  const handlePersonPress = (personId: string) => {
    router.push(`/person/${personId}`);
  };

  const renderEventItem = ({ item, index }: { item: FamilyEventWithPeople; index: number }) => (
    <TouchableOpacity style={styles.eventItem} activeOpacity={0.7}>
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatEventDateShort(item.date)}</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventType}>{EVENT_TYPE_CONFIG[item.type].label}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.related_people.length > 0 && (
          <View style={styles.relatedPeople}>
            <Text style={styles.relatedLabel}>相关：</Text>
            <View style={styles.relatedList}>
              {item.related_people.slice(0, 3).map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.relatedPerson}
                  onPress={() => handlePersonPress(person.id)}
                >
                  <Text style={styles.relatedPersonName}>{person.name}</Text>
                </TouchableOpacity>
              ))}
              {item.related_people.length > 3 && (
                <Text style={styles.moreLabel}>+{item.related_people.length - 3}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore || events.length === 0) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingMemberEvents && events.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      );
    }

    return (
      <EmptyState
        type="no_events"
        compact
        customTitle="记录生命的故事"
        customDescription="为这位家族成员添加出生、结婚、升学等重要时刻，让他的故事永远被铭记。"
        customActionText="添加故事"
        onAction={() => {
          // TODO: Navigate to add event page with pre-selected person
          console.log('Navigate to add event for person:', personId);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📅 大事记</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={events.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function formatEventDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  list: {
    paddingBottom: 8,
  },
  emptyList: {
    minHeight: 120,
    justifyContent: 'center',
  },
  eventItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  eventCard: {
    flexDirection: 'column',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dateContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
    marginLeft: 58,
  },
  relatedPeople: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 58,
    flexWrap: 'wrap',
  },
  relatedLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  relatedList: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  relatedPerson: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginVertical: 2,
  },
  relatedPersonName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  moreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});