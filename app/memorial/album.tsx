import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useFamilyStore } from '../../src/store/useFamilyStore';
import { useMemberStore } from '../../src/store/useMemberStore';
import MemorialEditor from '../../src/components/memorial/MemorialEditor';
import type { MemorialPoster } from '../../src/types/memorial';

export default function MemorialAlbumScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentFamily } = useFamilyStore();
  const { members } = useMemberStore();
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const [familyMotto, setFamilyMotto] = useState('');

  const handleMemberToggle = useCallback((member: any) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers([...members]);
    }
  }, [members, selectedMembers]);

  const handleContinue = useCallback(() => {
    if (selectedMembers.length === 0) {
      Alert.alert('提示', '请至少选择一位家族成员');
      return;
    }
    setStep('edit');
  }, [selectedMembers]);

  const handleSave = useCallback((poster: MemorialPoster) => {
    console.log('Poster saved:', poster);
  }, []);

  const handleShare = useCallback(() => {
    console.log('Share poster');
  }, []);

  const generateQrCodeData = useCallback(() => {
    if (!currentFamily) return '';
    return `https://familytree.app/join/${currentFamily.id}`;
  }, [currentFamily]);

  if (step === 'edit') {
    return (
      <MemorialEditor
        familyName={currentFamily?.name || '我的家族'}
        familyMotto={familyMotto}
        selectedMembers={selectedMembers}
        qrCodeData={generateQrCodeData()}
        onSave={handleSave}
        onShare={handleShare}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: colors.primary[500] }]}>← 返回</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text.primary }]}>家族纪念册</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.mottoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>家族格言（可选）</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.placeholder, { color: colors.text.tertiary }]}>
              输入家族格言，如"传承家风，弘扬家训"
            </Text>
          </View>
        </View>

        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              选择成员 ({selectedMembers.length}/{members.length})
            </Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={[styles.selectAllText, { color: colors.primary[500] }]}>
                {selectedMembers.length === members.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersGrid}>
            {members.map((member) => {
              const isSelected = selectedMembers.some(m => m.id === member.id);
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberCard,
                    {
                      backgroundColor: colors.background.card,
                      borderColor: isSelected ? colors.primary[500] : colors.border.default,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleMemberToggle(member)}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      { backgroundColor: member.gender === 'male' ? colors.gender.male : colors.gender.female },
                    ]}
                  >
                    <Text style={styles.memberInitial}>{member.name?.charAt(0) || '?'}</Text>
                  </View>
                  <Text style={[styles.memberName, { color: colors.text.primary }]} numberOfLines={1}>
                    {member.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary[500] }]}>
                      <Text style={styles.checkBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {members.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyIcon]}>👨‍👩‍👧‍👦</Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                暂无家族成员，请先添加成员
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>💡 温馨提示</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.background.tertiary }]}>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • 建议选择 4-8 位成员，效果最佳
            </Text>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • 可以拖拽调整成员位置
            </Text>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • 海报将自动包含二维码，方便邀请新成员
            </Text>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • 支持分享到微信、朋友圈等平台
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background.card }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedMembers.length > 0 ? colors.primary[500] : colors.secondary[300],
            },
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            创建纪念册 ({selectedMembers.length}人)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  mottoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 15,
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberCard: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
