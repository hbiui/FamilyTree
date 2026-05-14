/**
 * 邀请码输入和家族加入页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCollaborationStore } from '@/store/useCollaborationStore';
import { validateInviteCode, joinFamilyByCode } from '@/services/collaborationService';

const JoinFamilyPage: React.FC = () => {
  const router = useRouter();
  const { currentUser, initializeCollaboration, setMembers } = useCollaborationStore();
  
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);

  const handleCodeChange = async (code: string) => {
    const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInviteCode(formattedCode);
    
    if (formattedCode.length === 6) {
      setValidating(true);
      try {
        const result = await validateInviteCode(formattedCode);
        if (result.valid && result.invite) {
          setFamilyName(result.invite.family_name);
        } else {
          setFamilyName(null);
        }
      } catch (error) {
        setFamilyName(null);
      } finally {
        setValidating(false);
      }
    } else {
      setFamilyName(null);
    }
  };

  const handleJoin = async () => {
    if (!currentUser) {
      Alert.alert('错误', '请先登录');
      return;
    }

    if (inviteCode.length !== 6) {
      Alert.alert('错误', '请输入6位邀请码');
      return;
    }

    setLoading(true);
    
    try {
      const result = await joinFamilyByCode(
        inviteCode,
        currentUser.id,
        currentUser.name
      );

      if (result.success) {
        Alert.alert(
          '加入成功', 
          `您已成功加入 ${familyName || '该家族'}！`,
          [
            {
              text: '开始编辑',
              onPress: () => {
                // 初始化协作
                if (result.member) {
                  setMembers([result.member]);
                  initializeCollaboration(result.member.family_id);
                }
                router.replace('/(tabs)/tree');
              },
            },
          ]
        );
      } else {
        Alert.alert('加入失败', result.error || '未知错误');
      }
    } catch (error) {
      Alert.alert('错误', '加入家族失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>加入家族</Text>
          <Text style={styles.subtitle}>
            输入家族邀请码，与亲友共同编辑族谱
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>邀请码</Text>
            <TextInput
              style={[
                styles.input,
                inviteCode.length === 6 && familyName && styles.inputSuccess,
              ]}
              value={inviteCode}
              onChangeText={handleCodeChange}
              placeholder="请输入6位邀请码"
              placeholderTextColor="#9CA3AF"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              textAlign="center"
              letterSpacing={8}
            />
            
            {validating && (
              <ActivityIndicator 
                size="small" 
                color="#EF4444" 
                style={styles.loader}
              />
            )}
          </View>

          {familyName && (
            <View style={styles.familyInfo}>
              <Text style={styles.familyLabel}>您将加入：</Text>
              <Text style={styles.familyName}>{familyName}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.joinButton,
              (!inviteCode || loading) && styles.joinButtonDisabled,
            ]}
            onPress={handleJoin}
            disabled={!inviteCode || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>加入家族</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>小贴士</Text>
          <Text style={styles.tipsText}>
            • 邀请码由家族管理员生成{'\n'}
            • 有效期为24小时{'\n'}
            • 加入后可共同编辑家族树
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 12,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    color: '#1F2937',
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  loader: {
    marginTop: 8,
    alignSelf: 'center',
  },
  familyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  familyLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  familyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  joinButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tips: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 22,
  },
});

export default JoinFamilyPage;
