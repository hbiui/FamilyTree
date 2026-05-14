import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface NodePopupAnimationProps {
  visible: boolean;
  parentX?: number;
  parentY?: number;
  childX: number;
  childY: number;
  onComplete?: () => void;
  duration?: number;
}

interface AnimatedNodeProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
  children: React.ReactNode;
}

const AnimatedNode: React.FC<AnimatedNodeProps> = ({
  startX,
  startY,
  endX,
  endY,
  delay = 0,
  children,
}) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 8,
        stiffness: 100,
        mass: 0.8,
        velocity: 10,
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );

    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const steps = Math.max(10, Math.floor(distance / 20));

    const springConfig = {
      damping: 12,
      stiffness: 150,
      mass: 1,
    };

    translateX.value = withDelay(
      delay,
      withSpring(endX, springConfig)
    );

    translateY.value = withDelay(
      delay,
      withSpring(endY, springConfig)
    );
  }, [translateX, translateY, scale, opacity, startX, startY, endX, endY, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.nodeContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const NodePopupAnimation: React.FC<NodePopupAnimationProps> = ({
  visible,
  parentX = 0,
  parentY = 0,
  childX,
  childY,
  onComplete,
  duration = 1000,
}) => {
  const { colors } = useTheme();
  const lineProgress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      lineProgress.value = 0;
      lineProgress.value = withTiming(1, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    }
  }, [visible, lineProgress, onComplete]);

  if (!visible) return null;

  const dx = childX - parentX;
  const dy = childY - parentY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const lineEndX = parentX + dx * 0.4;
  const lineEndY = parentY + dy * 0.4;

  return (
    <View style={styles.container} pointerEvents="none">
      <AnimatedNode
        startX={parentX}
        startY={parentY}
        endX={childX}
        endY={childY}
        delay={400}
      >
        <View style={styles.childNode}>
          <View style={[styles.nodeCircle, { backgroundColor: colors.primary[500] }]}>
            <View style={[styles.nodeInner, { backgroundColor: colors.primary[600] }]} />
          </View>
        </View>
      </AnimatedNode>

      <View style={[styles.lineContainer, { left: parentX, top: parentY }]}>
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: colors.primary[400],
              width: distance * lineProgress.value,
              transform: [
                { rotate: `${angle}rad` },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.lineDot,
            {
              backgroundColor: colors.primary[500],
              left: (distance * lineProgress.value) - 4,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  nodeContainer: {
    position: 'absolute',
  },
  childNode: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nodeInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  lineContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    transformOrigin: 'left center',
  },
  line: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  lineDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -2.5,
  },
});

export default NodePopupAnimation;
