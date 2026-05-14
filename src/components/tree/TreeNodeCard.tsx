import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TreeNode, Gender } from '../../types/familyTree';
import { OptimizedAvatar } from '../../components/common/OptimizedAvatar';

interface TreeNodeCardProps {
  node: TreeNode;
  spouse?: TreeNode;
  onPress: () => void;
  nodeWidth: number;
  nodeHeight: number;
}

const getGenderColor = (gender: Gender): string => {
  switch (gender) {
    case 'male':
      return '#3B82F6';
    case 'female':
      return '#EC4899';
    default:
      return '#9CA3AF';
  }
};

const getInitials = (name: string): string => {
  return name.charAt(0);
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}`;
};

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({
  node,
  spouse,
  onPress,
  nodeWidth,
  nodeHeight,
}) => {
  const primaryColor = getGenderColor(node.gender);
  const cardWidth = spouse ? nodeWidth * 2 + 10 : nodeWidth;

  const renderPersonCard = (person: TreeNode, isSpouse: boolean = false) => {
    const birthYear = formatDate(person.birthDate);
    const deathYear = person.deathDate ? ` - ${formatDate(person.deathDate)}` : '';
    const lifeStatus = person.deathDate ? '故' : '在';

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.card,
          {
            width: nodeWidth,
            height: nodeHeight,
            borderColor: getGenderColor(person.gender),
          },
        ]}
      >
        <OptimizedAvatar
          uri={person.avatarUrl}
          name={person.name}
          gender={person.gender as any}
          size={50}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          <Text style={styles.dates}>
            {birthYear}{deathYear}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getGenderColor(person.gender) + '20' }]}>
            <Text style={[styles.statusText, { color: getGenderColor(person.gender) }]}>{lifeStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <View style={styles.mainRow}>
        {renderPersonCard(node)}
        {spouse && (
          <>
            <View style={styles.spouseConnector}>
              <View style={styles.heartIcon}>
                <Text style={styles.heartText}>♥</Text>
              </View>
            </View>
            {renderPersonCard(spouse, true)}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    textAlign: 'center',
  },
  dates: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  spouseConnector: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  heartIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default React.memo(TreeNodeCard);
