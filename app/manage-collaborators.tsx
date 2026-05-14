/**
 * 邀请码管理页面（管理员）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useCollaborationStore } from '@/store/useCollaborationStore';
import { 
  createInviteCode, 
  getInviteCodes, 
  revokeInviteCode,
  getFamilyMembers,
  updateMemberRole,
  removeMember,
} from '@/services/collaborationService';
import InvitePromptCard from '@/components/collaboration/InvitePromptCard';
import type { InviteCode, MemberRole } from '@/services/collaborationService';
import type { FamilyMembers } from '@/store/useCollaborationStore';

const ManageCollaboratorsPage: React.FC = () => {
  const { currentUser, currentFamilyId } = useCollaborationStore();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [members, setMembers] = useState<FamilyMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentFamilyId]);

  const loadData = async () => {
    if (!currentFamilyId) return;
    
    setLoading(true);
    try {
      const [codes, memberList] = await Promise.all([
        getInviteCodes(currentFamilyId),
        getFamilyMembers(currentFamilyId),
      ]);
      setInviteCodes(codes);
      setMembers(memberList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!currentFamilyId || !currentUser) return;
    
    setCreating(true);
    try {
      const code = await createInviteCode(currentFamilyId, currentUser.id);
      if (code) {
        setNewCode(code.code);
        setInviteCodes([code, ...inviteCodes]);
      }
    } catch (error) {
      Alert.alert('错误', '创建邀请码失败');
    } finally {
      setCreating(false);
    }
  };

  const handleShareCode = async (code: string) => {
    try {
      await Share.share({
        message: `加入我们的家族！邀请码：${code}`,
      });
    } catch (error) {
      // Fallback to clipboard
      Clipboard.setString(code);
      Alert.alert('已复制', '邀请码已复制到剪贴板');
    }
  };

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('已复制', '邀请码已复制到剪贴板');
  };

  const handleRevokeCode = async (code: string) => {
    Alert.alert(
      '确认撤销',
      '确定要撤销此邀请码吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '撤销',
          style: 'destructive',
          onPress: async () => {
            const success = await revokeInviteCode(code);
            if (success) {
              setInviteCodes(inviteCodes.filter(c => c.code !== code));
            }
          },
        },
      ]
    );
  };

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    if (!currentFamilyId) return;
    
    const result = await updateMemberRole(currentFamilyId, memberId, newRole, currentUser?.id || '');
    if (result.success) {
      setMembers(members.map(m => 
        m.user_id === memberId ? { ...m, role: newRole } : m
      ));
    } else {
      Alert.alert('错误', result.error || '修改失败');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentFamilyId) return;
    
    Alert.alert(
      '确认移除',
      `确定要移除 ${memberName} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: async () => {
            const result = await removeMember(currentFamilyId, memberId, currentUser?.id || '');
            if (result.success) {
              setMembers(members.filter(m => m.user_id !== memberId));
            } else {
              Alert.alert('错误', result.error || '移除失败');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeStyle = (role: MemberRole) => {
    switch (role) {
      case 'owner': return styles.roleOwner;
      case 'admin': return styles.roleAdmin;
      default: return styles.roleMember;
    }
  };

  const getRoleText = (role: MemberRole) => {
    switch (role) {
      case 'owner': return '所有者';
      case 'admin': return '管理员';
      default: return '成员';
    }
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return '已过期';
    if (hours < 1) return '即将过期';
    if (hours < 24) return `${hours}小时后过期`;
    return `${Math.floor(hours / 24)}天后过期`;
  };

  const isCodeExpired = (item: InviteCode) => new Date(item.expires_at) < new Date();
  const isCodeMaxed = (item: InviteCode) => item.max_uses !== null && item.used_count >= item.max_uses;

  const renderInviteCode = ({ item }: { item: InviteCode }) => {
    const isExpired = new Date(item.expires_at) < new Date();
    const isMaxed = item.max_uses !== null && item.used_count >= item.max_uses;
    const isActive = !isExpired && !isMaxed;

    return (
      <View style={[styles.codeCard, !isActive && styles.codeCardInactive]}>
        <View style={styles.codeInfo}>
          <Text style={[styles.codeText, !isActive && styles.codeTextInactive]}>
            {item.code}
          </Text>
          <Text style={styles.codeExpiry}>
            {isActive ? formatExpiry(item.expires_at) : isExpired ? '已过期' : '已达上限'}
          </Text>
        </View>
        
        {isActive && (
          <View style={styles.codeActions}>
            <TouchableOpacity 
              style={styles.codeButton}
              onPress={() => handleShareCode(item.code)}
            >
              <Text style={styles.codeButtonText}>分享</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.codeButton}
              onPress={() => handleCopyCode(item.code)}
            >
              <Text style={styles.codeButtonText}>复制</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.codeButton, styles.codeButtonDanger]}
              onPress={() => handleRevokeCode(item.code)}
            >
              <Text style={[styles.codeButtonText, styles.codeButtonTextDanger]}>撤销</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMember = ({ item }: { item: FamilyMembers }) => {
    const isCurrentUser = item.user_id === currentUser?.id;
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {item.display_name.charAt(0)}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>
              {item.display_name}
              {isCurrentUser && '（我）'}
            </Text>
            <View style={[styles.roleBadge, getRoleBadgeStyle(item.role)]}>
              <Text style={styles.roleBadgeText}>{getRoleText(item.role)}</Text>
            </View>
          </View>
        </View>
        
        {!isCurrentUser && item.role !== 'owner' && (
          <View style={styles.memberActions}>
            {item.role === 'member' && (
              <TouchableOpacity
                style={styles.memberButton}
                onPress={() => handleUpdateRole(item.user_id, 'admin')}
              >
                <Text style={styles.memberButtonText}>设为管理员</Text>
              </TouchableOpacity>
            )}
            {item.role === 'admin' && (
              <TouchableOpacity
                style={styles.memberButton}
                onPress={() => handleUpdateRole(item.user_id, 'member')}
              >
                <Text style={styles.memberButtonText}>取消管理员</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.memberButton, styles.memberButtonDanger]}
              onPress={() => handleRemoveMember(item.user_id, item.display_name)}
            >
              <Text style={[styles.memberButtonText, styles.memberButtonTextDanger]}>
                移除
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 邀请码部分 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>邀请码管理</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateInviteCode}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>+ 生成邀请码</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {inviteCodes.length > 0 ? (
          <FlatList
            data={inviteCodes}
            renderItem={renderInviteCode}
            keyExtractor={item => item.code}
            scrollEnabled={false}
          />
        ) : (
          <InvitePromptCard
            inviteCode={inviteCodes[0]?.code}
            pendingInvitations={inviteCodes.filter(c => !isCodeExpired(c) && !isCodeMaxed(c)).length}
            onShareCode={handleShareCode}
            onCopyCode={handleCopyCode}
            onRegenerateCode={handleCreateInviteCode}
          />
        )}
      </View>

      {/* 成员列表部分 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>家族成员（{members.length}）</Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.user_id}
          scrollEnabled={false}
        />
      </View>

      {/* 新邀请码弹窗 */}
      <Modal
        visible={!!newCode}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>邀请码创建成功</Text>
            <Text style={styles.modalCode}>{newCode}</Text>
            <Text style={styles.modalHint}>
              复制邀请码分享给好友，好友可在"加入家族"页面输入此码加入
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => newCode && handleShareCode(newCode)}
              >
                <Text style={styles.modalButtonText}>分享</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => {
                  newCode && handleCopyCode(newCode);
                  setNewCode(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextOutline]}>
                  复制
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  codeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeCardInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  codeInfo: {
    marginBottom: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 8,
    marginBottom: 4,
  },
  codeTextInactive: {
    color: '#9CA3AF',
  },
  codeExpiry: {
    fontSize: 12,
    color: '#6B7280',
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeButtonDanger: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  codeButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  codeButtonTextDanger: {
    color: '#EF4444',
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleOwner: {
    backgroundColor: '#FEF3C7',
  },
  roleAdmin: {
    backgroundColor: '#DBEAFE',
  },
  roleMember: {
    backgroundColor: '#F3F4F6',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  memberButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberButtonDanger: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  memberButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  memberButtonTextDanger: {
    color: '#EF4444',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalCode: {
    fontSize: 36,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 8,
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonTextOutline: {
    color: '#374151',
  },
});

export default ManageCollaboratorsPage;
