import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../../services/aiService';
import { useAIStore } from '../../store/useAIStore';
import { useMemberStore } from '../../store/useMemberStore';
import { useFamilyStore } from '../../store/useFamilyStore';
import type { ParsedPerson, ParsedRelation, Gender, RelationType } from '../../types/familyTree';

const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  father: '父亲',
  mother: '母亲',
  son: '儿子',
  daughter: '女儿',
  spouse: '配偶',
  brother: '兄弟',
  sister: '姐妹',
  grandfather: '祖父',
  grandmother: '祖母',
  grandson: '孙子',
  granddaughter: '孙女',
  uncle: '叔叔/伯伯',
  aunt: '阿姨/姑姑',
  cousin: '堂/表亲',
  brother_in_law: '内兄/内弟',
  sister_in_law: '内姐/内妹',
  nephew: '侄子/外甥',
  niece: '侄女/外甥女',
};

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '未知', value: 'unknown' },
];

const EXAMPLE_PROMPTS = [
  '张三是李四的父亲，李四有个儿子叫王五',
  '李华和王芳结婚了，他们的女儿叫李明',
  '张建国的父亲叫张大山，母亲叫刘秀英',
];

interface RelationParserProps {
  onClose?: () => void;
}

export default function RelationParser({ onClose }: RelationParserProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const {
    parseResult,
    isParsing,
    parseError,
    setParseResult,
    setIsParsing,
    setParseError,
    clearParseState,
    updateParsedPerson,
    updateParsedRelation,
    removeParsedPerson,
    removeParsedRelation,
  } = useAIStore();
  const { members, addMember } = useMemberStore();
  const { currentFamily } = useFamilyStore();

  const handleParse = async () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入家族关系描述');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const result = await aiService.parseRelationDescription(
        inputText,
        members.map((m) => ({ id: m.id, name: m.name }))
      );
      setParseResult(result);

      if (!result.success && result.error) {
        Alert.alert('解析失败', result.error);
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : '解析失败');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parseResult || !currentFamily) return;

    try {
      const now = new Date().toISOString();

      parseResult.persons.forEach((parsedPerson) => {
        const existingMember = members.find((m) => m.id === parsedPerson.id);
        if (!existingMember) {
          addMember({
            id: parsedPerson.id,
            family_id: currentFamily.id,
            name: parsedPerson.name,
            gender: parsedPerson.gender,
            birth_date: parsedPerson.birth_date,
            death_date: parsedPerson.death_date,
            is_alive: parsedPerson.is_alive,
            bio: parsedPerson.notes ? `AI 备注: ${parsedPerson.notes}` : undefined,
            created_at: now,
            updated_at: now,
          });
        }
      });

      parseResult.relations.forEach((relation) => {
        const fromPerson = members.find((m) => m.id === relation.from_id);
        const toPerson = members.find((m) => m.id === relation.to_id);

        if (fromPerson && toPerson) {
          if (relation.relation_type === 'father') {
            updateMemberInStore(toPerson.id, { parent_id: fromPerson.id });
          } else if (relation.relation_type === 'mother') {
            updateMemberInStore(toPerson.id, { mother_id: fromPerson.id });
          } else if (relation.relation_type === 'son' || relation.relation_type === 'daughter') {
            updateMemberInStore(fromPerson.id, { parent_id: toPerson.id });
          }
        }
      });

      Alert.alert('成功', '已成功添加家族成员和关系', [
        { text: '确定', onPress: () => {
          clearParseState();
          onClose?.();
        }},
      ]);
    } catch (error) {
      Alert.alert('错误', '添加成员失败，请重试');
    }
  };

  const updateMemberInStore = (id: string, updates: any) => {
    useMemberStore.getState().updateMember(id, updates);
  };

  const handleReset = () => {
    clearParseState();
    setInputText('');
  };

  const getGenderColor = (gender: Gender) => {
    switch (gender) {
      case 'male': return '#3B82F6';
      case 'female': return '#EC4899';
      default: return '#9CA3AF';
    }
  };

  const getInitials = (name: string) => name.charAt(0);

  const renderPersonCard = (person: ParsedPerson) => (
    <View key={person.id} style={styles.personCard}>
      <View style={styles.personHeader}>
        <View style={[styles.personAvatar, { backgroundColor: getGenderColor(person.gender) + '20' }]}>
          <Text style={[styles.personAvatarText, { color: getGenderColor(person.gender) }]}>
            {getInitials(person.name)}
          </Text>
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <View style={styles.genderSelector}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.genderOption,
                  person.gender === opt.value && {
                    backgroundColor: getGenderColor(opt.value) + '20',
                    borderColor: getGenderColor(opt.value),
                  },
                ]}
                onPress={() => updateParsedPerson(person.id, { gender: opt.value })}
              >
                <Text style={[
                  styles.genderOptionText,
                  person.gender === opt.value && { color: getGenderColor(opt.value) },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeParsedPerson(person.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      {person.notes && (
        <Text style={styles.personNotes}>💡 {person.notes}</Text>
      )}
      {person.is_placeholder && (
        <View style={styles.placeholderBadge}>
          <Text style={styles.placeholderBadgeText}>占位节点</Text>
        </View>
      )}
    </View>
  );

  const renderRelationItem = (relation: ParsedRelation, index: number) => {
    const fromPerson = parseResult?.persons.find((p) => p.id === relation.from_id);
    const toPerson = parseResult?.persons.find((p) => p.id === relation.to_id);

    if (!fromPerson || !toPerson) return null;

    return (
      <View key={index} style={styles.relationItem}>
        <View style={styles.relationPersons}>
          <Text style={styles.relationPersonName}>{fromPerson.name}</Text>
          <Text style={styles.relationArrow}>→</Text>
          <Text style={styles.relationPersonName}>{toPerson.name}</Text>
        </View>
        <View style={styles.relationTypeRow}>
          <Text style={styles.relationTypeLabel}>关系:</Text>
          <Text style={styles.relationTypeValue}>
            {RELATION_TYPE_LABELS[relation.relation_type]}
          </Text>
        </View>
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>置信度:</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${relation.confidence * 100}%`,
                  backgroundColor: relation.confidence > 0.8 ? '#059669' : relation.confidence > 0.5 ? '#F59E0B' : '#EF4444',
                },
              ]}
            />
          </View>
          <Text style={styles.confidenceValue}>{Math.round(relation.confidence * 100)}%</Text>
        </View>
        <TouchableOpacity
          style={styles.removeRelationButton}
          onPress={() => removeParsedRelation(index)}
        >
          <Text style={styles.removeRelationText}>删除</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 标题 */}
      <Text style={styles.title}>🤖 AI 关系推测</Text>
      <Text style={styles.subtitle}>
        用自然语言描述家族关系，AI 会帮你解析并生成成员节点
      </Text>

      {/* 输入区域 */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>输入描述</Text>
        <TextInput
          style={styles.textInput}
          placeholder="例如：张三是李四的父亲，李四和王芳结婚了..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={4}
          editable={!parseResult}
        />

        {/* 示例提示 */}
        {!parseResult && (
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>试试这些示例:</Text>
            {EXAMPLE_PROMPTS.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleChip}
                onPress={() => setInputText(example)}
              >
                <Text style={styles.exampleChipText}>{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 解析按钮 */}
        {!parseResult && (
          <TouchableOpacity
            style={[styles.parseButton, isParsing && styles.parseButtonDisabled]}
            onPress={handleParse}
            disabled={isParsing}
          >
            {isParsing ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.parseButtonText}>  解析中...</Text>
              </>
            ) : (
              <Text style={styles.parseButtonText}>✨ 开始解析</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 解析结果 */}
      {parseResult && (
        <View style={styles.resultSection}>
          {/* 成员列表 */}
          <View style={styles.resultSubsection}>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionTitle}>
                👥 识别到的成员 ({parseResult.persons.length})
              </Text>
            </View>
            {parseResult.persons.map(renderPersonCard)}
          </View>

          {/* 关系列表 */}
          {parseResult.relations.length > 0 && (
            <View style={styles.resultSubsection}>
              <View style={styles.subsectionHeader}>
                <Text style={styles.subsectionTitle}>
                  🔗 识别到的关系 ({parseResult.relations.length})
                </Text>
              </View>
              <View style={styles.relationsContainer}>
                {parseResult.relations.map(renderRelationItem)}
              </View>
            </View>
          )}

          {/* AI 备注 */}
          {parseResult.ai_notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>💭 AI 备注</Text>
              <Text style={styles.notesText}>{parseResult.ai_notes}</Text>
            </View>
          )}

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>重新输入</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>✅ 确认添加</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {parseError && (
        <View style={styles.errorSection}>
          <Text style={styles.errorTitle}>❌ 解析错误</Text>
          <Text style={styles.errorText}>{parseError}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    padding: 16,
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
    marginBottom: 24,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  examplesContainer: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  exampleChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  exampleChipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  parseButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  parseButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  parseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultSection: {
    marginTop: 16,
  },
  resultSubsection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  personCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personAvatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: '600',
  },
  personNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  placeholderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  placeholderBadgeText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  relationsContainer: {
    gap: 12,
  },
  relationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  relationPersons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationPersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  relationArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  relationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationTypeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  relationTypeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    width: 40,
  },
  removeRelationButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeRelationText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },
});
