import { MemberSearchService } from '../../src/services/memberSearchService';
import type { Person, Gender } from '../../src/types/familyTree';

describe('MemberSearchService', () => {
  let service: MemberSearchService;

  beforeEach(() => {
    service = new MemberSearchService();
  });

  afterEach(() => {
    service.reset();
  });

  const createMockPerson = (id: string, name: string, gender: Gender, generation?: number): Person => ({
    id,
    name,
    gender,
    birth_date: '1990-01-01',
    is_alive: true,
    generation: generation ?? 3,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  });

  describe('searchMembers', () => {
    it('should return empty array for empty members list', () => {
      const result = service.searchMembers([], 'test');
      
      expect(result).toEqual([]);
    });

    it('should return empty array for empty search text', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
        createMockPerson('2', '李四', 'female'),
      ];
      
      const result = service.searchMembers(members, '');
      
      expect(result).toEqual([]);
    });

    it('should find members by name', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
        createMockPerson('2', '李四', 'female'),
      ];
      
      const result = service.searchMembers(members, '张三');
      
      expect(result).toHaveLength(1);
      expect(result[0].person.name).toBe('张三');
    });

    it('should be case insensitive', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
      ];
      
      const result = service.searchMembers(members, 'zhang');
      
      expect(result).toHaveLength(1);
    });

    it('should return multiple matches', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
        createMockPerson('2', '张四', 'male'),
        createMockPerson('3', '王五', 'female'),
      ];
      
      const result = service.searchMembers(members, '张');
      
      expect(result).toHaveLength(2);
    });

    it('should filter by generation', () => {
      const members = [
        createMockPerson('1', '张三', 'male', 2),
        createMockPerson('2', '李四', 'male', 3),
        createMockPerson('3', '王五', 'female', 4),
      ];
      
      const result = service.searchMembers(members, '', { generation: 3 });
      
      expect(result).toHaveLength(1);
      expect(result[0].person.name).toBe('李四');
    });

    it('should filter by gender', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
        createMockPerson('2', '李四', 'female'),
      ];
      
      const result = service.searchMembers(members, '', { gender: 'female' });
      
      expect(result).toHaveLength(1);
      expect(result[0].person.name).toBe('李四');
    });

    it('should combine multiple filters', () => {
      const members = [
        createMockPerson('1', '张三', 'male', 2),
        createMockPerson('2', '李四', 'male', 3),
        createMockPerson('3', '王五', 'female', 3),
      ];
      
      const result = service.searchMembers(members, '', { 
        gender: 'male',
        generation: 3,
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].person.name).toBe('李四');
    });

    it('should use cache for repeated searches', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
      ];
      
      const result1 = service.searchMembers(members, '张');
      const result2 = service.searchMembers(members, '张');
      
      expect(result1).toEqual(result2);
    });
  });

  describe('highlightText', () => {
    it('should highlight matching text', () => {
      const result = service.highlightText('张三', '张');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ text: '张', isHighlighted: true });
      expect(result[1]).toEqual({ text: '三', isHighlighted: false });
    });

    it('should handle no matches', () => {
      const result = service.highlightText('张三', '王');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: '张三', isHighlighted: false });
    });

    it('should highlight entire text when fully matching', () => {
      const result = service.highlightText('张三', '张三');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: '张三', isHighlighted: true });
    });

    it('should handle empty search text', () => {
      const result = service.highlightText('张三', '');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: '张三', isHighlighted: false });
    });
  });

  describe('getAvailableGenerations', () => {
    it('should return unique generations sorted', () => {
      const members = [
        createMockPerson('1', '张三', 'male', 2),
        createMockPerson('2', '李四', 'male', 3),
        createMockPerson('3', '王五', 'female', 3),
        createMockPerson('4', '赵六', 'male', 1),
      ];
      
      const result = service.getAvailableGenerations(members);
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty members', () => {
      const result = service.getAvailableGenerations([]);
      
      expect(result).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should clear cache', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
      ];
      
      service.searchMembers(members, '张');
      expect(service.searchMembers(members, '张')).toHaveLength(1);
      
      service.reset();
      
      expect(service.searchMembers(members, '张')).toHaveLength(1);
    });
  });

  describe('clearCache', () => {
    it('should clear the search cache', () => {
      const members = [
        createMockPerson('1', '张三', 'male'),
      ];
      
      service.searchMembers(members, '张');
      service.clearCache();
      
      expect(service.searchMembers(members, '张')).toHaveLength(1);
    });
  });
});