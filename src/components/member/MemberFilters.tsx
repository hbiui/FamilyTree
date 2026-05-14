import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMemberStore } from '../../store/useMemberStore';
import { useSearchAndFilterStore } from '../../store/useSearchAndFilterStore';
import { memberSearchService } from '../../services/memberSearchService';
import type { Gender } from '../../types/familyTree';

interface MemberFiltersProps {
  isVisible: boolean;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({ isVisible }) => {
  const { members } = useMemberStore();
  const {
    filters,
    setGenerationFilter,
    setGenderFilter,
    setIsAliveFilter,
    resetFilters,
    hasActiveFilters,
  } = useSearchAndFilterStore();

  const availableGenerations = memberSearchService.getAvailableGenerations(members);
  const activeFilters = hasActiveFilters();

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 世代筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>世代</Text>
          <View style={styles.optionsRow}>
            <FilterOption
              label="全部"
              selected={filters.generation === null}
              onPress={() => setGenerationFilter(null)}
            />
            {availableGenerations.map(gen => (
              <FilterOption
                key={gen}
                label={`第${gen}代`}
                selected={filters.generation === gen}
                onPress={() => setGenerationFilter(gen)}
              />
            ))}
          </View>
        </View>

        {/* 性别筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>性别</Text>
          <View style={styles.optionsRow}>
            <FilterOption
              label="全部"
              selected={filters.gender === null}
              onPress={() => setGenderFilter(null)}
            />
            <FilterOption
              label="男"
              selected={filters.gender === 'male'}
              onPress={() => setGenderFilter('male')}
            />
            <FilterOption
              label="女"
              selected={filters.gender === 'female'}
              onPress={() => setGenderFilter('female')}
            />
            <FilterOption
              label="未知"
              selected={filters.gender === 'unknown'}
              onPress={() => setGenderFilter('unknown')}
            />
          </View>
        </View>

        {/* 在世状态筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>状态</Text>
          <View style={styles.optionsRow}>
            <FilterOption
              label="全部"
              selected={filters.isAlive === null}
              onPress={() => setIsAliveFilter(null)}
            />
            <FilterOption
              label="在世"
              selected={filters.isAlive === true}
              onPress={() => setIsAliveFilter(true)}
            />
            <FilterOption
              label="已故"
              selected={filters.isAlive === false}
              onPress={() => setIsAliveFilter(false)}
            />
          </View>
        </View>
      </ScrollView>

      {activeFilters && (
        <View style={styles.resetRow}>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>清除筛选</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected && styles.optionButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionButtonText,
          selected && styles.optionButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollView: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  filterSection: {
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#DC2626',
    fontWeight: '600',
  },
  resetRow: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
