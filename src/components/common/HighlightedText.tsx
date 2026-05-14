import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { HighlightedTextPart } from '../../types/familyTree';

interface HighlightedTextProps {
  parts: HighlightedTextPart[];
  style?: any;
  highlightStyle?: any;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  parts,
  style,
  highlightStyle,
}) => {
  return (
    <View style={styles.container}>
      {parts.map((part, index) => (
        <Text
          key={index}
          style={[
            style,
            part.isHighlighted && (highlightStyle || styles.highlighted),
          ]}
        >
          {part.text}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  highlighted: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontWeight: '600',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
});
