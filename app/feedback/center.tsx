import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useFeedbackStore } from '../../src/store/useFeedbackStore';
import { MOOD_EMOJIS, MOOD_LABELS } from '../../src/types/feedback';

export default function FeedbackCenterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { feedbackEntries, totalMoodRatings, lastMoodRatingDate, resetFeedback } = useFeedbackStore();

  const recentEntries = feedbackEntries.slice(-5).reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: colors.primary[500] }]}>← 返回</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text.primary }]}>反馈中心</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.statsCard, { backgroundColor: colors.background.card }]}>
            <Text style={styles.statsIcon}>📊</Text>
            <Text style={[styles.statsNumber, { color: colors.text.primary }]}>
              {totalMoodRatings}
            </Text>
            <Text style={[styles.statsLabel, { color: colors.text.secondary }]}>
              心情评分次数
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>快速反馈</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background.card }]}
            onPress={() => router.push('/feedback/form')}
          >
            <Text style={styles.menuIcon}>💬</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text.primary }]}>意见反馈</Text>
              <Text style={[styles.menuDesc, { color: colors.text.secondary }]}>
                提交问题或建议
              </Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>历史记录</Text>
          
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <View
                key={entry.id}
                style={[styles.historyCard, { backgroundColor: colors.background.card }]}
              >
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyType, { color: colors.primary[500] }]}>
                    {entry.type === 'mood_rating' ? '🎭 心情评分' : 
                     entry.type === 'bug_report' ? '🐛 问题反馈' :
                     entry.type === 'feature_request' ? '💡 功能建议' : '💬 其他意见'}
                  </Text>
                  <Text style={[styles.historyDate, { color: colors.text.tertiary }]}>
                    {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
                
                {entry.moodRating && (
                  <View style={styles.moodDisplay}>
                    <Text style={styles.moodEmoji}>
                      {MOOD_EMOJIS[entry.moodRating.score]}
                    </Text>
                    <Text style={[styles.moodLabel, { color: colors.text.secondary }]}>
                      {MOOD_LABELS[entry.moodRating.score]}
                    </Text>
                  </View>
                )}
                
                {entry.description && (
                  <Text style={[styles.historyDesc, { color: colors.text.secondary }]} numberOfLines={2}>
                    {entry.description}
                  </Text>
                )}
                
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: entry.status === 'submitted' ? '#DCFCE7' : 
                                   entry.status === 'reviewed' ? '#DBEAFE' : '#FEF3C7',
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    {
                      color: entry.status === 'submitted' ? '#166534' :
                             entry.status === 'reviewed' ? '#1E40AF' : '#92400E',
                    }
                  ]}>
                    {entry.status === 'submitted' ? '已提交' :
                     entry.status === 'reviewed' ? '已查看' : '待处理'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.background.card }]}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                暂无反馈记录
              </Text>
            </View>
          )}
        </View>

        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>开发工具</Text>
            
            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: colors.background.card }]}
              onPress={() => {
                useFeedbackStore.getState().initializeFirstUse();
                alert('已重置首次使用时间');
              }}
            >
              <Text style={styles.devIcon}>🔄</Text>
              <Text style={[styles.devText, { color: colors.text.primary }]}>
                重置首次使用时间
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: colors.background.card }]}
              onPress={() => {
                useFeedbackStore.getState().resetFeedback();
                alert('已重置所有反馈数据');
              }}
            >
              <Text style={styles.devIcon}>🗑️</Text>
              <Text style={[styles.devText, { color: colors.text.primary }]}>
                重置所有反馈数据
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  statsIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
  },
  menuArrow: {
    fontSize: 24,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  devIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  devText: {
    fontSize: 14,
  },
});
