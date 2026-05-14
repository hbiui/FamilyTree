import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface InvitePromptCardProps {
  onInvite: () => void;
}

const InvitePromptCard: React.FC<InvitePromptCardProps> = ({ onInvite }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>邀请家人共同管理</Text>
      <Text style={styles.description}>邀请其他家庭成员一起编辑家族树</Text>
      <TouchableOpacity style={styles.button} onPress={onInvite}>
        <Text style={styles.buttonText}>发送邀请</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InvitePromptCard;