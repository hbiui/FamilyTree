/**
 * GEDCOM 导入服务测试
 */

import {
  parseGedcom,
  findDuplicates,
  importFromGedcom,
  type ParsedIndividual,
  type ImportOptions,
  type DuplicateInfo
} from '../../src/services/gedcomImportService';
import type { Person } from '../../src/types/familyTree';

describe('GEDCOM 导入服务', () => {
  describe('parseGedcom', () => {
    it('应正确解析基本 GEDCOM 文件', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
2 GIVN 德明
2 SURN 王
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals).toHaveLength(1);
      expect(result.individuals[0].name).toBe('王德明');
      expect(result.individuals[0].gender).toBe('male');
      expect(result.individuals[0].birthDate).toBe('1920-03-10');
    });

    it('应正确解析女性成员', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 陈秀兰
1 SEX F
1 BIRT
2 DATE 20 JUL 1922
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].gender).toBe('female');
    });

    it('应正确解析逝世日期', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
1 DEAT Y
2 DATE 25 DEC 2005
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].deathDate).toBe('2005-12-25');
    });

    it('应正确解析家族记录', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
0 @I0002@ INDI
1 NAME 陈秀兰
1 SEX F
0 @F0001@ FAM
1 HUSB @I0001@
1 WIFE @I0002@
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.families).toHaveLength(1);
      expect(result.families[0].husbandXref).toBe('@I0001@');
      expect(result.families[0].wifeXref).toBe('@I0002@');
    });

    it('应正确解析子女关系', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
0 @I0002@ INDI
1 NAME 王建国
1 SEX M
0 @F0001@ FAM
1 HUSB @I0001@
1 CHIL @I0002@
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.families[0].childrenXrefs).toContain('@I0002@');
    });

    it('应处理 ABOUT 日期格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
1 BIRT
2 DATE ABT 1920
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('1920-01-01');
    });

    it('应处理 EST 日期格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
1 BIRT
2 DATE EST 1919
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('1919-01-01');
    });

    it('应解析姓名中的姓氏', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王/德明/
2 GIVN 德明
2 SURN 王
1 SEX M
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].givenName).toBe('德明');
      expect(result.individuals[0].surname).toBe('王');
    });

    it('应处理无姓名的成员', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 SEX M
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].name).toBe('');
    });

    it('应处理空文件', () => {
      const result = parseGedcom('');

      expect(result.success).toBe(true);
      expect(result.individuals).toHaveLength(0);
      expect(result.families).toHaveLength(0);
    });

    it('应处理只有 HEAD 和 TRLR 的文件', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals).toHaveLength(0);
    });
  });

  describe('findDuplicates', () => {
    it('应正确识别完全匹配的重复成员', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王德明',
          gender: 'male',
          birthDate: '1920-03-10',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '王德明',
          gender: 'male',
          birth_date: '1920-03-10',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].matchType).toBe('exact');
      expect(duplicates[0].importedPerson.name).toBe('王德明');
    });

    it('应区分姓名相同但出生日期不同的成员', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王建国',
          gender: 'male',
          birthDate: '1950-11-05',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '王建国',
          gender: 'male',
          birth_date: '1955-05-15',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(0);
    });

    it('应区分姓名不同但出生日期相同的成员', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王德明',
          gender: 'male',
          birthDate: '1920-03-10',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '李德明',
          gender: 'male',
          birth_date: '1920-03-10',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(0);
    });

    it('应处理姓名中的空格差异', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王 德明',
          gender: 'male',
          birthDate: '1920-03-10',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '王德明',
          gender: 'male',
          birth_date: '1920-03-10',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(1);
    });

    it('应处理大小写差异', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: 'WANG DEMING',
          gender: 'male',
          birthDate: '1920-03-10',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: 'wang deming',
          gender: 'male',
          birth_date: '1920-03-10',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(1);
    });

    it('应处理空出生日期', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王德明',
          gender: 'male',
          birthDate: undefined,
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '王德明',
          gender: 'male',
          birth_date: undefined,
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(0);
    });

    it('应识别多个重复', () => {
      const imported: ParsedIndividual[] = [
        {
          xref: '@I0001@',
          name: '王德明',
          gender: 'male',
          birthDate: '1920-03-10',
          familyIds: [],
          spouseFamilyIds: [],
        },
        {
          xref: '@I0002@',
          name: '陈秀兰',
          gender: 'female',
          birthDate: '1922-07-20',
          familyIds: [],
          spouseFamilyIds: [],
        },
      ];

      const existing: Person[] = [
        {
          id: 'existing-1',
          name: '王德明',
          gender: 'male',
          birth_date: '1920-03-10',
          family_id: 'fam-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_alive: true,
        },
      ];

      const duplicates = findDuplicates(imported, existing);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].importedPerson.name).toBe('王德明');
    });
  });

  describe('importFromGedcom', () => {
    const validGedcom = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
0 TRLR
    `.trim();

    const existingPerson: Person = {
      id: 'existing-1',
      name: '王德明',
      gender: 'male',
      birth_date: '1920-03-10',
      family_id: 'fam-1',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_alive: true,
    };

    it('skip 策略应跳过重复成员', async () => {
      const options: ImportOptions = {
        mergeStrategy: 'skip',
        updateExisting: false,
        createMissingParents: false,
      };

      const result = await importFromGedcom(validGedcom, [existingPerson], options);

      expect(result.success).toBe(true);
      expect(result.added).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('duplicate');
    });

    it('overwrite 策略应标记为更新', async () => {
      const options: ImportOptions = {
        mergeStrategy: 'overwrite',
        updateExisting: true,
        createMissingParents: false,
      };

      const result = await importFromGedcom(validGedcom, [existingPerson], options);

      expect(result.success).toBe(true);
      expect(result.updated).toBe(1);
      expect(result.tree).toBeDefined();
    });

    it('keep_both 策略应创建新成员', async () => {
      const options: ImportOptions = {
        mergeStrategy: 'keep_both',
        updateExisting: false,
        createMissingParents: false,
      };

      const result = await importFromGedcom(validGedcom, [existingPerson], options);

      expect(result.success).toBe(true);
      expect(result.added).toBe(1);
      expect(result.tree).toBeDefined();
    });

    it('ask 策略应报告需要用户确认', async () => {
      const options: ImportOptions = {
        mergeStrategy: 'ask',
        updateExisting: false,
        createMissingParents: false,
      };

      const result = await importFromGedcom(validGedcom, [existingPerson], options);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(1);
      expect(result.conflicts.some(c => c.type === 'duplicate')).toBe(true);
    });

    it('应处理无重复的新成员', async () => {
      const options: ImportOptions = {
        mergeStrategy: 'skip',
        updateExisting: false,
        createMissingParents: false,
      };

      const result = await importFromGedcom(validGedcom, [], options);

      expect(result.success).toBe(true);
      expect(result.added).toBe(1);
      expect(result.tree).toBeDefined();
    });

    it('应构建正确的树结构', async () => {
      const multiGenGedcom = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 王德明
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
0 @I0002@ INDI
1 NAME 王建国
1 SEX M
1 BIRT
2 DATE 05 NOV 1950
0 @F0001@ FAM
1 HUSB @I0001@
1 CHIL @I0002@
0 TRLR
      `.trim();

      const options: ImportOptions = {
        mergeStrategy: 'keep_both',
        updateExisting: false,
        createMissingParents: false,
      };

      const result = await importFromGedcom(multiGenGedcom, [], options);

      expect(result.success).toBe(true);
      expect(result.tree).toBeDefined();
      expect(result.tree?.name).toBe('王德明');
      expect(result.tree?.children).toHaveLength(1);
      expect(result.tree?.children[0].name).toBe('王建国');
    });
  });

  describe('日期解析边界测试', () => {
    it('应处理纯年份格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE 1990
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('1990-01-01');
    });

    it('应处理带日的月份格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE 1 JAN 2000
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('2000-01-01');
    });

    it('应处理 BEF 日期格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE BEF 1980
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('1980-01-01');
    });

    it('应处理 AFT 日期格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE AFT 2000
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBe('2000-01-01');
    });

    it('应处理无效日期格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE INVALID
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthDate).toBeUndefined();
    });
  });

  describe('GEDCOM 5.5 规范兼容性测试', () => {
    it('应处理 LINEAGE-LINKED 格式', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals).toHaveLength(1);
    });

    it('应处理 CHAT 标签', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].name).toBe('测试');
    });

    it('应处理 PLAC 标签', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
2 PLAC 北京
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].birthPlace).toBe('北京');
    });

    it('应处理 OCCU 标签', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 OCCU 教师
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].occupation).toBe('教师');
    });

    it('应处理 NOTE 标签', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 NOTE 家族中的长子
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].note).toBe('家族中的长子');
    });

    it('应处理 FAMS 和 FAMC 标签', () => {
      const gedcomContent = `
0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.5
1 CHAR UTF-8
0 @I0001@ INDI
1 NAME 测试
1 SEX M
1 FAMS @F0001@
0 @F0001@ FAM
1 WIFE @I0001@
0 TRLR
      `.trim();

      const result = parseGedcom(gedcomContent);

      expect(result.success).toBe(true);
      expect(result.individuals[0].spouseFamilyIds).toContain('@F0001@');
    });
  });
});
