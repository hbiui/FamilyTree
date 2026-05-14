import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface MockPersonNodeProps {
  name: string;
  gender: 'male' | 'female';
  onPress?: () => void;
  onLongPress?: () => void;
  isFirst?: boolean;
}

export function MockPersonNode({
  name,
  gender,
  onPress,
  onLongPress,
  isFirst = false,
}: MockPersonNodeProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const handlePress = useCallback(() => {
    onPress?.();
    Alert.alert('查看详情', `您点击了 ${name} 的卡片`);
  }, [onPress, name]);

  const handleLongPress = useCallback(() => {
    setIsLongPressed(true);
    onLongPress?.();
    Alert.alert('添加成员', `长按了 ${name}，可以添加子女或配偶`);
  }, [onLongPress, name]);

  const avatarColor = gender === 'male' ? '#3B82F6' : gender === 'female' ? '#EC4899' : '#9CA3AF';

  return (
    <TouchableOpacity
      style={[
        styles.node,
        isFirst && styles.firstNode,
        isPressed && styles.pressed,
        isLongPressed && styles.longPressed,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={1}
      delayLongPress={500}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.hintContainer}>
        {isFirst && (
          <>
            <Text style={styles.tapHint}>点击查看详情</Text>
            <Text style={styles.longPressHint}>长按添加成员</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function MockFamilyTreeDisplay() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MockPersonNode
          name="张建国"
          gender="male"
          isFirst={true}
        />
      </View>
      
      <View style={styles.connector} />
      
      <View style={styles.row}>
        <MockPersonNode
          name="张伟"
          gender="male"
        />
        <MockPersonNode
          name="张敏"
          gender="female"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 20,
  },
  node: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  firstNode: {
    borderColor: '#EF4444',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#FEF3C7',
  },
  longPressed: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  hintContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginBottom: 4,
  },
  longPressHint: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  connector: {
    alignSelf: 'center',
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});
