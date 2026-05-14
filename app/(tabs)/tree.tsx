import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFamilyStore } from '../../src/store/useFamilyStore';
import { useMemberStore } from '../../src/store/useMemberStore';
import { useTourStore } from '../../src/store/useTourStore';
import { FamilyTreeTour } from '../../src/components/tour/FamilyTreeTour';
import { MockFamilyTreeDisplay } from '../../src/components/tour/MockFamilyTreeDisplay';
import { TourDebugPanel } from '../../src/components/tour/TourDebugPanel';
import EmptyState from '../../src/components/common/EmptyState';

// 调试模式开关
const SHOW_DEBUG_PANEL = __DEV__;

export default function TreeScreen() {
  const router = useRouter();
  const { currentFamily } = useFamilyStore();
  const { members } = useMemberStore();
  const { tourCompleted, startTour } = useTourStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !tourCompleted && currentFamily && members.length > 0) {
      // 延迟一小会儿，确保页面渲染完成
      const timer = setTimeout(() => {
        startTour();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, tourCompleted, currentFamily, members.length, startTour]);

  const handleResetTour = () => {
    useTourStore.setState({
      tourCompleted: false,
    });
    startTour();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (!currentFamily) {
    return (
      <>
        <Stack.Screen options={{ title: '家族树' }} />
        <View style={styles.container}>
          <EmptyState
            type="no_family"
            onAction={() => router.push('/family/create')}
            customDescription={
              '每一棵参天大树，都始于一颗小小的种子。\n创建您的家族，开启这段温暖的记忆之旅。'
            }
          />
        </View>
      </>
    );
  }

  if (members.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: currentFamily.name }} />
        <View style={styles.container}>
          <EmptyState
            type="no_members"
            onAction={() => router.push('/person/add')}
            customDescription={
              '家族成员是家族树最重要的组成部分。\n添加第一位成员，让这棵树开始生长。'
            }
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: currentFamily.name }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>家族树</Text>
              <Text style={styles.subtitle}>
                可视化展示 {members.length} 位家族成员
              </Text>
            </View>
            
            {tourCompleted && (
              <TouchableOpacity
                style={styles.replayButton}
                onPress={handleResetTour}
                activeOpacity={0.7}
              >
                <Text style={styles.replayButtonText}>🔄 重看引导</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.treeContainer}>
            <MockFamilyTreeDisplay />
          </View>
          
          {SHOW_DEBUG_PANEL && <TourDebugPanel />}
        </View>

        <FamilyTreeTour />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  replayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  replayButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  treeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
});
