import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { FamilyEventWithPeople, Person } from '../../types/familyTree';
import {
  EVENT_TYPE_CONFIG,
  formatEventDateChinese,
} from '../../services/familyEventService';

interface EventCardProps {
  event: FamilyEventWithPeople;
  index: number;
  onPersonPress?: (personId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.4;

export default function EventCard({ event, index, onPersonPress }: EventCardProps) {
  const router = useRouter();
  const isLeft = index % 2 === 0;
  const config = EVENT_TYPE_CONFIG[event.type];

  const getInitials = (name: string) => name.charAt(0);

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return '#3B82F6';
      case 'female':
        return '#EC4899';
      default:
        return '#9CA3AF';
    }
  };

  const renderRelatedPerson = (person: Person) => (
    <TouchableOpacity
      key={person.id}
      style={styles.personTag}
      onPress={() => {
        if (onPersonPress) {
          onPersonPress(person.id);
        } else {
          router.push(`/person/${person.id}`);
        }
      }}
    >
      <View style={[styles.personAvatar, { backgroundColor: getGenderColor(person.gender) + '20' }]}>
        <Text style={[styles.personInitial, { color: getGenderColor(person.gender) }]}>
          {getInitials(person.name)}
        </Text>
      </View>
      <Text style={styles.personName} numberOfLines={1}>
        {person.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isLeft ? styles.leftContainer : styles.rightContainer]}>
      {/* 事件节点 */}
      <View style={styles.dotContainer}>
        <View style={styles.dot} />
        <View style={styles.dotLine} />
      </View>

      {/* 卡片内容 */}
      <View style={[styles.card, isLeft ? styles.leftCard : styles.rightCard]}>
        {/* 日期标签 */}
        <View style={styles.dateTag}>
          <Text style={styles.dateText}>{formatEventDateChinese(event.date)}</Text>
        </View>

        {/* 事件标题和类型 */}
        <View style={styles.header}>
          <Text style={styles.typeIcon}>{config.icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.typeLabel}>{config.label}</Text>
            <Text style={styles.title}>{event.title}</Text>
          </View>
        </View>

        {/* 描述 */}
        {event.description && (
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
        )}

        {/* 图片 */}
        {event.image_url && (
          <Image
            source={{ uri: event.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* 关联人员 */}
        {event.related_people.length > 0 && (
          <View style={styles.peopleSection}>
            <Text style={styles.peopleLabel}>相关人员</Text>
            <View style={styles.peopleList}>
              {event.related_people.map(renderRelatedPerson)}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  leftContainer: {
    justifyContent: 'flex-start',
  },
  rightContainer: {
    justifyContent: 'flex-end',
  },
  dotContainer: {
    alignItems: 'center',
    width: 40,
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    zIndex: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotLine: {
    position: 'absolute',
    top: 16,
    width: 2,
    height: 1000,
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  leftCard: {
    marginRight: SCREEN_WIDTH * 0.1,
  },
  rightCard: {
    marginLeft: SCREEN_WIDTH * 0.1,
  },
  dateTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 12,
  },
  peopleSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  peopleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  peopleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  personAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInitial: {
    fontSize: 12,
    fontWeight: '600',
  },
  personName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});