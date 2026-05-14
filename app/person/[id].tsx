import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMemberStore } from '../../src/store/useMemberStore';
import { useFamilyStore } from '../../src/store/useFamilyStore';
import type { Person, Relation } from '../../src/types/familyTree';
import { LARGE_FAMILY_TREE } from '../../src/components/tree/sampleData';
import RelationCalculator from '../../src/components/member/RelationCalculator';
import MemberEventsList from '../../src/components/event/MemberEventsList';
import PhotoEnhancer from '../../src/components/ai/PhotoEnhancer';

export default function PersonDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { members, setCurrentMember } = useMemberStore();
  const { currentFamily } = useFamilyStore();
  
  const [person, setPerson] = useState<Person | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRelationCalculator, setShowRelationCalculator] = useState(false);
  const [showPhotoEnhancer, setShowPhotoEnhancer] = useState(false);

  useEffect(() => {
    const foundPerson = members.find(m => m.id === id);
    if (foundPerson) {
      setPerson(foundPerson);
      setCurrentMember(foundPerson);
    }
    setLoading(false);
  }, [id, members]);

  const getRelatedPersons = (type: 'parent' | 'spouse' | 'child') => {
    return members.filter(m => {
      if (type === 'parent') {
        return m.parent_id === id || m.mother_id === id;
      }
      if (type === 'child') {
        return m.parent_id === id || m.mother_id === id;
      }
      return false;
    });
  };

  const handleEdit = () => {
    router.push(`/person/edit?id=${id}`);
  };

  const handleRelatedPress = (relatedId: string) => {
    router.push(`/person/${relatedId}`);
  };

  const handleCalculateRelation = () => {
    setShowRelationCalculator(true);
  };

  const handleEnhancePhoto = () => {
    setShowPhotoEnhancer(true);
  };

  const handlePhotoEnhanced = (enhancedUrl: string) => {
    if (person) {
      useMemberStore.getState().updateMember(person.id, {
        avatar_url: enhancedUrl,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未找到该成员</Text>
      </View>
    );
  }

  const parents = getRelatedPersons('parent');
  const children = getRelatedPersons('child');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getInitials = (name: string) => name.charAt(0);
  
  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return '#3B82F6';
      case 'female': return '#EC4899';
      default: return '#9CA3AF';
    }
  };

  const renderRelationSection = (
    title: string,
    persons: Person[],
    emptyText: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {persons.length > 0 ? (
        <View style={styles.relationList}>
          {persons.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.relationItem}
              onPress={() => handleRelatedPress(p.id)}
            >
              <View style={[styles.relationAvatar, { backgroundColor: getGenderColor(p.gender) + '20' }]}>
                <Text style={[styles.relationAvatarText, { color: getGenderColor(p.gender) }]}>
                  {getInitials(p.name)}
                </Text>
              </View>
              <View style={styles.relationInfo}>
                <Text style={styles.relationName}>{p.name}</Text>
                <Text style={styles.relationMeta}>
                  {p.gender === 'male' ? '男' : p.gender === 'female' ? '女' : '未知'}
                  {p.birth_date && ` · ${formatDate(p.birth_date)}`}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{emptyText}</Text>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: person.name,
          headerStyle: { backgroundColor: '#FFFBF5' },
          headerTintColor: '#1F2937',
        }}
      />
      <ScrollView style={styles.container}>
        {/* 基本信息卡片 */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {person.avatar_url ? (
              <Image source={{ uri: person.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: getGenderColor(person.gender) + '20' }]}>
                <Text style={[styles.avatarText, { color: getGenderColor(person.gender) }]}>
                  {getInitials(person.name)}
                </Text>
              </View>
            )}
            <View style={[styles.genderBadge, { backgroundColor: getGenderColor(person.gender) }]}>
              <Text style={styles.genderBadgeText}>
                {person.gender === 'male' ? '♂' : person.gender === 'female' ? '♀' : '?'}
              </Text>
            </View>
            {person.avatar_url && (
              <TouchableOpacity
                style={styles.enhanceButton}
                onPress={handleEnhancePhoto}
              >
                <Text style={styles.enhanceButtonText}>✨</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.name}>{person.name}</Text>
          
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>出生：</Text>
            <Text style={styles.dateValue}>
              {person.birth_date ? formatDate(person.birth_date) : '未知'}
            </Text>
          </View>
          
          {person.death_date && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>逝世：</Text>
              <Text style={styles.dateValue}>{formatDate(person.death_date)}</Text>
            </View>
          )}
          
          <View style={[styles.statusBadge, { 
            backgroundColor: person.is_alive ? '#05966920' : '#6B728020' 
          }]}>
            <Text style={[styles.statusText, { 
              color: person.is_alive ? '#059669' : '#6B7280' 
            }]}>
              {person.is_alive ? '在世' : '已故'}
            </Text>
          </View>
        </View>

        {/* 生平简介 */}
        {person.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>生平简介</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{person.bio}</Text>
            </View>
          </View>
        )}

        {/* 其他信息 */}
        {(person.birthplace || person.occupation || person.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>其他信息</Text>
            <View style={styles.infoCard}>
              {person.birthplace && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>籍贯</Text>
                  <Text style={styles.infoValue}>{person.birthplace}</Text>
                </View>
              )}
              {person.occupation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>职业</Text>
                  <Text style={styles.infoValue}>{person.occupation}</Text>
                </View>
              )}
              {person.education && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>学历</Text>
                  <Text style={styles.infoValue}>{person.education}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 关系列表 */}
        {renderRelationSection('👨 父母', parents, '暂无父母信息')}
        {renderRelationSection('💑 配偶', [], '暂无配偶信息')}
        {renderRelationSection('👶 子女', children, '暂无子女信息')}
        
        {/* 事件列表 */}
        {currentFamily && person && (
          <View style={styles.eventSection}>
            <MemberEventsList personId={person.id} familyId={currentFamily.id} />
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={handleCalculateRelation}
        >
          <Text style={styles.calculateButtonText}>🔗 计算关系</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>✏️ 编辑</Text>
        </TouchableOpacity>
      </View>

      {/* 关系计算器弹窗 */}
      <RelationCalculator
        visible={showRelationCalculator}
        onClose={() => setShowRelationCalculator(false)}
        familyTree={LARGE_FAMILY_TREE}
        currentPersonId={id || ''}
        members={members}
      />

      {/* 照片优化弹窗 */}
      <Modal
        visible={showPhotoEnhancer}
        animationType="slide"
        onRequestClose={() => setShowPhotoEnhancer(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPhotoEnhancer(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>照片智能优化</Text>
            <View style={{ width: 40 }} />
          </View>
          {person?.avatar_url && (
            <PhotoEnhancer
              imageUrl={person.avatar_url}
              onClose={() => setShowPhotoEnhancer(false)}
              onEnhanced={handlePhotoEnhanced}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  genderBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  bioText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  relationList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  relationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relationAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  relationInfo: {
    flex: 1,
  },
  relationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  relationMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  eventSection: {
    marginBottom: 0,
  },
  footer: {
    height: 100,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  calculateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  enhanceButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    backgroundColor: '#EF4444',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  enhanceButtonText: {
    fontSize: 18,
  },
});
