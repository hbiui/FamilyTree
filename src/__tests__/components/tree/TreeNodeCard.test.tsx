import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TreeNodeCard from '@/components/tree/TreeNodeCard';
import type { TreeNode } from '@/types/familyTree';

jest.mock('@/components/common/OptimizedAvatar', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    __esModule: true,
    OptimizedAvatar: jest.fn(({ name, size }) => (
      React.createElement(View, { testID: 'avatar' },
        React.createElement(Text, { testID: 'avatar-text' }, name?.charAt(0))
      )
    )),
  };
});

const createMockNode = (
  id: string,
  name: string,
  gender: 'male' | 'female',
  birthDate?: string,
  deathDate?: string
): TreeNode => ({
  id,
  name,
  gender,
  birthDate,
  deathDate,
  children: [],
});

describe('TreeNodeCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render node card with name', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小明')).toBeTruthy();
    });

    it('should render birth year for living person', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('1990')).toBeTruthy();
    });

    it('should render life status badge for living person', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('在')).toBeTruthy();
    });

    it('should render life status badge for deceased person', () => {
      const node = createMockNode('1', '王老爷子', 'male', '1930-01-01', '2020-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('故')).toBeTruthy();
    });

    it('should render death year for deceased person', () => {
      const node = createMockNode('1', '王老爷子', 'male', '1930-01-01', '2020-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('1930 - 2020')).toBeTruthy();
    });

    it('should render avatar', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByTestId } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByTestId('avatar')).toBeTruthy();
      expect(getByTestId('avatar-text')).toHaveTextContent('王');
    });

    it('should render with custom width and height', () => {
      const node = createMockNode('1', '王小明', 'male');

      const { getByTestId } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={150}
          nodeHeight={180}
        />
      );

      expect(getByTestId('node-width')).toHaveTextContent('150');
      expect(getByTestId('node-height')).toHaveTextContent('180');
    });

    it('should render female gender correctly', () => {
      const node = createMockNode('1', '王小红', 'female', '1995-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小红')).toBeTruthy();
      expect(getByText('1995')).toBeTruthy();
    });

    it('should handle node without birth date', () => {
      const node = createMockNode('1', '王小明', 'male');

      const { getByText, queryByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小明')).toBeTruthy();
      expect(queryByText(/\d{4}/)).toBeNull();
    });
  });

  describe('Spouse Rendering', () => {
    it('should render spouse card when spouse is provided', () => {
      const node = createMockNode('1', '王建国', 'male', '1960-01-01');
      const spouse = createMockNode('2', '李秀英', 'female', '1962-01-01');

      const { getByText, getAllByTestId } = render(
        <TreeNodeCard
          node={node}
          spouse={spouse}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王建国')).toBeTruthy();
      expect(getByText('李秀英')).toBeTruthy();
      expect(getAllByTestId('avatar')).toHaveLength(2);
    });

    it('should render heart connector between spouses', () => {
      const node = createMockNode('1', '王建国', 'male', '1960-01-01');
      const spouse = createMockNode('2', '李秀英', 'female', '1962-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          spouse={spouse}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('♥')).toBeTruthy();
    });

    it('should not render spouse section when spouse is undefined', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText, queryByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小明')).toBeTruthy();
      expect(queryByText('♥')).toBeNull();
    });

    it('should not render spouse when spouse is null', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText, queryByText } = render(
        <TreeNodeCard
          node={node}
          spouse={null}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小明')).toBeTruthy();
      expect(queryByText('♥')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      fireEvent.press(getByText('王小明'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress for each spouse card press', () => {
      const node = createMockNode('1', '王建国', 'male', '1960-01-01');
      const spouse = createMockNode('2', '李秀英', 'female', '1962-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          spouse={spouse}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      fireEvent.press(getByText('王建国'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('李秀英'));
      expect(mockOnPress).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple rapid presses', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      fireEvent.press(getByText('王小明'));
      fireEvent.press(getByText('王小明'));
      fireEvent.press(getByText('王小明'));

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should apply correct styles for male gender', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { getByTestId } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      const card = getByTestId('tree-node-card');
      expect(card).toBeTruthy();
    });

    it('should apply correct styles for female gender', () => {
      const node = createMockNode('1', '王小红', 'female', '1995-01-01');

      const { getByTestId } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      const card = getByTestId('tree-node-card');
      expect(card).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long name', () => {
      const node = createMockNode('1', '王建国的小明子子孙孙', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王建国的小明子子孙孙')).toBeTruthy();
    });

    it('should handle name with special characters', () => {
      const node = createMockNode('1', '王小明(小明)', 'male', '1990-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('王小明(小明)')).toBeTruthy();
    });

    it('should handle century-old person', () => {
      const node = createMockNode('1', '王老爷子', 'male', '1900-01-01', '2000-01-01');

      const { getByText } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(getByText('1900 - 2000')).toBeTruthy();
      expect(getByText('故')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for male node', () => {
      const node = createMockNode('1', '王小明', 'male', '1990-01-01');

      const { toJSON } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for female node', () => {
      const node = createMockNode('1', '王小红', 'female', '1995-01-01');

      const { toJSON } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for deceased node', () => {
      const node = createMockNode('1', '王老爷子', 'male', '1930-01-01', '2020-01-01');

      const { toJSON } = render(
        <TreeNodeCard
          node={node}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for node with spouse', () => {
      const node = createMockNode('1', '王建国', 'male', '1960-01-01');
      const spouse = createMockNode('2', '李秀英', 'female', '1962-01-01');

      const { toJSON } = render(
        <TreeNodeCard
          node={node}
          spouse={spouse}
          onPress={mockOnPress}
          nodeWidth={100}
          nodeHeight={120}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});