import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useMemberStore } from '../../src/store/useMemberStore';
import type { Person, Gender } from '../../src/types/familyTree';
import * as ImagePicker from 'expo-image-picker';

interface FormData {
  name: string;
  gender: Gender;
  birth_date: string;
  death_date: string;
  bio: string;
  birthplace: string;
  occupation: string;
  education: string;
  avatar_url: string;
  parent_id: string;
  mother_id: string;
  spouse_id: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

export default function EditPersonPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { members, addMember, updateMember, setCurrentMember } = useMemberStore();
  const isEditing = Boolean(id);

  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [relationType, setRelationType] = useState<'parent' | 'spouse'>('parent');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const existingPerson = useMemo(() => {
    if (id) {
      return members.find(m => m.id === id);
    }
    return null;
  }, [id, members]);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      gender: 'unknown' as Gender,
      birth_date: '',
      death_date: '',
      bio: '',
      birthplace: '',
      occupation: '',
      education: '',
      avatar_url: '',
      parent_id: '',
      mother_id: '',
      spouse_id: '',
    },
  });

  useEffect(() => {
    if (existingPerson) {
      reset({
        name: existingPerson.name || '',
        gender: existingPerson.gender || 'unknown',
        birth_date: existingPerson.birth_date || '',
        death_date: existingPerson.death_date || '',
        bio: existingPerson.bio || '',
        birthplace: existingPerson.birthplace || '',
        occupation: existingPerson.occupation || '',
        education: existingPerson.education || '',
        avatar_url: existingPerson.avatar_url || '',
        parent_id: existingPerson.parent_id || '',
        mother_id: existingPerson.mother_id || '',
        spouse_id: '',
      });
    }
  }, [existingPerson]);

  const availableMembers = useMemo(() => {
    return members.filter(m => {
      if (m.id === id) return false;
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = m.name.toLowerCase().includes(query);
      
      if (relationType === 'parent') {
        return matchesSearch && m.generation !== undefined && m.generation < (existingPerson?.generation || 99);
      }
      
      return matchesSearch && m.id !== id;
    });
  }, [members, id, searchQuery, relationType, existingPerson]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要相册权限才能选择头像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setValue('avatar_url', result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    
    try {
      const personData: Omit<Person, 'id' | 'created_at' | 'updated_at'> = {
        family_id: existingPerson?.family_id || 'default-family',
        name: data.name,
        gender: data.gender,
        birth_date: data.birth_date || undefined,
        death_date: data.death_date || undefined,
        bio: data.bio || undefined,
        birthplace: data.birthplace || undefined,
        occupation: data.occupation || undefined,
        education: data.education || undefined,
        avatar_url: data.avatar_url || undefined,
        is_alive: !data.death_date,
        parent_id: data.parent_id || undefined,
        mother_id: data.mother_id || undefined,
        generation: existingPerson?.generation || 1,
      };

      if (isEditing && id) {
        updateMember(id, personData);
        Alert.alert('成功', '成员信息已更新', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        const newPerson = addMember(personData as any);
        Alert.alert('成功', '新成员已添加', [
          { text: '确定', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const openRelationPicker = (type: 'parent' | 'spouse') => {
    setRelationType(type);
    setSearchQuery('');
    setShowRelationPicker(true);
  };

  const selectRelation = (memberId: string) => {
    if (relationType === 'parent') {
      setValue('parent_id', memberId);
    }
    setShowRelationPicker(false);
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return '#3B82F6';
      case 'female': return '#EC4899';
      default: return '#9CA3AF';
    }
  };

  const renderPickerItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => selectRelation(item.id)}
    >
      <View style={[styles.pickerAvatar, { backgroundColor: getGenderColor(item.gender) + '20' }]}>
        <Text style={[styles.pickerAvatarText, { color: getGenderColor(item.gender) }]}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.pickerInfo}>
        <Text style={styles.pickerName}>{item.name}</Text>
        <Text style={styles.pickerMeta}>
          {item.gender === 'male' ? '男' : item.gender === 'female' ? '女' : '未知'}
          {item.birth_date && ` · ${item.birth_date}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? '编辑成员' : '添加成员',
          headerStyle: { backgroundColor: '#FFFBF5' },
          headerTintColor: '#1F2937',
        }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 头像选择 */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
              {watch('avatar_url') ? (
                <Image source={{ uri: watch('avatar_url') }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderIcon}>📷</Text>
                  <Text style={styles.avatarPlaceholderText}>点击上传头像</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 基本信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>姓名 <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: '请输入姓名' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="请输入姓名"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>性别 <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="gender"
                rules={{ required: '请选择性别' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.genderButtons}>
                    {(['male', 'female', 'unknown'] as Gender[]).map(g => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.genderButton,
                          value === g && styles.genderButtonActive,
                          value === g && { backgroundColor: getGenderColor(g) + '20', borderColor: getGenderColor(g) },
                        ]}
                        onPress={() => onChange(g)}
                      >
                        <Text style={[
                          styles.genderButtonText,
                          value === g && { color: getGenderColor(g) }
                        ]}>
                          {g === 'male' ? '♂ 男' : g === 'female' ? '♀ 女' : '? 未知'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>出生日期</Text>
              <Controller
                control={control}
                name="birth_date"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>逝世日期</Text>
              <Controller
                control={control}
                name="death_date"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD（留空表示在世）"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          {/* 生平简介 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>生平简介</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="请输入生平简介..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          {/* 其他信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>其他信息</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>籍贯</Text>
              <Controller
                control={control}
                name="birthplace"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="请输入籍贯"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>职业</Text>
              <Controller
                control={control}
                name="occupation"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="请输入职业"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>学历</Text>
              <Controller
                control={control}
                name="education"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="请输入学历"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          {/* 亲属关联 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>亲属关联</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>父亲</Text>
              <TouchableOpacity
                style={styles.relationButton}
                onPress={() => openRelationPicker('parent')}
              >
                {watch('parent_id') ? (
                  <Text style={styles.relationButtonText}>
                    {members.find(m => m.id === watch('parent_id'))?.name || '选择父亲'}
                  </Text>
                ) : (
                  <Text style={styles.relationPlaceholder}>点击选择父亲</Text>
                )}
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>配偶</Text>
              <TouchableOpacity
                style={styles.relationButton}
                onPress={() => openRelationPicker('spouse')}
              >
                {watch('spouse_id') ? (
                  <Text style={styles.relationButtonText}>
                    {members.find(m => m.id === watch('spouse_id'))?.name || '选择配偶'}
                  </Text>
                ) : (
                  <Text style={styles.relationPlaceholder}>点击选择配偶</Text>
                )}
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
              <Text style={styles.hint}>* 配偶关系将在保存后自动建立</Text>
            </View>
          </View>

          <View style={styles.footer} />
        </ScrollView>

        {/* 提交按钮 */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '保存中...' : isEditing ? '保存修改' : '添加成员'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 亲属选择弹窗 */}
      <Modal
        visible={showRelationPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRelationPicker(false)}>
              <Text style={styles.modalCancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              选择{relationType === 'parent' ? '父亲' : '配偶'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索成员..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={availableMembers}
            keyExtractor={item => item.id}
            renderItem={renderPickerItem}
            contentContainerStyle={styles.pickerList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>没有找到符合条件的成员</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  relationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  relationButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  relationPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    height: 100,
  },
  submitContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  submitButtonText: {
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#EF4444',
  },
  modalTitle: {
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
  pickerList: {
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  pickerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  pickerMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
