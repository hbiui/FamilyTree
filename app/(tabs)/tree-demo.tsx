import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FamilyTree from '../../src/components/tree/FamilyTree';
import { LARGE_FAMILY_TREE } from '../../src/components/tree/sampleData';

const FamilyTreeDemo: React.FC = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleMemberPress = (memberId: string) => {
    setSelectedMemberId(memberId);
    Alert.alert(
      '成员信息',
      `您点击了成员 ID: ${memberId}`,
      [
        { text: '确定', style: 'default' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>家族树</Text>
        <Text style={styles.subtitle}>王氏家族世系图</Text>
      </View>

      <View style={styles.treeContainer}>
        <FamilyTree
          data={LARGE_FAMILY_TREE}
          onMemberPress={handleMemberPress}
          nodeWidth={100}
          nodeHeight={120}
          horizontalGap={40}
          verticalGap={100}
        />
      </View>

      {selectedMemberId && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            已选择: {selectedMemberId}
          </Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>操作提示</Text>
        <Text style={styles.instructionText}>
          • 双指捏合缩放树图{'\n'}
          • 单指拖拽移动视图{'\n'}
          • 点击节点查看详情
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  treeContainer: {
    flex: 1,
  },
  footer: {
    padding: 12,
    backgroundColor: '#3B82F6',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  instructions: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default FamilyTreeDemo;
