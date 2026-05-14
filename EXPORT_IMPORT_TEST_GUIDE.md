# 家族树导出导入功能测试指南

## 目录

1. [功能概述](#功能概述)
2. [GEDCOM 导出测试](#gedcom-导出测试)
3. [GEDCOM 导入测试](#gedcom-导入测试)
4. [PDF 导出测试](#pdf-导出测试)
5. [云端备份测试](#云端备份测试)
6. [备份恢复测试](#备份恢复测试)

---

## 功能概述

### 已实现功能

| 功能模块 | 文件位置 | 说明 |
|---------|---------|------|
| GEDCOM 导出 | `src/services/gedcomService.ts` | 生成 GEDCOM 5.5.5 格式文件 |
| GEDCOM 导入 | `src/services/gedcomImportService.ts` | 解析 GEDCOM 并支持去重合并 |
| PDF 导出 | `src/services/pdfExportService.ts` | 生成族谱图和成员列表 PDF |
| 云端备份 | `src/services/cloudBackupService.ts` | 本地备份和云端分享 |

---

## GEDCOM 导出测试

### 1. 导出功能验证

**测试目标**: 验证 GEDCOM 5.5.5 格式导出正确性

**前置条件**:
- 已创建家族树数据
- 至少包含 3 代成员

**测试步骤**:

```bash
# 1. 运行测试
npm test -- --testPathPattern=gedcom

# 2. 生成示例 GEDCOM 文件
node -e "
const { generateGedcomSample } = require('./src/services/gedcomService.ts');
console.log(generateGedcomSample());
"
```

**验收检查点**:

| 检查项 | 预期结果 | 验证方法 |
|-------|---------|---------|
| 文件头 (HEAD) | 包含 SOUR、VERS、GEDC 等标签 | 查看文件前 10 行 |
| 编码格式 | UTF-8 | 使用 `file -i` 或文本编辑器查看 |
| 版本号 | 5.5.5 | 检查 HEAD 中的 VERS 字段 |
| 个人记录 (INDI) | 每位成员对应一条记录 | 统计 INDI 出现次数 |
| 家族记录 (FAM) | 每对夫妻对应一条记录 | 统计 FAM 出现次数 |
| 尾部 (TRLR) | 文件以 0 TRLR 结尾 | 查看文件最后一行 |

### 2. GEDCOM 示例文件内容

**示例输出格式**:

```
0 HEAD
1 SOUR FamilyTree App
2 NAME FamilyTree
2 VERS 1.0.0
1 DEST ANSTFILE
1 DATE 01 JAN 2025
2 TIME 12:00:00
1 FILE 王氏家族_2025-01-01.ged
1 GEDC
2 VERS 5.5.5
2 FORM LINEAGE-LINKED
1 CHAR UTF-8

0 @I0001@ INDI
1 NAME 王德明
2 GIVN 德明
2 SURN 王
1 SEX M
1 BIRT
2 DATE 10 MAR 1920
1 DEAT Y
2 DATE 25 DEC 2005

0 @I0002@ INDI
1 NAME 陈秀兰
2 GIVN 秀兰
2 SURN 陈
1 SEX F
1 BIRT
2 DATE 20 JUL 1922
1 DEAT Y
2 DATE 15 MAY 2010

0 @F0001@ FAM
1 HUSB @I0001@
1 WIFE @I0002@
1 CHIL @I0003@

0 @I0003@ INDI
1 NAME 王建国
2 GIVN 建国
2 SURN 王
1 SEX M
1 BIRT
2 DATE 05 NOV 1950

0 TRLR
```

### 3. 数据完整性验证

```typescript
// 测试脚本: verify_gedcom_completeness.ts
import { exportToGedcom } from './src/services/gedcomService';
import { parseGedcom } from './src/services/gedcomImportService';

function verifyExportImportCycle(tree: TreeNode) {
  // 1. 导出
  const exported = exportToGedcom(tree, { familyName: '测试家族' });
  console.log('导出成功:', exported.success);
  
  // 2. 解析
  const parsed = parseGedcom(exported.content);
  console.log('解析成功:', parsed.success);
  console.log('成员数量:', parsed.individuals.length);
  console.log('家族数量:', parsed.families.length);
  
  // 3. 验证一致性
  const originalNodes = flattenTreeNodes(tree);
  console.log('原始节点数:', originalNodes.length);
  console.log('导出后节点数:', parsed.individuals.length);
  
  return originalNodes.length === parsed.individuals.length;
}
```

---

## GEDCOM 导入测试

### 1. 基本导入测试

**测试目标**: 验证从 GEDCOM 文件正确解析并重建家族树

**测试数据**: 使用上述示例 GEDCOM 文件

**测试步骤**:

```bash
# 运行导入测试
npm test -- --testPathPattern=gedcomImport
```

**验收检查点**:

| 检查项 | 预期结果 |
|-------|---------|
| 成员姓名 | 与原文件一致 |
| 出生日期 | 正确解析 DD MMM YYYY 格式 |
| 性别 | M → male, F → female |
| 配偶关系 | 正确匹配 |
| 子女关系 | 正确建立 |

### 2. 去重逻辑测试

**测试目标**: 验证姓名+出生日期匹配的去重功能

**测试场景**:

```typescript
describe('GEDCOM 导入去重测试', () => {
  it('应正确识别完全匹配的重复成员', () => {
    const imported: ParsedIndividual[] = [
      { xref: '@I0001@', name: '王德明', gender: 'male', birthDate: '1920-03-10', familyIds: [], spouseFamilyIds: [] }
    ];
    
    const existing: Person[] = [
      { id: 'existing-1', name: '王德明', gender: 'male', birth_date: '1920-03-10', /* ... */ } as Person
    ];
    
    const duplicates = findDuplicates(imported, existing);
    
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('exact');
  });
  
  it('应区分姓名相同但出生日期不同的成员', () => {
    const imported: ParsedIndividual[] = [
      { xref: '@I0001@', name: '王建国', gender: 'male', birthDate: '1950-11-05', familyIds: [], spouseFamilyIds: [] }
    ];
    
    const existing: Person[] = [
      { id: 'existing-1', name: '王建国', gender: 'male', birth_date: '1955-05-15', /* ... */ } as Person
    ];
    
    const duplicates = findDuplicates(imported, existing);
    
    expect(duplicates).toHaveLength(0); // 出生年份不同，不应匹配
  });
  
  it('应正确处理中文姓名的空格差异', () => {
    const imported: ParsedIndividual[] = [
      { xref: '@I0001@', name: '王 德明', gender: 'male', birthDate: '1920-03-10', familyIds: [], spouseFamilyIds: [] }
    ];
    
    const existing: Person[] = [
      { id: 'existing-1', name: '王德明', gender: 'male', birth_date: '1920-03-10', /* ... */ } as Person
    ];
    
    const duplicates = findDuplicates(imported, existing);
    
    expect(duplicates).toHaveLength(1); // 空格应被规范化处理
  });
});
```

### 3. 合并策略测试

**测试目标**: 验证不同合并策略的正确行为

```typescript
describe('GEDCOM 合并策略测试', () => {
  const testGedcom = `
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
  
  const existingPerson = {
    id: 'existing-1',
    name: '王德明',
    gender: 'male' as const,
    birth_date: '1920-03-10',
    family_id: 'fam-1',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  it('skip 策略应跳过重复成员', async () => {
    const result = await importFromGedcom(testGedcom, [existingPerson], {
      mergeStrategy: 'skip',
      updateExisting: false,
      createMissingParents: false,
    });
    
    expect(result.success).toBe(true);
    expect(result.added).toBe(0);
    expect(result.skipped).toBe(1);
  });
  
  it('keep_both 策略应创建新成员', async () => {
    const result = await importFromGedcom(testGedcom, [existingPerson], {
      mergeStrategy: 'keep_both',
      updateExisting: false,
      createMissingParents: false,
    });
    
    expect(result.success).toBe(true);
    expect(result.added).toBe(1);
  });
  
  it('overwrite 策略应标记为更新', async () => {
    const result = await importFromGedcom(testGedcom, [existingPerson], {
      mergeStrategy: 'overwrite',
      updateExisting: true,
      createMissingParents: false,
    });
    
    expect(result.success).toBe(true);
    expect(result.updated).toBe(1);
  });
});
```

### 4. 跨家族导入验收步骤

**场景**: 将导出的 GEDCOM 文件导入到全新的家族中

**验收步骤**:

```
步骤 1: 准备测试数据
├── 在家族 A 中创建 3 代成员
├── 导出 GEDCOM 文件: family_A.ged
└── 记录成员数量 N

步骤 2: 清空并重建
├── 删除家族 A 所有数据（或使用家族 B）
└── 创建空家族

步骤 3: 导入 GEDCOM
├── 选择 family_A.ged
├── 选择合并策略: keep_both
└── 执行导入

步骤 4: 验证结果
├── 检查成员数量是否 = N
├── 验证各代关系是否正确
├── 验证配偶关系是否完整
└── 验证出生日期是否正确

步骤 5: 数据一致性检查
├── 选择任意成员查看详情
├── 验证其父母、配偶、子女信息
└── 抽查 3-5 个成员的关系链
```

---

## PDF 导出测试

### 1. PDF 族谱图测试

**测试目标**: 验证族谱图 PDF 生成正确性

**测试步骤**:

```typescript
describe('PDF 族谱图导出测试', () => {
  const sampleTree: TreeNode = {
    id: 'root',
    name: '王德明',
    gender: 'male',
    birthDate: '1920-03-10',
    spouse: {
      id: 'spouse-1',
      name: '陈秀兰',
      gender: 'female',
      birthDate: '1922-07-20',
      children: [],
    },
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
  
  it('应成功生成 PDF 文件', async () => {
    const result = await exportToPdf(sampleTree, {
      title: '王氏家族族谱',
      familyName: '王氏',
      author: '测试用户',
      orientation: 'landscape',
      paperSize: 'A4',
    });
    
    expect(result.success).toBe(true);
    expect(result.uri).toBeDefined();
  });
  
  it('PDF 文件应为 .pdf 格式', async () => {
    const result = await exportToPdf(sampleTree, {
      title: '测试',
      familyName: '测试',
    });
    
    expect(result.uri?.endsWith('.pdf')).toBe(true);
  });
});
```

**PDF 输出描述**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              王氏家族族谱                             │   │
│  │              王氏家族                                │   │
│  │              编纂者：测试用户                         │   │
│  │              导出日期：2025-01-01                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  图例:  ● 男性(蓝色)  ● 女性(红色)  ● 未知(灰色)      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                         ┌──────────┐                        │
│                         │ 王德明    │                        │
│                         │ 1920.3.10│                        │
│                         └──────────┘                        │
│                              │                              │
│              ┌───────────────┴───────────────┐              │
│              │                               │              │
│         ┌──────────┐                    ┌──────────┐       │
│         │ 陈秀兰    │                    │ 王建国    │       │
│         │ 1922.7.20│                    │ 1950.11.5│       │
│         └──────────┘                    └──────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  共 3 代                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  本族谱由家族树 App 生成                                      │
│  仅供家族内部使用                                            │
└─────────────────────────────────────────────────────────────┘
```

### 2. 成员列表 PDF 测试

```typescript
it('应生成成员列表 PDF', async () => {
  const persons: Person[] = [
    { id: '1', name: '王德明', gender: 'male', birth_date: '1920-03-10', /* ... */ } as Person,
    { id: '2', name: '陈秀兰', gender: 'female', birth_date: '1922-07-20', /* ... */ } as Person,
  ];
  
  const result = await generateMemberListPdf(persons, '王氏');
  
  expect(result.success).toBe(true);
  expect(result.uri?.endsWith('.pdf')).toBe(true);
});
```

---

## 云端备份测试

### 1. 本地备份测试

**测试目标**: 验证本地备份文件创建正确性

```typescript
describe('本地备份测试', () => {
  const testFamilyId = 'test-family-001';
  const testFamilyName = '王氏测试';
  const testPersons: Person[] = [
    { id: 'p1', name: '王德明', gender: 'male', birth_date: '1920-03-10', family_id: testFamilyId, created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Person,
  ];
  const testRelations: Relation[] = [];
  
  it('应创建备份文件', async () => {
    const result = await createLocalBackup(testFamilyId, testFamilyName, testPersons, testRelations);
    
    expect(result.success).toBe(true);
    expect(result.backupId).toBeDefined();
    expect(result.filePath).toBeDefined();
  });
  
  it('应生成 JSON 和 GEDCOM 两种格式', async () => {
    const result = await createLocalBackup(testFamilyId, testFamilyName, testPersons, testRelations);
    
    const jsonPath = result.filePath!;
    const gedcomPath = jsonPath.replace('.json', '.ged');
    
    const jsonExists = await FileSystem.getInfoAsync(jsonPath);
    const gedcomExists = await FileSystem.getInfoAsync(gedcomPath);
    
    expect(jsonExists.exists).toBe(true);
    expect(gedcomExists.exists).toBe(true);
  });
  
  it('应更新备份索引', async () => {
    const result = await createLocalBackup(testFamilyId, testFamilyName, testPersons, testRelations);
    
    const backups = await getBackupList();
    
    expect(backups.length).toBeGreaterThan(0);
    expect(backups[0].id).toBe(result.backupId);
  });
});
```

### 2. 备份统计测试

```typescript
it('应正确统计备份信息', async () => {
  // 创建测试备份
  await createLocalBackup('fam1', '家族1', [], []);
  await createLocalBackup('fam2', '家族2', [], []);
  
  const stats = await getBackupStats();
  
  expect(stats.totalBackups).toBeGreaterThanOrEqual(2);
  expect(stats.oldestBackup).toBeDefined();
  expect(stats.newestBackup).toBeDefined();
});
```

### 3. iCloud 备份测试

**前置条件**:
- 设备已登录 iCloud 账号（iOS）
- 已授予文件访问权限

```typescript
describe('iCloud 备份测试', () => {
  it('应复制备份文件到 iCloud', async () => {
    const result = await backupToIcloud('test-fam', '测试家族', [], []);
    
    // 注意: 在模拟器或无 iCloud 设备上可能失败
    if (result.success) {
      expect(result.filePath).toContain('iCloud');
    }
  });
});
```

### 4. 云端分享测试

```typescript
describe('云端分享测试', () => {
  it('应使用系统分享功能', async () => {
    const result = await shareToCloud('test-fam', '测试家族', [], []);
    
    // 注意: 在 Web 平台可能不可用
    expect(result.success).toBe(true);
    expect(result.filePath).toBeDefined();
  });
});
```

---

## 备份恢复测试

### 1. 从文件恢复测试

```typescript
describe('备份恢复测试', () => {
  const validBackupData: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    family: { id: 'fam-1', name: '测试家族' },
    persons: [
      { id: 'p1', name: '王德明', gender: 'male', birth_date: '1920-03-10', family_id: 'fam-1', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Person,
    ],
    relations: [],
  };
  
  it('应正确解析有效的备份文件', async () => {
    // 创建临时测试文件
    const testPath = `${FileSystem.cacheDirectory}test_backup.json`;
    await FileSystem.writeAsStringAsync(testPath, JSON.stringify(validBackupData));
    
    const result = await restoreFromFile(testPath);
    
    expect(result.success).toBe(true);
    expect(result.data?.family.name).toBe('测试家族');
    expect(result.data?.persons).toHaveLength(1);
    
    // 清理
    await FileSystem.deleteAsync(testPath, { idempotent: true });
  });
  
  it('应拒绝无效的备份文件', async () => {
    const testPath = `${FileSystem.cacheDirectory}invalid_backup.json`;
    await FileSystem.writeAsStringAsync(testPath, '{ invalid json }');
    
    const result = await restoreFromFile(testPath);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    await FileSystem.deleteAsync(testPath, { idempotent: true });
  });
});
```

### 2. 备份验证测试

```typescript
describe('备份验证测试', () => {
  const validBackup: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    family: { id: 'fam-1', name: '测试家族' },
    persons: [
      { id: 'p1', name: '王德明', gender: 'male', family_id: 'fam-1', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Person,
    ],
    relations: [],
  };
  
  it('应验证有效备份', async () => {
    const testPath = `${FileSystem.cacheDirectory}valid_backup.json`;
    await FileSystem.writeAsStringAsync(testPath, JSON.stringify(validBackup));
    
    const validation = await validateBackup(testPath);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    
    await FileSystem.deleteAsync(testPath, { idempotent: true });
  });
  
  it('应检测版本不匹配警告', async () => {
    const oldBackup = { ...validBackup, version: '0.9.0' };
    const testPath = `${FileSystem.cacheDirectory}old_backup.json`;
    await FileSystem.writeAsStringAsync(testPath, JSON.stringify(oldBackup));
    
    const validation = await validateBackup(testPath);
    
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.some(w => w.includes('版本'))).toBe(true);
    
    await FileSystem.deleteAsync(testPath, { idempotent: true });
  });
});
```

### 3. 完整恢复流程测试

```typescript
describe('完整恢复流程测试', () => {
  it('应成功执行完整备份-恢复周期', async () => {
    // 1. 创建备份
    const originalPersons: Person[] = [
      { id: 'p1', name: '王德明', gender: 'male', birth_date: '1920-03-10', family_id: 'fam-1', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Person,
      { id: 'p2', name: '王建国', gender: 'male', birth_date: '1950-11-05', family_id: 'fam-1', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Person,
    ];
    const originalRelations: Relation[] = [];
    
    const backupResult = await createLocalBackup('fam-1', '王氏', originalPersons, originalRelations);
    expect(backupResult.success).toBe(true);
    
    // 2. 读取备份文件
    const restored = await restoreFromFile(backupResult.filePath!);
    expect(restored.success).toBe(true);
    expect(restored.data?.persons).toHaveLength(2);
    
    // 3. 验证数据一致性
    expect(restored.data?.persons[0].name).toBe('王德明');
    expect(restored.data?.persons[1].name).toBe('王建国');
    
    // 4. 清理
    await deleteBackup(backupResult.backupId!);
    const backups = await getBackupList();
    expect(backups.some(b => b.id === backupResult.backupId)).toBe(false);
  });
});
```

---

## 集成测试场景

### 场景 1: 跨平台数据迁移

```
测试目标: 验证从 App A 导出的数据可导入到 App B

步骤:
1. 在 App A 中创建完整家族树（3 代 + 10+ 成员）
2. 导出 GEDCOM 文件
3. 卸载 App A，安装 App B
4. 在 App B 中创建新家族
5. 导入 GEDCOM 文件
6. 验证所有数据完整

检查点:
✓ 成员数量一致
✓ 关系结构一致
✓ 日期格式正确
✓ 中文显示正常
```

### 场景 2: 数据容灾恢复

```
测试目标: 验证从备份恢复后数据完整性

步骤:
1. 创建包含所有关系类型的测试家族
2. 执行本地备份
3. 模拟数据丢失（删除所有成员）
4. 从备份恢复
5. 验证数据完整性

检查点:
✓ 父子关系正确
✓ 配偶关系正确
✓ 三代以内关系正确
✓ 备注信息完整
```

### 场景 3: 批量导入去重

```
测试目标: 验证大批量数据导入时的去重效率

步骤:
1. 准备包含 100+ 成员的 GEDCOM 文件
2. 其中 50 个成员与现有数据重复
3. 执行导入，设置 mergeStrategy: 'skip'
4. 验证只导入 50 个新成员
5. 验证处理时间 < 5 秒

检查点:
✓ 正确识别 50 个重复
✓ 正确导入 50 个新成员
✓ 执行时间可接受
```

---

## 测试运行指南

### 运行所有测试

```bash
cd /workspace/FamilyTree
npm test
```

### 运行特定模块测试

```bash
# GEDCOM 导出测试
npm test -- --testPathPattern=gedcomService

# GEDCOM 导入测试
npm test -- --testPathPattern=gedcomImportService

# PDF 导出测试
npm test -- --testPathPattern=pdfExportService

# 云端备份测试
npm test -- --testPathPattern=cloudBackupService
```

### 生成测试覆盖率报告

```bash
npm test -- --coverage
```

### 手动验证步骤

1. **准备测试设备/模拟器**
   ```bash
   # iOS 模拟器
   npx expo run:ios --simulator

   # Android 模拟器
   npx expo run:android
   ```

2. **执行导出操作**
   - 进入任意家族
   - 点击设置 → 导出
   - 选择 GEDCOM/PDF 格式
   - 保存到本地

3. **验证导出文件**
   - 打开文件管理器
   - 找到导出的文件
   - 检查格式和内容

4. **执行导入操作**
   - 进入新家族或空白家族
   - 点击设置 → 导入
   - 选择 GEDCOM 文件
   - 选择合并策略
   - 确认导入

5. **验证导入结果**
   - 检查成员数量
   - 抽查成员详情
   - 验证关系正确性

---

## 已知限制

1. **PDF 导出**
   - 成员照片需要在 PDF 生成时单独处理
   - 超大族谱（100+ 代）可能需要分页

2. **GEDCOM 导入**
   - 不支持 GEDCOM 5.5.1 之前的版本
   - 部分特殊 GEDCOM 标签可能无法解析

3. **云端备份**
   - iCloud 备份需要 iOS 设备和正确权限
   - Google Drive 备份通过系统分享实现

4. **文档选择器**
   - Web 平台可能不支持某些文件类型
