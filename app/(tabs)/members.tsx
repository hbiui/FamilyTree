import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { useMemberStore } from '../../src/store/useMemberStore';
import { useSearchAndFilterStore } from '../../src/store/useSearchAndFilterStore';
import { memberSearchService } from '../../src/services/memberSearchService';
import { MemberSearchBar } from '../../src/components/member/MemberSearchBar';
import { MemberFilters } from '../../src/components/member/MemberFilters';
import { HighlightedText } from '../../src/components/common/HighlightedText';
import { OptimizedAvatar } from '../../src/components/common/OptimizedAvatar';
import { generateMockMembers, loadMockData } from '../../src/utils/mockDataGenerator';
import { useRouter } from 'expo-router';

export default function MembersScreen() {
  const router = useRouter();
  const { members, setMembers } = useMemberStore();
  const {
    searchQuery,
    filters,
    isFiltersVisible,
    toggleFilters,
    hasActiveFilters,
  } = useSearchAndFilterStore();
  const [isLoadingMock, setIsLoadingMock] = useState(false);
  const [scrollStartTime, setScrollStartTime] = useState<number>(0);
  const [scrollStats, setScrollStats] = useState({
    scrollCount: 0,
    avgScrollDuration: 0,
  });

  const loadLargeDataSet = async () => {
    setIsLoadingMock(true);
    try {
      const mockMembers = await loadMockData(200);
      setMembers(mockMembers);
    } catch (error) {
      console.error('Failed to load mock data:', error);
    } finally {
      setIsLoadingMock(false);
    }
  };

  const searchResults = useMemo(() => {
    return memberSearchService.searchMembers(members, searchQuery.searchText, filters);
  }, [members, searchQuery.searchText, filters]);

  const renderMemberCard = useCallback(({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.memberCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/person/${item.person.id}`)}
      >
        <OptimizedAvatar
          uri={item.person.avatar_url}
          name={item.person.name}
          gender={item.person.gender}
          size={48}
        />
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <HighlightedText
              parts={item.highlightedName}
              style={styles.memberName}
              highlightStyle={styles.highlightedName}
            />
            {item.person.generation !== undefined && (
              <View style={styles.generationBadge}>
                <Text style={styles.generationText}>
                  第{item.person.generation}代
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.memberMeta}>
            {item.person.gender === 'male' 
              ? '男' 
              : item.person.gender === 'female' ? '女' : '未知'}
            {item.person.birth_date && ` · ${item.person.birth_date}`}
            {item.person.birthplace && ` · ${item.person.birthplace}`}
          </Text>
          {!item.person.is_alive && (
            <Text style={styles.deceasedTag}>已故</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    setScrollStartTime(Date.now());
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (scrollStartTime) {
      const duration = Date.now() - scrollStartTime;
      setScrollStats(prev => ({
        scrollCount: prev.scrollCount + 1,
        avgScrollDuration: (prev.avgScrollDuration * prev.scrollCount + duration) / (prev.scrollCount + 1),
      }));
    }
  }, [scrollStartTime]);

  const renderEmptyState = () => {
    if (searchQuery.searchText.length > 0 || hasActiveFilters()) {
      return (
        <View style={styles.noResultsState}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsTitle}>未找到匹配的成员</Text>
          <Text style={styles.noResultsText}>
            尝试修改搜索关键词或筛选条件
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyText}>暂无成员</Text>
        <Text style={styles.emptyHint}>
          添加第一位家族成员开始记录
        </Text>
      </View>
    );
  };

  const resultCount = searchResults.length;
  const activeFilters = hasActiveFilters();
  const hasSearch = searchQuery.searchText.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>家族成员</Text>
        <Text style={styles.subtitle}>管理家族成员信息</Text>
      </View>

      {__DEV__ && (
        <View style={styles.devTools}>
          <TouchableOpacity
            style={[styles.devButton, isLoadingMock && styles.disabledButton]}
            onPress={loadLargeDataSet}
            disabled={isLoadingMock}
          >
            {isLoadingMock ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.devButtonText}>📊 加载200个成员</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.statsText}>
            成员数: {members.length} | 滚动: {scrollStats.scrollCount}次
          </Text>
        </View>
      )}

      <MemberSearchBar />

      <View style={styles.filterToggleRow}>
        <TouchableOpacity style={styles.filterToggle} onPress={toggleFilters}>
          <Text style={styles.filterToggleText}>筛选</Text>
          {(activeFilters || hasSearch) && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>
                {resultCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <MemberFilters isVisible={isFiltersVisible} />

      <View style={styles.content}>
        {searchResults.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.person.id}
            renderItem={renderMemberCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            // 虚拟化优化参数
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            // 内存优化
            getItemLayout={(_data, index) => ({
              length: 104, // 每个卡片高度 + margin
              offset: 104 * index,
              index,
            })}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    ...Typography.h2,
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: '#6B7280',
  },
  devTools: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#FCA5A5',
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterToggleRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  filterCountBadge: {
    marginLeft: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingTop: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    ...Typography.h5,
    color: '#1F2937',
    flex: 1,
  },
  highlightedName: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontWeight: '700',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  generationBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  generationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  memberMeta: {
    ...Typography.bodySmall,
    color: '#6B7280',
  },
  deceasedTag: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...Typography.h4,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyHint: {
    ...Typography.body,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  noResultsState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    ...Typography.h4,
    color: '#6B7280',
    marginBottom: 8,
  },
  noResultsText: {
    ...Typography.body,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
