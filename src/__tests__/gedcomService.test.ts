/**
 * GEDCOM 服务测试
 */

import { exportToGedcom, generateGedcomSample } from '../../src/services/gedcomService';
import type { TreeNode } from '../../src/types/familyTree';

describe('GEDCOM 导出服务', () => {
  describe('exportToGedcom', () => {
    it('应生成包含 HEAD 头的 GEDCOM 文件', () => {
      const tree: TreeNode = {
        id: 'test-1',
        name: '测试人员',
        gender: 'male',
        children: [],
      };

      const result = exportToGedcom(tree, { familyName: '测试家族' });

      expect(result.success).toBe(true);
      expect(result.content).toContain('0 HEAD');
      expect(result.content).toContain('GEDC');
      expect(result.content).toContain('VERS 5.5.5');
      expect(result.content).toContain('CHAR UTF-8');
    });

    it('应生成包含尾部的 GEDCOM 文件', () => {
      const tree: TreeNode = {
        id: 'test-1',
        name: '测试人员',
        gender: 'female',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('0 TRLR');
    });

    it('应正确导出男性成员信息', () => {
      const tree: TreeNode = {
        id: 'male-1',
        name: '王建国',
        gender: 'male',
        birthDate: '1950-11-05',
        deathDate: '2020-01-15',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('1 NAME 王建国');
      expect(result.content).toContain('1 SEX M');
      expect(result.content).toContain('1 BIRT');
      expect(result.content).toContain('2 DATE 05 NOV 1950');
      expect(result.content).toContain('1 DEAT Y');
      expect(result.content).toContain('2 DATE 15 JAN 2020');
    });

    it('应正确导出女性成员信息', () => {
      const tree: TreeNode = {
        id: 'female-1',
        name: '刘秀英',
        gender: 'female',
        birthDate: '1952-02-18',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('1 NAME 刘秀英');
      expect(result.content).toContain('1 SEX F');
      expect(result.content).toContain('1 BIRT');
      expect(result.content).toContain('2 DATE 18 FEB 1952');
    });

    it('应处理无日期的成员', () => {
      const tree: TreeNode = {
        id: 'unknown-1',
        name: '张三',
        gender: 'unknown',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('1 NAME 张三');
      expect(result.content).toContain('1 SEX U');
      expect(result.content).not.toContain('1 BIRT');
    });

    it('应正确处理配偶关系', () => {
      const tree: TreeNode = {
        id: 'husband-1',
        name: '王德明',
        gender: 'male',
        birthDate: '1920-03-10',
        spouse: {
          id: 'wife-1',
          name: '陈秀兰',
          gender: 'female',
          birthDate: '1922-07-20',
          children: [],
        },
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('1 NAME 王德明');
      expect(result.content).toContain('1 NAME 陈秀兰');
      expect(result.content).toContain('0 @F0001@ FAM');
      expect(result.content).toContain('1 HUSB');
      expect(result.content).toContain('1 WIFE');
    });

    it('应正确处理子女关系', () => {
      const tree: TreeNode = {
        id: 'parent-1',
        name: '王德明',
        gender: 'male',
        birthDate: '1920-03-10',
        children: [
          {
            id: 'child-1',
            name: '王建国',
            gender: 'male',
            birthDate: '1950-11-05',
            children: [],
          },
        ],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('1 CHIL');
    });

    it('应正确处理多代家族树', () => {
      const tree: TreeNode = {
        id: 'grandpa',
        name: '王德明',
        gender: 'male',
        birthDate: '1920-03-10',
        spouse: {
          id: 'grandma',
          name: '陈秀兰',
          gender: 'female',
          birthDate: '1922-07-20',
          children: [],
        },
        children: [
          {
            id: 'father',
            name: '王建国',
            gender: 'male',
            birthDate: '1950-11-05',
            spouse: {
              id: 'mother',
              name: '刘秀英',
              gender: 'female',
              birthDate: '1952-02-18',
              children: [],
            },
            children: [
              {
                id: 'me',
                name: '王小明',
                gender: 'male',
                birthDate: '2000-01-01',
                children: [],
              },
            ],
          },
        ],
      };

      const result = exportToGedcom(tree, { familyName: '王氏家族' });

      expect(result.success).toBe(true);
      expect(result.content).toContain('王德明');
      expect(result.content).toContain('陈秀兰');
      expect(result.content).toContain('王建国');
      expect(result.content).toContain('刘秀英');
      expect(result.content).toContain('王小明');
    });

    it('应生成正确的文件名', () => {
      const tree: TreeNode = {
        id: 'test-1',
        name: '测试',
        gender: 'male',
        children: [],
      };

      const result = exportToGedcom(tree, { familyName: '王氏家族' });

      expect(result.success).toBe(true);
      expect(result.fileName).toContain('王氏家族');
      expect(result.fileName).toMatch(/\.ged$/);
    });

    it('应包含版本信息', () => {
      const tree: TreeNode = {
        id: 'test-1',
        name: '测试',
        gender: 'male',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('SOUR FamilyTree App');
      expect(result.content).toContain('VERS 1.0.0');
    });

    it('应处理空家族树', () => {
      const tree: TreeNode = {
        id: 'empty-1',
        name: '唯一成员',
        gender: 'male',
        children: [],
      };

      const result = exportToGedcom(tree);

      expect(result.success).toBe(true);
      expect(result.content).toContain('0 HEAD');
      expect(result.content).toContain('0 TRLR');
    });
  });

  describe('generateGedcomSample', () => {
    it('应生成示例 GEDCOM 内容', () => {
      const sample = generateGedcomSample();

      expect(sample).toContain('0 HEAD');
      expect(sample).toContain('0 TRLR');
      expect(sample).toContain('王德明');
      expect(sample).toContain('陈秀兰');
    });

    it('生成的示例应可被解析', () => {
      const sample = generateGedcomSample();

      expect(sample).toContain('GEDC');
      expect(sample).toContain('VERS 5.5.5');
      expect(sample).toContain('CHAR UTF-8');
    });
  });
});

describe('GEDCOM 导出边界测试', () => {
  it('应处理超长姓名', () => {
    const longName = 'A'.repeat(100);
    const tree: TreeNode = {
      id: 'long-name',
      name: longName,
      gender: 'male',
      children: [],
    };

    const result = exportToGedcom(tree);

    expect(result.success).toBe(true);
    expect(result.content).toContain(longName);
  });

  it('应处理特殊字符', () => {
    const tree: TreeNode = {
      id: 'special-chars',
      name: '测试&家族<成员>',
      gender: 'male',
      birthDate: '2020-01-01',
      children: [],
    };

    const result = exportToGedcom(tree);

    expect(result.success).toBe(true);
    expect(result.content).toContain('测试&家族<成员>');
  });

  it('应处理未来日期', () => {
    const tree: TreeNode = {
      id: 'future-1',
      name: '未来人',
      gender: 'female',
      birthDate: '2099-12-31',
      children: [],
    };

    const result = exportToGedcom(tree);

    expect(result.success).toBe(true);
    expect(result.content).toContain('31 DEC 2099');
  });
});
