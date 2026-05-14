import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import RelationParser from '../../src/components/ai/RelationParser';
import PhotoEnhancer from '../../src/components/ai/PhotoEnhancer';
import { useMemberStore } from '../../src/store/useMemberStore';

type ModalType = 'relation' | 'photo' | null;

export default function AIFeaturesScreen() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { members } = useMemberStore();

  const handleRelationParse = () => {
    setActiveModal('relation');
  };

  const handlePhotoEnhance = () => {
    setActiveModal('photo');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const hasMembersWithPhoto = members.some((m) => m.avatar_url);
  const samplePhotoUrl = hasMembersWithPhoto
    ? members.find((m) => m.avatar_url)?.avatar_url || ''
    : 'https://picsum.photos/400/400';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI 智能功能',
          headerStyle: { backgroundColor: '#FFFBF5' },
          headerTintColor: '#1F2937',
        }}
      />

      <View style={styles.content}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI 工具箱</Text>
          <Text style={styles.subtitle}>
            利用人工智能技术，让家族树的构建和管理更加智能高效
          </Text>
        </View>

        {/* 功能卡片 */}
        <View style={styles.cardContainer}>
          {/* 关系推测 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleRelationParse}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.cardIconText}>🔗</Text>
            </View>
            <Text style={styles.cardTitle}>关系智能推测</Text>
            <Text style={styles.cardDescription}>
              用自然语言描述家族关系，AI 自动解析并生成成员节点
            </Text>
            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>开始使用</Text>
              <Text style={styles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* 照片优化 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={handlePhotoEnhance}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#FDF4FF' }]}>
              <Text style={styles.cardIconText}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>老照片智能修复</Text>
            <Text style={styles.cardDescription}>
              AI 自动提升老照片清晰度，去除噪点和划痕
            </Text>
            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>开始使用</Text>
              <Text style={styles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 使用说明 */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 功能说明</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>1.</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipHighlight}>关系推测</Text>：输入类似"张三是李四的父亲"这样的描述，AI 会自动创建成员和关系
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>2.</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipHighlight}>照片修复</Text>：选择成员照片，AI 会自动优化清晰度和色彩
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>3.</Text>
              <Text style={styles.tipText}>
                所有 AI 生成的内容都可以手动编辑和确认后再保存
              </Text>
            </View>
          </View>
        </View>

        {/* 技术信息 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🔧 技术说明</Text>
          <Text style={styles.infoText}>
            当前使用 Mock 数据进行演示。如需连接真实 API，请在代码中设置 API Key 并关闭 Mock 模式。
          </Text>
        </View>
      </View>

      {/* 关系推测模态框 */}
      <Modal
        visible={activeModal === 'relation'}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
            <Text style={styles.modalTitle}>关系智能推测</Text>
            <View style={{ width: 40 }} />
          </View>
          <RelationParser onClose={closeModal} />
        </SafeAreaView>
      </Modal>

      {/* 照片优化模态框 */}
      <Modal
        visible={activeModal === 'photo'}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>照片智能优化</Text>
            <View style={{ width: 40 }} />
          </View>
          <PhotoEnhancer
            imageUrl={samplePhotoUrl}
            onClose={closeModal}
            onEnhanced={(url) => {
              console.log('Enhanced photo:', url);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  cardContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginRight: 4,
  },
  cardArrow: {
    fontSize: 18,
    color: '#EF4444',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    marginRight: 12,
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  tipHighlight: {
    fontWeight: '600',
    color: '#1F2937',
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});
