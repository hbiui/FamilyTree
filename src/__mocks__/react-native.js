jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return RN;
}, { virtual: true });

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
  const { View } = jest.requireActual('react-native');
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
  const { View, Text } = jest.requireActual('react-native');
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
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => <View testID="tree-edge" />,
  };
});