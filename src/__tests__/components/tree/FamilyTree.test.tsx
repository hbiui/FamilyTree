jest.mock('react-native-reanimated', () => {
  const View = () => null;
  return {
    __esModule: true,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    default: { View },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const View = () => null;
  return {
    __esModule: true,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
      Pinch: () => ({
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
      Simultaneous: jest.fn(),
    },
    GestureHandlerRootView: View,
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    Svg: View,
    Path: View,
    G: View,
    Line: View,
    Rect: View,
    default: { Svg: View },
  };
});

jest.mock('@/components/tree/TreeNodeCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ node }: any) => (
      <View testID={`node-card-${node.id}`}>
        <Text>{node.name}</Text>
      </View>
    ),
  };
});

jest.mock('@/components/tree/TreeEdge', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="tree-edge" />,
  };
});

import React from 'react';
import TestRenderer from 'react-test-renderer';
import FamilyTree from '@/components/tree/FamilyTree';
import type { TreeNode } from '@/types/familyTree';

const createMockTreeNode = (id: string, name: string, gender: 'male' | 'female'): TreeNode => ({
  id,
  name,
  gender,
  birthDate: '1990-01-01',
  children: [],
});

describe('FamilyTree Component', () => {
  const mockOnMemberPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty state when data is null', () => {
      const testRenderer = TestRenderer.create(
        <FamilyTree data={null} onMemberPress={mockOnMemberPress} />
      );
      
      const json = testRenderer.toJSON();
      expect(json).toBeTruthy();
    });

    it('should render tree with data', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('root', '王建国', 'male'),
        children: [
          {
            ...createMockTreeNode('child1', '王小明', 'male'),
            children: [],
          },
        ],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.root.findByProps({ testID: 'node-card-root' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-child1' })).toBeTruthy();
    });

    it('should render multi-level tree', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('level0', '第一代', 'male'),
        children: [
          {
            ...createMockTreeNode('level1', '第二代', 'male'),
            children: [
              {
                ...createMockTreeNode('level2', '第三代', 'male'),
                children: [],
              },
            ],
          },
        ],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.root.findByProps({ testID: 'node-card-level0' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-level1' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-level2' })).toBeTruthy();
    });

    it('should render edges between nodes', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('root', '王建国', 'male'),
        children: [
          {
            ...createMockTreeNode('child', '王小明', 'male'),
            children: [],
          },
        ],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      const edges = testRenderer.root.findAllByProps({ testID: 'tree-edge' });
      expect(edges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Data Validation', () => {
    it('should handle node with spouse', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('root', '王建国', 'male'),
        spouse: {
          ...createMockTreeNode('spouse', '李秀英', 'female'),
          children: [],
        },
        children: [],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.root.findByProps({ testID: 'node-card-root' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-spouse' })).toBeTruthy();
    });

    it('should handle complex family structure', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('grandfather', '王老爷子', 'male'),
        spouse: {
          ...createMockTreeNode('grandmother', '王老太太', 'female'),
          children: [],
        },
        children: [
          {
            ...createMockTreeNode('father', '王建国', 'male'),
            spouse: {
              ...createMockTreeNode('mother', '李秀英', 'female'),
              children: [],
            },
            children: [
              {
                ...createMockTreeNode('son', '王小明', 'male'),
                children: [],
              },
            ],
          },
        ],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.root.findByProps({ testID: 'node-card-grandfather' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-grandmother' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-father' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-mother' })).toBeTruthy();
      expect(testRenderer.root.findByProps({ testID: 'node-card-son' })).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for single node', () => {
      const mockData = createMockTreeNode('root', '王建国', 'male');

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for family tree', () => {
      const mockData: TreeNode = {
        ...createMockTreeNode('root', '王建国', 'male'),
        spouse: {
          ...createMockTreeNode('spouse', '李秀英', 'female'),
          children: [],
        },
        children: [
          {
            ...createMockTreeNode('child', '王小明', 'male'),
            children: [],
          },
        ],
      };

      const testRenderer = TestRenderer.create(
        <FamilyTree data={mockData} onMemberPress={mockOnMemberPress} />
      );

      expect(testRenderer.toJSON()).toMatchSnapshot();
    });
  });
});