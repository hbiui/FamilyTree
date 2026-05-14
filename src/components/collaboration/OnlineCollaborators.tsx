/**
 * 在线协作者显示组件
 * 
 * 功能说明：
 * 1. 显示当前在线的协作者头像
 * 2. 绿色圆点表示在线
 * 3. 悬停显示用户名称
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { CollaboratorInfo } from '../../store/useCollaborationStore';

interface OnlineCollaboratorsProps {
  collaborators: CollaboratorInfo[];
  maxDisplay?: number;
  onCollaboratorPress?: (userId: string) => void;
}

const OnlineCollaborators: React.FC<OnlineCollaboratorsProps> = ({
  collaborators,
  maxDisplay = 5,
  onCollaboratorPress,
}) => {
  const onlineCollaborators = collaborators.filter(c => c.isOnline);
  const displayCollaborators = onlineCollaborators.slice(0, maxDisplay);
  const remainingCount = onlineCollaborators.length - maxDisplay;

  if (onlineCollaborators.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarStack}>
        {displayCollaborators.map((collaborator, index) => (
          <TouchableOpacity
            key={collaborator.user_id}
            style={[
              styles.avatar,
              { marginLeft: index > 0 ? -10 : 0 },
              { zIndex: maxDisplay - index },
            ]}
            onPress={() => onCollaboratorPress?.(collaborator.user_id)}
            activeOpacity={0.8}
          >
            {collaborator.avatar_url ? (
              <Text style={styles.avatarImage}>{collaborator.user_name.charAt(0)}</Text>
            ) : (
              <Text style={styles.avatarText}>
                {collaborator.user_name.charAt(0)}
              </Text>
            )}
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        ))}
        
        {remainingCount > 0 && (
          <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -10 }]}>
            <Text style={styles.moreText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.onlineText}>
          {onlineCollaborators.length} 人在线编辑
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarImage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreAvatar: {
    backgroundColor: '#6B7280',
  },
  moreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    marginLeft: 8,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});

export default React.memo(OnlineCollaborators);
