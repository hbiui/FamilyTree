import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSearchAndFilterStore } from '../../store/useSearchAndFilterStore';
import type { MemberSearchQuery, MemberFilter } from '../../types/familyTree';

interface MemberSearchBarProps {
  placeholder?: string;
  onFocus?: () => void;
}

export const MemberSearchBar: React.FC<MemberSearchBarProps> = ({
  placeholder = '搜索姓名、年份、居住地...',
  onFocus,
}) => {
  const { searchQuery, setSearchText, resetSearch } = useSearchAndFilterStore();

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={searchQuery.searchText}
          onChangeText={setSearchText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
          onFocus={onFocus}
        />
        {searchQuery.searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={resetSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFBF5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    height: 24,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
