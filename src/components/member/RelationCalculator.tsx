import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import type { TreeNode, Person } from '../../types/familyTree';
import { calculateRelation, calculateAllRelations, RelationResult } from '../../utils/relationCalculator';

interface RelationCalculatorProps {
  visible: boolean;
  onClose: () => void;
  familyTree: TreeNode;
  currentPersonId: string;
  members: Person[];
}

const RelationCalculator: React.FC<RelationCalculatorProps> = ({
  visible,
  onClose,
  familyTree,
  currentPersonId,
  members,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [relationResult, setRelationResult] = useState<RelationResult | null>(null);

  const filteredMembers = members.filter(
    m => m.id !== currentPersonId && m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    const result = calculateRelation(familyTree, currentPersonId, person.id);
    setRelationResult(result);
  };

  const handleClose = () => {
    setSelectedPerson(null);
    setRelationResult(null);
    setSearchQuery('');
    onClose();
  };

  const getIntimacyLabel = (intimacy: number): string => {
    if (intimacy >= 9) return '至亲';
    if (intimacy >= 7) return '亲近';
    if (intimacy >= 5) return '较亲';
    if (intimacy >= 3) return '一般';
    if (intimacy > 0) return '疏远';
    return '无血缘';
  };

  const getIntimacyColor = (intimacy: number): string => {
    if (intimacy >= 9) return '#EF4444';
    if (intimacy >= 7) return '#F59E0B';
    if (intimacy >= 5) return '#10B981';
    if (intimacy >= 3) return '#6B7280';
    return '#9CA3AF';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>关系计算</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* 内容区域 */}
        {selectedPerson && relationResult ? (
          <ScrollView style={styles.resultContainer}>
            {/* 关系结果展示 */}
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{relationResult.title}</Text>
              <Text style={styles.resultDescription}>{relationResult.description}</Text>

              <View style={styles.intimacyContainer}>
                <View style={styles.intimacyBar}>
                  <View
                    style={[
                      styles.intimacyFill,
                      {
                        width: `${relationResult.intimacy * 10}%`,
                        backgroundColor: getIntimacyColor(relationResult.intimacy),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.intimacyLabel, { color: getIntimacyColor(relationResult.intimacy) }]}>
                  {getIntimacyLabel(relationResult.intimacy)}
                </Text>
              </View>
            </View>

            {/* 两人信息 */}
            <View style={styles.personsContainer}>
              <View style={styles.personCard}>
                <Text style={styles.personLabel}>您选择了</Text>
                <View style={[styles.personAvatar, { backgroundColor: '#3B82F620' }]}>
                  <Text style={[styles.personAvatarText, { color: '#3B82F6' }]}>
                    {selectedPerson.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.personName}>{selectedPerson.name}</Text>
                <Text style={styles.personMeta}>
                  {selectedPerson.gender === 'male' ? '男' : '女'}
                  {selectedPerson.birth_date && ` · ${selectedPerson.birth_date}`}
                </Text>
              </View>

              <View style={styles.relationIcon}>
                <Text style={styles.relationIconText}>{relationResult.title}</Text>
              </View>
            </View>

            {/* 重新选择 */}
            <TouchableOpacity
              style={styles.reselectButton}
              onPress={() => {
                setSelectedPerson(null);
                setRelationResult(null);
              }}
            >
              <Text style={styles.reselectButtonText}>重新选择成员</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <>
            {/* 搜索栏 */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="搜索成员姓名..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* 成员列表 */}
            <FlatList
              data={filteredMembers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberItem}
                  onPress={() => handleSelectPerson(item)}
                >
                  <View style={[styles.avatar, { backgroundColor: item.gender === 'male' ? '#3B82F620' : '#EC489920' }]}>
                    <Text style={[styles.avatarText, { color: item.gender === 'male' ? '#3B82F6' : '#EC4899' }]}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberMeta}>
                      {item.gender === 'male' ? '男' : '女'}
                      {item.birth_date && ` · ${item.birth_date}`}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>没有找到匹配的成员</Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#EF4444',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  intimacyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  intimacyBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  intimacyFill: {
    height: '100%',
    borderRadius: 4,
  },
  intimacyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  personsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  personCard: {
    alignItems: 'center',
    flex: 1,
  },
  personLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  personAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personAvatarText: {
    fontSize: 28,
    fontWeight: '600',
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  personMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  relationIcon: {
    paddingHorizontal: 16,
  },
  relationIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  reselectButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reselectButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});

export default RelationCalculator;
