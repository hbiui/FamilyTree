import type { 
  Person, 
  Gender, 
  HighlightedTextPart, 
  SearchResult 
} from '../types/familyTree';

export class MemberSearchService {
  private cache = new Map<string, SearchResult[]>();
  private lastSearchText = '';
  private debounceTimer: NodeJS.Timeout | null = null;

  /**
   * 搜索成员并生成高亮结果
   */
  searchMembers(
    members: Person[],
    searchText: string,
    filters: {
      generation?: number | null;
      gender?: Gender | null;
      isAlive?: boolean | null;
    } = {}
  ): SearchResult[] {
    const cacheKey = this.getCacheKey(members, searchText, filters);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const normalizedSearch = this.normalizeText(searchText);
    
    let filteredMembers = [...members];
    
    filteredMembers = this.applyFilters(filteredMembers, filters);
    
    if (normalizedSearch) {
      filteredMembers = this.searchByFields(filteredMembers, normalizedSearch);
    }

    const searchResults = filteredMembers.map(person => ({
      person,
      highlightedName: this.highlightText(person.name, searchText),
      matchScore: this.calculateMatchScore(person, normalizedSearch),
    }));

    searchResults.sort((a, b) => b.matchScore - a.matchScore);

    if (searchResults.length <= 100) {
      this.cache.set(cacheKey, searchResults);
    }

    return searchResults;
  }

  /**
   * 应用筛选条件
   */
  private applyFilters(
    members: Person[],
    filters: {
      generation?: number | null;
      gender?: Gender | null;
      isAlive?: boolean | null;
    }
  ): Person[] {
    return members.filter(member => {
      if (filters.generation !== undefined && filters.generation !== null) {
        if (member.generation !== filters.generation) {
          return false;
        }
      }
      
      if (filters.gender !== undefined && filters.gender !== null) {
        if (member.gender !== filters.gender) {
          return false;
        }
      }
      
      if (filters.isAlive !== undefined && filters.isAlive !== null) {
        if (member.is_alive !== filters.isAlive) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * 在多个字段中搜索
   */
  private searchByFields(members: Person[], searchText: string): Person[] {
    return members.filter(member => {
      const nameMatch = this.normalizeText(member.name).includes(searchText);
      
      const birthYearMatch = member.birth_date 
        ? this.normalizeText(this.extractBirthYear(member.birth_date)).includes(searchText)
        : false;
      
      const birthplaceMatch = member.birthplace 
        ? this.normalizeText(member.birthplace).includes(searchText)
        : false;
      
      return nameMatch || birthYearMatch || birthplaceMatch;
    });
  }

  /**
   * 计算匹配分数（用于排序）
   */
  private calculateMatchScore(person: Person, searchText: string): number {
    let score = 0;
    const normalized = this.normalizeText(searchText);
    
    if (this.normalizeText(person.name).startsWith(normalized)) {
      score += 100;
    } else if (this.normalizeText(person.name).includes(normalized)) {
      score += 50;
    }
    
    const birthYear = this.extractBirthYear(person.birth_date || '');
    if (this.normalizeText(birthYear).includes(normalized)) {
      score += 30;
    }
    
    if (person.birthplace && this.normalizeText(person.birthplace).includes(normalized)) {
      score += 25;
    }
    
    return score;
  }

  /**
   * 生成高亮文本段
   */
  highlightText(text: string, searchText: string): HighlightedTextPart[] {
    if (!searchText.trim()) {
      return [{ text, isHighlighted: false }];
    }

    const normalizedSearch = this.normalizeText(searchText);
    const normalizedText = this.normalizeText(text);
    
    const startIndex = normalizedText.indexOf(normalizedSearch);
    
    if (startIndex === -1) {
      return [{ text, isHighlighted: false }];
    }

    const endIndex = startIndex + normalizedSearch.length;
    
    return [
      { text: text.substring(0, startIndex), isHighlighted: false },
      { text: text.substring(startIndex, endIndex), isHighlighted: true },
      { text: text.substring(endIndex), isHighlighted: false },
    ].filter(part => part.text.length > 0);
  }

  /**
   * 提取出生年份
   */
  private extractBirthYear(dateString: string): string {
    if (!dateString) return '';
    
    const match = dateString.match(/(\d{4})/);
    return match ? match[1] : '';
  }

  /**
   * 文本归一化
   */
  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    members: Person[],
    searchText: string,
    filters: any
  ): string {
    const memberIds = members.map(m => m.id).sort().join(',');
    const filtersStr = JSON.stringify(filters);
    return `${searchText}|${filtersStr}|${memberIds}`;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取可用的世代选项
   */
  getAvailableGenerations(members: Person[]): number[] {
    const generations = new Set<number>();
    members.forEach(m => {
      if (m.generation !== undefined) {
        generations.add(m.generation);
      }
    });
    return Array.from(generations).sort((a, b) => a - b);
  }

  /**
   * 重置搜索状态
   */
  reset(): void {
    this.lastSearchText = '';
    this.clearCache();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * 防抖搜索
   */
  debounceSearch(
    searchFn: () => void,
    delay: number = 300
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(searchFn, delay);
  }
}

export const memberSearchService = new MemberSearchService();