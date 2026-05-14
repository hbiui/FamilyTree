import React from 'react';
import { View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

interface OptimizedAvatarProps {
  uri?: string;
  name: string;
  size?: number;
  gender: 'male' | 'female' | 'unknown';
  style?: ViewStyle;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  uri,
  name,
  size = 48,
  gender,
  style,
}) => {
  const getGenderColor = (g: string): string => {
    switch (g) {
      case 'male':
        return '#3B82F6';
      case 'female':
        return '#EC4899';
      default:
        return '#9CA3AF';
    }
  };

  const backgroundColor = getGenderColor(gender);
  const initial = name.charAt(0);

  if (!uri) {
    return (
      <View
        style={[
        styles.avatar, { width: size, height: size, backgroundColor, borderRadius: size / 2 },
        style,
      ]}
      >
        <View style={styles.textContainer}>
          <View style={[styles.initialText, { fontSize: size * 0.42 }]}>
            {initial}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar, { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={[styles.image]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0ay%2W' }}
        priority="low"
      />
      <View style={[styles.fallbackOverlay, { backgroundColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});
