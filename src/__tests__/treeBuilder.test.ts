import { buildTree, flattenTree } from '../utils/treeBuilder';
import {
  THREE_PERSON_FAMILY,
  FOUR_GENERATIONS_FAMILY,
  MISSING_RELATIONS_FAMILY,
} from './testData';

describe('treeBuilder', () => {
  describe('buildTree', () => {
    test('should build a tree for a three-person family', () => {
      const result = buildTree(
        THREE_PERSON_FAMILY.persons,
        THREE_PERSON_FAMILY.relations
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('father-1');
      expect(result!.name).toBe('张明');
      expect(result!.gender).toBe('male');
      expect(result!.spouse).not.toBeNull();
      expect(result!.spouse?.id).toBe('mother-1');
      expect(result!.spouse?.name).toBe('李华');
      expect(result!.children).toHaveLength(1);
      expect(result!.children[0].id).toBe('son-1');
      expect(result!.children[0].name).toBe('张伟');
    });

    test('should build a four-generations tree with spouses', () => {
      const result = buildTree(
        FOUR_GENERATIONS_FAMILY.persons,
        FOUR_GENERATIONS_FAMILY.relations
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('great-grandpa');
      expect(result!.spouse).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children[0].id).toBe('grandpa');

      const grandpa = result!.children[0];
      expect(grandpa.spouse).not.toBeNull();
      expect(grandpa.children).toHaveLength(1);
      expect(grandpa.children[0].id).toBe('father');

      const father = grandpa.children[0];
      expect(father.spouse).not.toBeNull();
      expect(father.children).toHaveLength(1);
      expect(father.children[0].id).toBe('child');
    });

    test('should handle missing parent relations gracefully', () => {
      const result = buildTree(
        MISSING_RELATIONS_FAMILY.persons,
        MISSING_RELATIONS_FAMILY.relations
      );

      expect(result).not.toBeNull();
      expect(['person-a', 'person-b', 'person-c']).toContain(result!.id);
      expect(result!.spouse).toBeNull();
      expect(result!.children).toHaveLength(0);
    });

    test('should return null for empty persons', () => {
      const result = buildTree([], []);
      expect(result).toBeNull();
    });
  });

  describe('flattenTree', () => {
    test('should flatten a three-person tree back to flat structure', () => {
      const tree = buildTree(
        THREE_PERSON_FAMILY.persons,
        THREE_PERSON_FAMILY.relations
      )!;

      const flattened = flattenTree(tree);

      expect(flattened.persons).toHaveLength(3);
      const personIds = flattened.persons.map(p => p.id);
      expect(personIds).toContain('father-1');
      expect(personIds).toContain('mother-1');
      expect(personIds).toContain('son-1');

      const relationTypes = flattened.relations.map(r => r.relation_type);
      expect(relationTypes).toContain('spouse');
      expect(relationTypes).toContain('son');
    });

    test('should flatten a four-generations tree', () => {
      const tree = buildTree(
        FOUR_GENERATIONS_FAMILY.persons,
        FOUR_GENERATIONS_FAMILY.relations
      )!;

      const flattened = flattenTree(tree);

      expect(flattened.persons).toHaveLength(7);
      expect(flattened.relations).toHaveLength(6);
    });

    test('should preserve all basic person properties', () => {
      const tree = buildTree(
        THREE_PERSON_FAMILY.persons,
        THREE_PERSON_FAMILY.relations
      )!;

      const flattened = flattenTree(tree);

      const father = flattened.persons.find(p => p.id === 'father-1');
      expect(father).toBeDefined();
      expect(father!.name).toBe('张明');
      expect(father!.gender).toBe('male');
      expect(father!.birth_date).toBe('1970-01-01');
    });
  });

  describe('roundtrip test', () => {
    test('should roundtrip: buildTree -> flattenTree -> buildTree should produce identical structure', () => {
      const originalTree = buildTree(
        FOUR_GENERATIONS_FAMILY.persons,
        FOUR_GENERATIONS_FAMILY.relations
      )!;

      const flattened = flattenTree(originalTree);

      const rebuiltTree = buildTree(
        flattened.persons as any,
        flattened.relations as any
      )!;

      expect(rebuiltTree.id).toBe(originalTree.id);
      expect(rebuiltTree.name).toBe(originalTree.name);
    });
  });
});
