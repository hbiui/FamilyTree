import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { TreeNode } from '../../types/familyTree';
import TreeNodeCard from './TreeNodeCard';
import TreeEdge from './TreeEdge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FamilyTreeProps {
  data: TreeNode | null;
  onMemberPress?: (memberId: string) => void;
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalGap?: number;
  verticalGap?: number;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({
  data,
  onMemberPress = () => {},
  nodeWidth = 100,
  nodeHeight = 120,
  horizontalGap = 30,
  verticalGap = 80,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [containerSize, setContainerSize] = useState({ width: SCREEN_WIDTH, height: 600 });

  const layoutInfo = useMemo(() => {
    if (!data) return { nodes: [], edges: [], totalWidth: 0, totalHeight: 0 };

    const nodes: {
      id: string;
      x: number;
      y: number;
      node: TreeNode;
      spouse?: TreeNode;
    }[] = [];
    const edges: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];

    function layoutNode(
      node: TreeNode,
      depth: number,
      leftOffset: number,
      parentX?: number,
      parentY?: number
    ): number {
      let subtreeWidth = 0;
      const centerX = leftOffset;

      nodes.push({
        id: node.id,
        x: centerX,
        y: depth * (nodeHeight + verticalGap),
        node,
        spouse: node.spouse || undefined,
      });

      if (parentX !== undefined && parentY !== undefined) {
        edges.push({
          from: { x: parentX, y: parentY },
          to: { x: centerX, y: depth * (nodeHeight + verticalGap) },
        });
      }

      const children = node.children || [];
      let childOffset = leftOffset;

      for (const child of children) {
        const childWidth = layoutNode(
          child,
          depth + 1,
          childOffset,
          centerX,
          depth * (nodeHeight + verticalGap) + nodeHeight
        );
        childOffset += childWidth + horizontalGap;
        subtreeWidth += childWidth + horizontalGap;
      }

      subtreeWidth = Math.max(subtreeWidth - horizontalGap, nodeWidth + (node.spouse ? nodeWidth + 10 : 0));

      return subtreeWidth;
    }

    layoutNode(data, 0, 100);

    const totalWidth = Math.max(
      ...nodes.map(n => n.x + nodeWidth + (n.spouse ? nodeWidth + 10 : 0)),
      containerSize.width
    );
    const totalHeight = Math.max(
      ...nodes.map(n => n.y + nodeHeight),
      containerSize.height
    );

    return { nodes, edges, totalWidth, totalHeight };
  }, [data, nodeWidth, nodeHeight, horizontalGap, verticalGap, containerSize]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 0.3) {
        scale.value = withSpring(0.3);
        savedScale.value = 0.3;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  if (!data) {
    return (
      <View style={styles.emptyContainer}>
        <SvgText>暂无家族数据</SvgText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg
            width={layoutInfo.totalWidth + 200}
            height={layoutInfo.totalHeight + 200}
            onLayout={handleLayout}
          >
            {layoutInfo.edges.map((edge, index) => (
              <TreeEdge
                key={`edge-${index}`}
                fromX={edge.from.x + nodeWidth / 2 + 100}
                fromY={edge.from.y + nodeHeight + 100}
                toX={edge.to.x + nodeWidth / 2 + 100}
                toY={edge.to.y + 100}
              />
            ))}
          </Svg>

          <View style={[styles.nodesContainer, {
            width: layoutInfo.totalWidth + 200,
            height: layoutInfo.totalHeight + 200,
            position: 'absolute',
            top: 0,
            left: 0,
          }]}>
            {layoutInfo.nodes.map((nodeInfo) => (
              <View
                key={nodeInfo.id}
                style={[
                  styles.nodeWrapper,
                  {
                    left: nodeInfo.x + 50,
                    top: nodeInfo.y + 50,
                  },
                ]}
              >
                <TreeNodeCard
                  node={nodeInfo.node}
                  spouse={nodeInfo.spouse}
                  onPress={() => onMemberPress(nodeInfo.node.id)}
                  nodeWidth={nodeWidth}
                  nodeHeight={nodeHeight}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  nodesContainer: {
    position: 'absolute',
  },
  nodeWrapper: {
    position: 'absolute',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
});

export default FamilyTree;
