import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PetalFallAnimationProps {
  visible: boolean;
  emoji?: string;
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

interface Petal {
  id: number;
  startX: number;
  startDelay: number;
  size: number;
  rotation: number;
  duration: number;
}

const PetalItem: React.FC<{ petal: Petal; emoji: string }> = ({ petal, emoji }) => {
  const translateX = useSharedValue(petal.startX);
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const swayAmount = 30 + Math.random() * 40;
    
    translateY.value = withTiming(SCREEN_HEIGHT + 100, {
      duration: petal.duration,
      easing: Easing.linear,
    });

    translateX.value = withRepeat(
      withSequence(
        withTiming(swayAmount, {
          duration: 2000 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(-swayAmount, {
          duration: 2000 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000 + Math.random() * 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [translateX, translateY, rotation, petal.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.petal,
        { fontSize: petal.size },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

const PetalFallAnimation: React.FC<PetalFallAnimationProps> = ({
  visible,
  emoji = '🌸',
  count = 20,
  duration = 8000,
  onComplete,
}) => {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: Math.random() * SCREEN_WIDTH,
      startDelay: Math.random() * 2000,
      size: 20 + Math.random() * 15,
      rotation: Math.random() * 360,
      duration: duration + Math.random() * 2000,
    }));
  }, [count, duration]);

  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration + 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {petals.map((petal) => (
        <PetalItem key={petal.id} petal={petal} emoji={emoji} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  petal: {
    position: 'absolute',
  },
});

export default PetalFallAnimation;
