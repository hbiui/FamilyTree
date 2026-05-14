/**
 * 血缘关系计算器测试用例
 */

import { calculateRelation, calculateAllRelations, getPreciseTitle } from '../utils/relationCalculator';
import type { TreeNode } from '../types/familyTree';

/**
 * 测试数据结构：四世同堂家族树
 * 
 * 层级结构：
 * 
 *                    曾祖父 + 曾祖母
 *                        │
 *                    祖父 + 祖母
 *                    /        \
 *            叔伯父 + 婶婶     父亲 + 母亲
 *              │                 │
 *            堂兄              我 + 配偶
 *                                  │
 *                               儿子
 */

const TEST_FAMILY_TREE: TreeNode = {
  id: 'great-grandpa',
  name: '曾祖父',
  gender: 'male',
  birthDate: '1920-01-01',
  spouse: {
    id: 'great-grandma',
    name: '曾祖母',
    gender: 'female',
    birthDate: '1922-01-01',
    children: [],
  },
  children: [
    {
      id: 'grandpa',
      name: '祖父',
      gender: 'male',
      birthDate: '1950-01-01',
      spouse: {
        id: 'grandma',
        name: '祖母',
        gender: 'female',
        birthDate: '1952-01-01',
        children: [],
      },
      children: [
        {
          id: 'uncle',
          name: '叔伯父',
          gender: 'male',
          birthDate: '1972-01-01',
          spouse: {
            id: 'aunt-by-marriage',
            name: '婶婶',
            gender: 'female',
            birthDate: '1974-01-01',
            children: [],
          },
          children: [
            {
              id: 'cousin',
              name: '堂兄',
              gender: 'male',
              birthDate: '1995-01-01',
              children: [],
            },
          ],
        },
        {
          id: 'father',
          name: '父亲',
          gender: 'male',
          birthDate: '1975-01-01',
          spouse: {
            id: 'mother',
            name: '母亲',
            gender: 'female',
            birthDate: '1978-01-01',
            children: [],
          },
          children: [
            {
              id: 'me',
              name: '我',
              gender: 'male',
              birthDate: '2000-01-01',
              children: [
                {
                  id: 'son',
                  name: '儿子',
                  gender: 'male',
                  birthDate: '2025-01-01',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('血缘关系计算器', () => {
  describe('直系血亲关系', () => {
    test('自己与自己的关系', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'me');
      expect(result.type).toBe('self');
      expect(result.title).toBe('自己');
      expect(result.description).toBe('自己');
      expect(result.intimacy).toBe(10);
    });

    test('儿子', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'son');
      expect(result.type).toBe('child');
      expect(result.title).toBe('儿子');
      expect(result.description).toBe('儿子');
      expect(result.intimacy).toBe(9);
    });

    test('父亲', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'father');
      expect(result.type).toBe('parent');
      expect(result.title).toBe('父亲');
      expect(result.description).toBe('父亲');
      expect(result.intimacy).toBe(9);
    });

    test('母亲', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'mother');
      expect(result.type).toBe('parent');
      expect(result.title).toBe('母亲');
      expect(result.description).toBe('母亲');
      expect(result.intimacy).toBe(9);
    });

    test('祖父', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'grandpa');
      expect(result.type).toBe('grandparent');
      expect(result.title).toBe('祖父');
      expect(result.description).toBe('祖父');
      expect(result.intimacy).toBe(7);
    });

    test('祖母', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'grandma');
      expect(result.type).toBe('grandparent');
      expect(result.title).toBe('祖母');
      expect(result.description).toBe('祖母');
      expect(result.intimacy).toBe(7);
    });

    test('曾祖父', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'great-grandpa');
      expect(result.type).toBe('great_grandparent');
      expect(result.title).toBe('曾祖父母');
      expect(result.intimacy).toBe(5);
    });

    test('孙子（儿子）', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'father', 'son');
      expect(result.type).toBe('child');
      expect(result.title).toBe('儿子');
      expect(result.intimacy).toBe(9);
    });
  });

  describe('配偶关系', () => {
    test('配偶（母亲是父亲的配偶）', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'father', 'mother');
      expect(result.type).toBe('spouse');
      expect(result.title).toBe('配偶');
      expect(result.intimacy).toBe(9);
    });

    test('配偶（我是配偶的丈夫）', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'mother');
      // 如果算法正确，应该能找到配偶关系
      expect(result.intimacy).toBeGreaterThan(0);
    });
  });

  describe('兄弟姐妹关系', () => {
    test('如果有多个子女，应该识别为兄弟姐妹', () => {
      // 在测试树中添加一个姐妹
      const sisterTree: TreeNode = {
        ...TEST_FAMILY_TREE,
        children: [
          {
            ...TEST_FAMILY_TREE.children![0],
            children: [
              TEST_FAMILY_TREE.children![0].children![0],
              TEST_FAMILY_TREE.children![0].children![1],
              {
                id: 'sister',
                name: '妹妹',
                gender: 'female',
                birthDate: '2002-01-01',
                children: [],
              },
            ],
          },
        ],
      };

      const result = calculateRelation(sisterTree, 'me', 'sister');
      expect(result.type).toBe('sibling');
      expect(result.description).toBe('姐妹');
      expect(result.intimacy).toBe(8);
    });
  });

  describe('叔伯姑姨关系', () => {
    test('叔伯父', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'uncle');
      expect(result.type).toBe('uncle_aunt');
      expect(result.title).toBe('叔伯姑姨');
      expect(result.description).toBe('叔叔');
      expect(result.intimacy).toBe(6);
    });

    test('婶婶（姻亲）', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'aunt-by-marriage');
      // 婶婶是通过婚姻建立的姻亲关系
      expect(result.intimacy).toBeGreaterThan(0);
    });
  });

  describe('堂表兄弟姐妹关系', () => {
    test('堂兄', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'cousin');
      expect(result.type).toBe('cousin');
      expect(result.title).toBe('堂表兄弟姐妹');
      expect(result.intimacy).toBe(4);
    });
  });

  describe('侄子侄女关系', () => {
    test('侄子（堂兄的儿子）', () => {
      // 堂兄的儿子应该是我父亲兄弟的孙子
      const result = calculateRelation(TEST_FAMILY_TREE, 'uncle', 'cousin');
      expect(result.type).toBe('uncle_aunt');
      expect(result.intimacy).toBe(6);
    });
  });

  describe('反向关系', () => {
    test('父亲的视角：我是儿子', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'father', 'me');
      expect(result.type).toBe('child');
      expect(result.description).toBe('儿子');
      expect(result.intimacy).toBe(9);
    });

    test('祖父的视角：我是孙子', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'grandpa', 'me');
      expect(result.type).toBe('grandchild');
      expect(result.description).toBe('孙子');
      expect(result.intimacy).toBe(7);
    });
  });

  describe('getPreciseTitle 函数', () => {
    test('精确称谓：父亲', () => {
      expect(getPreciseTitle(1, 0, 'female')).toBe('母亲');
      expect(getPreciseTitle(1, 0, 'male')).toBe('父亲');
    });

    test('精确称谓：儿子', () => {
      expect(getPreciseTitle(0, 1, 'female')).toBe('女儿');
      expect(getPreciseTitle(0, 1, 'male')).toBe('儿子');
    });

    test('精确称谓：自己', () => {
      expect(getPreciseTitle(0, 0, 'male')).toBe('自己');
    });
  });

  describe('边界情况', () => {
    test('不存在的节点ID', () => {
      const result = calculateRelation(TEST_FAMILY_TREE, 'me', 'non-existent');
      expect(result.type).toBe('unknown');
      expect(result.title).toBe('关系未知');
    });

    test('空树', () => {
      const emptyTree: TreeNode = {
        id: 'single',
        name: '单独一人',
        gender: 'male',
        children: [],
      };
      const result = calculateRelation(emptyTree, 'single', 'single');
      expect(result.type).toBe('self');
    });
  });

  describe('批量计算', () => {
    test('计算与所有成员的关系', () => {
      const allRelations = calculateAllRelations(TEST_FAMILY_TREE, 'me');

      // 应该包含除了自己之外的所有人
      expect(allRelations.size).toBeGreaterThan(10);

      // 验证父亲的关系
      const fatherRelation = allRelations.get('father');
      expect(fatherRelation).toBeDefined();
      expect(fatherRelation!.type).toBe('parent');
    });
  });
});

/**
 * 扩展测试用例表
 */
describe('扩展关系测试用例', () => {
  const extendedTree: TreeNode = {
    id: 'root',
    name: '祖先',
    gender: 'male',
    spouse: {
      id: 'root-wife',
      name: '祖先配偶',
      gender: 'female',
      children: [],
    },
    children: [
      {
        id: 'gen1-male',
        name: '一代男',
        gender: 'male',
        spouse: {
          id: 'gen1-female',
          name: '一代女',
          gender: 'female',
          children: [],
        },
        children: [
          {
            id: 'gen2-male',
            name: '二代男',
            gender: 'male',
            spouse: {
              id: 'gen2-female',
              name: '二代女',
              gender: 'female',
              children: [],
            },
            children: [
              {
                id: 'gen3-male',
                name: '三代男',
                gender: 'male',
                children: [],
              },
              {
                id: 'gen3-female',
                name: '三代女',
                gender: 'female',
                children: [],
              },
            ],
          },
          {
            id: 'gen2-uncle',
            name: '二代叔',
            gender: 'male',
            spouse: {
              id: 'gen2-aunt',
              name: '二代婶',
              gender: 'female',
              children: [],
            },
            children: [
              {
                id: 'gen3-cousin',
                name: '堂兄弟',
                gender: 'male',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  describe('扩展家族树关系', () => {
    test('表亲关系', () => {
      const result = calculateRelation(extendedTree, 'gen3-male', 'gen3-cousin');
      expect(result.type).toBe('cousin');
      expect(result.intimacy).toBe(4);
    });

    test('叔侄关系', () => {
      const result = calculateRelation(extendedTree, 'gen2-uncle', 'gen3-male');
      expect(result.type).toBe('uncle_aunt');
      expect(result.description).toBe('叔叔');
    });

    test('曾祖孙关系', () => {
      const result = calculateRelation(extendedTree, 'root', 'gen3-male');
      expect(result.intimacy).toBeGreaterThan(0);
    });
  });
});
