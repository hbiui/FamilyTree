import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BloodLineAnimationProps {
  visible: boolean;
  points: { x: number; y: number }[];
  color?: string;
  width?: number;
  onComplete?: () => void;
}

const BloodLineAnimation: React.FC<BloodLineAnimationProps> = ({
  visible,
  points,
  color,
  width = 3,
  onComplete,
}) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  const pathData = React.useMemo(() => {
    if (points.length < 2) return '';
    
    const d = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      
      if (index === 1) {
        return `${acc} L ${point.x} ${point.y}`;
      }
      
      const prev = points[index - 1];
      const curr = point;
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      
      return `${acc} Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }, '');
    
    return d;
  }, [points]);

  const pathLength = React.useMemo(() => {
    if (points.length < 2) return 0;
    
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, [points]);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    }
  }, [visible, onComplete, progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = pathLength * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  if (!visible || points.length < 2) return null;

  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));

  const svgWidth = maxX - minX + 50;
  const svgHeight = maxY - minY + 50;
  const offsetX = minX - 25;
  const offsetY = minY - 25;

  const adjustedPoints = points.map(p => ({
    x: p.x - offsetX,
    y: p.y - offsetY,
  }));

  const adjustedPath = adjustedPoints.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    
    if (index === 1) {
      return `${acc} L ${point.x} ${point.y}`;
    }
    
    const prev = adjustedPoints[index - 1];
    const midX = (prev.x + point.x) / 2;
    const midY = (prev.y + point.y) / 2;
    
    return `${acc} Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }, '');

  return (
    <View style={[styles.container, { width: svgWidth, height: svgHeight }]} pointerEvents="none">
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <LinearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary[300]} stopOpacity="0.3" />
            <Stop offset="30%" stopColor={color || colors.primary[500]} stopOpacity="1" />
            <Stop offset="50%" stopColor={color || colors.primary[500]} stopOpacity="1" />
            <Stop offset="70%" stopColor={color || colors.primary[500]} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary[300]} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        
        <Path
          d={adjustedPath}
          stroke={colors.primary[200]}
          strokeWidth={width + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.3}
        />
        
        <AnimatedPath
          d={adjustedPath}
          stroke="url(#bloodGradient)"
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={pathLength}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
});

export default BloodLineAnimation;
