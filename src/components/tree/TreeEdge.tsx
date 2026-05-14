import React from 'react';
import { Path } from 'react-native-svg';

interface TreeEdgeProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color?: string;
  strokeWidth?: number;
}

const TreeEdge: React.FC<TreeEdgeProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  color = '#D4A574',
  strokeWidth = 2,
}) => {
  const midY = (fromY + toY) / 2;

  const pathData = `
    M ${fromX} ${fromY}
    L ${fromX} ${midY}
    L ${toX} ${midY}
    L ${toX} ${toY}
  `;

  return (
    <Path
      d={pathData}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

export default React.memo(TreeEdge);
