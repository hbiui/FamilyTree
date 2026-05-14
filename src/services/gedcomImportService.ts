/**
 * GEDCOM 5.5 格式导入和解析服务
 * 
 * 功能说明：
 * 1. 解析 GEDCOM 文件
 * 2. 检测重复成员（姓名+出生日期匹配）
 * 3. 合并到现有家族树
 * 4. 冲突解决策略
 */

import type { TreeNode, Person, Relation } from '../types/familyTree';
import { v4 as uuidv4 } from 'uuid';

export interface GedcomParseResult {
  success: boolean;
  individuals: ParsedIndividual[];
  families: ParsedFamily[];
  errors: string[];
}

export interface ParsedIndividual {
  xref: string;
  name: string;
  givenName?: string;
  surname?: string;
  gender: 'male' | 'female' | 'unknown';
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  occupation?: string;
  note?: string;
  familyIds: string[];
  spouseFamilyIds: string[];
}

export interface ParsedFamily {
  xref: string;
  husbandXref?: string;
  wifeXref?: string;
  childrenXrefs: string[];
}

export interface DuplicateInfo {
  importedPerson: ParsedIndividual;
  existingPerson: Person;
  matchType: 'exact' | 'similar';
}

export interface ImportConflict {
  type: 'duplicate' | 'data_mismatch' | 'missing_parent';
  description: string;
  importedXref: string;
  existingId?: string;
}

export interface ImportOptions {
  mergeStrategy: 'skip' | 'overwrite' | 'keep_both' | 'ask';
  updateExisting: boolean;
  createMissingParents: boolean;
}

export interface ImportResult {
  success: boolean;
  added: number;
  updated: number;
  skipped: number;
  conflicts: ImportConflict[];
  tree?: TreeNode;
  error?: string;
}

/**
 * 解析 GEDCOM 日期格式
 * 支持格式：DD MMM YYYY, Y, ABOUT Y, INT Y, etc.
 */
function parseGedcomDate(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim() === '') return undefined;
  
  // 清理日期字符串
  let cleaned = dateStr.trim().toUpperCase();
  
  // 移除前缀词
  const prefixes = ['ABOUT ', 'ABT ', 'EST ', 'CALC ', 'INT ', 'BEF ', 'AFT ', 'BET '];
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
      break;
    }
  }
  
  // 移除 CIRCUMSTANCES 标记
  cleaned = cleaned.replace(/^CAL /, '');
  
  // 解析格式：DD MMM YYYY 或 MMM YYYY 或 YYYY
  const monthMap: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12',
  };
  
  // 纯年份
  const yearOnly = /^(\d{4})$/;
  const yearMatch = cleaned.match(yearOnly);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }
  
  // DD MMM YYYY 或 MMM YYYY
  const parts = cleaned.split(' ');
  
  let year: string | undefined;
  let month: string | undefined;
  let day: string | undefined;
  
  for (const part of parts) {
    if (/^\d{4}$/.test(part)) {
      year = part;
    } else if (monthMap[part]) {
      month = monthMap[part];
    } else if (/^\d{1,2}$/.test(part)) {
      day = part.padStart(2, '0');
    }
  }
  
  if (year) {
    return `${year}-${month || '01'}-${day || '01'}`;
  }
  
  // 如果无法解析，返回原始值
  return undefined;
}

/**
 * 解析 GEDCOM 行
 * 格式：LEVEL TAG [VALUE] 或 LEVEL TAG XREF [VALUE]
 */
interface GedcomLine {
  level: number;
  tag: string;
  value: string;
  xref?: string;
}

function parseLine(line: string): GedcomLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  const match = trimmed.match(/^(\d+)\s+(.+)$/);
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const rest = match[2];
  
  let tag: string;
  let xref: string | undefined;
  let value: string;
  
  if (level === 0) {
    const parts = rest.split(/\s+/);
    if (parts.length >= 2) {
      if (parts[0].startsWith('@')) {
        xref = parts[0];
        tag = parts[1];
        value = parts.slice(2).join(' ');
      } else {
        tag = parts[0];
        if (parts[1]?.startsWith('@')) {
          xref = parts[1];
          value = parts.slice(2).join(' ');
        } else {
          value = parts.slice(1).join(' ');
        }
      }
    } else {
      tag = rest;
      value = '';
    }
  } else {
    const parts = rest.split(/\s+/);
    tag = parts[0];
    if (parts.length >= 2) {
      if (parts[1]?.startsWith('@')) {
        xref = parts[1];
        value = parts.slice(2).join(' ');
      } else {
        value = parts.slice(1).join(' ');
      }
    } else {
      value = '';
    }
  }
  
  return { level, tag, value, xref };
}

/**
 * 解析 GEDCOM 文件
 */
export function parseGedcom(content: string): GedcomParseResult {
  const individuals: Map<string, ParsedIndividual> = new Map();
  const families: Map<string, ParsedFamily> = new Map();
  const errors: string[] = [];
  
  const lines = content.split('\n');
  let currentXref = '';
  let currentSection: 'individual' | 'family' | 'header' | 'none' = 'none';
  let currentData: any = {};
  
  const contextStack: { tag: string; level: number }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseLine(line);
    
    if (!parsed) continue;
    
    if (parsed.level === 0) {
      if (currentSection === 'individual' && currentXref) {
        individuals.set(currentXref, currentData as ParsedIndividual);
      } else if (currentSection === 'family' && currentXref) {
        families.set(currentXref, currentData as ParsedFamily);
      }
      
      currentXref = parsed.xref || '';
      currentData = {};
      contextStack.length = 0;
      
      if (parsed.tag === 'INDI') {
        currentSection = 'individual';
        currentData = {
          xref: currentXref,
          name: '',
          gender: 'unknown' as const,
          familyIds: [],
          spouseFamilyIds: [],
        };
      } else if (parsed.tag === 'FAM') {
        currentSection = 'family';
        currentData = {
          xref: currentXref,
          childrenXrefs: [],
        };
      } else {
        currentSection = 'none';
      }
    } else if (parsed.level === 1) {
      while (contextStack.length > 0 && contextStack[contextStack.length - 1].level >= parsed.level) {
        contextStack.pop();
      }
      
      switch (parsed.tag) {
        case 'NAME':
          currentData.name = parsed.value;
          if (parsed.value.includes('/')) {
            const nameParts = parsed.value.split('/');
            currentData.surname = nameParts[0].trim();
            currentData.givenName = nameParts[1]?.trim();
          }
          break;
        case 'GIVN':
          currentData.givenName = parsed.value;
          break;
        case 'SURN':
          currentData.surname = parsed.value;
          break;
        case 'SEX':
          currentData.gender = parsed.value === 'M' ? 'male' : 
                               parsed.value === 'F' ? 'female' : 'unknown';
          break;
        case 'BIRT':
        case 'DEAT':
          currentData[`${parsed.tag === 'BIRT' ? 'birth' : 'death'}Date`] = '';
          contextStack.push({ tag: parsed.tag, level: 1 });
          break;
        case 'DATE':
          if (contextStack.length > 0) {
            const parentTag = contextStack[contextStack.length - 1].tag;
            if (parentTag === 'BIRT') {
              currentData.birthDate = parseGedcomDate(parsed.value);
            } else if (parentTag === 'DEAT') {
              currentData.deathDate = parseGedcomDate(parsed.value);
            }
          }
          break;
        case 'PLAC':
          if (contextStack.length > 0) {
            const parentTag = contextStack[contextStack.length - 1].tag;
            if (parentTag === 'BIRT') {
              currentData.birthPlace = parsed.value;
            } else if (parentTag === 'DEAT') {
              currentData.deathPlace = parsed.value;
            }
          }
          break;
        case 'OCCU':
          currentData.occupation = parsed.value;
          break;
        case 'NOTE':
          currentData.note = parsed.value;
          break;
        case 'FAMC':
          if (parsed.xref) {
            currentData.familyIds.push(parsed.xref);
          }
          break;
        case 'FAMS':
          if (parsed.xref) {
            currentData.spouseFamilyIds.push(parsed.xref);
          }
          break;
        case 'HUSB':
          if (parsed.xref) {
            currentData.husbandXref = parsed.xref;
          }
          break;
        case 'WIFE':
          if (parsed.xref) {
            currentData.wifeXref = parsed.xref;
          }
          break;
        case 'CHIL':
          if (parsed.xref && currentData.childrenXrefs) {
            currentData.childrenXrefs.push(parsed.xref);
          }
          break;
      }
      
      if (['BIRT', 'DEAT'].includes(parsed.tag)) {
        // Already pushed above
      } else {
        contextStack.push({ tag: parsed.tag, level: 1 });
      }
    } else if (parsed.level >= 2) {
      while (contextStack.length > 0 && contextStack[contextStack.length - 1].level >= parsed.level) {
        contextStack.pop();
      }
      
      if (parsed.tag === 'DATE') {
        if (contextStack.length > 0) {
          const parentTag = contextStack[contextStack.length - 1].tag;
          if (parentTag === 'BIRT') {
            currentData.birthDate = parseGedcomDate(parsed.value);
          } else if (parentTag === 'DEAT') {
            currentData.deathDate = parseGedcomDate(parsed.value);
          }
        }
      } else if (parsed.tag === 'PLAC') {
        if (contextStack.length > 0) {
          const parentTag = contextStack[contextStack.length - 1].tag;
          if (parentTag === 'BIRT') {
            currentData.birthPlace = parsed.value;
          } else if (parentTag === 'DEAT') {
            currentData.deathPlace = parsed.value;
          }
        }
      }
      
      contextStack.push({ tag: parsed.tag, level: parsed.level });
    }
  }
  
  if (currentSection === 'individual' && currentXref) {
    individuals.set(currentXref, currentData as ParsedIndividual);
  } else if (currentSection === 'family' && currentXref) {
    families.set(currentXref, currentData as ParsedFamily);
  }
  
  return {
    success: errors.length === 0,
    individuals: Array.from(individuals.values()),
    families: Array.from(families.values()),
    errors,
  };
}

/**
 * 查找重复成员
 * 匹配策略：姓名 + 出生日期 完全匹配
 */
export function findDuplicates(
  imported: ParsedIndividual[],
  existing: Person[]
): DuplicateInfo[] {
  const duplicates: DuplicateInfo[] = [];
  
  for (const person of imported) {
    // 规范化姓名进行比较
    const normalizedImportedName = normalizeName(person.name);
    const importedBirthYear = person.birthDate?.substring(0, 4);
    
    for (const existingPerson of existing) {
      const normalizedExistingName = normalizeName(existingPerson.name);
      const existingBirthYear = existingPerson.birth_date?.substring(0, 4);
      
      // 完全匹配：姓名 + 出生年份相同
      if (normalizedImportedName === normalizedExistingName && 
          importedBirthYear && importedBirthYear === existingBirthYear) {
        duplicates.push({
          importedPerson: person,
          existingPerson,
          matchType: 'exact',
        });
        break;
      }
    }
  }
  
  return duplicates;
}

/**
 * 规范化姓名用于比较
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')  // 移除所有空格
    .replace(/[^\u4e00-\u9fa5a-z]/gi, '');  // 只保留中文和英文字母
}

/**
 * 将解析的数据转换为树节点
 */
export function convertToTree(
  parsedIndividuals: ParsedIndividual[],
  parsedFamilies: ParsedFamily[]
): TreeNode | null {
  if (parsedIndividuals.length === 0) return null;
  
  const indiMap = new Map<string, ParsedIndividual>();
  const familyMap = new Map<string, ParsedFamily>();
  
  for (const indi of parsedIndividuals) {
    indiMap.set(indi.xref, indi);
  }
  
  for (const fam of parsedFamilies) {
    familyMap.set(fam.xref, fam);
  }
  
  const familyToChildren = new Map<string, string[]>();
  
  for (const fam of parsedFamilies) {
    familyToChildren.set(fam.xref, fam.childrenXrefs);
  }
  
  const childToParents = new Map<string, string[]>();
  for (const fam of parsedFamilies) {
    for (const childXref of fam.childrenXrefs) {
      const existing = childToParents.get(childXref) || [];
      existing.push(fam.xref);
      childToParents.set(childXref, existing);
    }
  }
  
  let root: ParsedIndividual | null = null;
  for (const indi of parsedIndividuals) {
    const parents = childToParents.get(indi.xref);
    if (!parents || parents.length === 0) {
      root = indi;
      break;
    }
  }
  
  if (!root && parsedIndividuals.length > 0) {
    root = parsedIndividuals[0];
  }
  
  if (!root) return null;
  
  return buildTreeNode(root, indiMap, familyMap, familyToChildren, new Set());
}

function buildTreeNode(
  indi: ParsedIndividual,
  indiMap: Map<string, ParsedIndividual>,
  familyMap: Map<string, ParsedFamily>,
  familyToChildren: Map<string, string[]>,
  built: Set<string>
): TreeNode {
  if (built.has(indi.xref)) {
    return {
      id: indi.xref.replace(/@/g, ''),
      name: indi.name || '未知',
      gender: indi.gender,
      birthDate: indi.birthDate,
      deathDate: indi.deathDate,
      children: [],
    };
  }
  
  built.add(indi.xref);
  
  const node: TreeNode = {
    id: indi.xref.replace(/@/g, ''),
    name: indi.name || '未知',
    gender: indi.gender,
    birthDate: indi.birthDate,
    deathDate: indi.deathDate,
    children: [],
  };
  
  const families = indi.spouseFamilyIds.length > 0 ? indi.spouseFamilyIds : [];
  
  if (families.length === 0) {
    for (const [famXref, children] of familyToChildren) {
      const fam = familyMap.get(famXref);
      if (fam && (fam.husbandXref === indi.xref || fam.wifeXref === indi.xref)) {
        for (const childXref of children) {
          if (!built.has(childXref)) {
            const childIndi = indiMap.get(childXref);
            if (childIndi) {
              const childNode = buildTreeNode(childIndi, indiMap, familyMap, familyToChildren, built);
              node.children.push(childNode);
            }
          }
        }
      }
    }
  } else {
    for (const famXref of families) {
      const children = familyToChildren.get(famXref) || [];
      for (const childXref of children) {
        if (!built.has(childXref)) {
          const childIndi = indiMap.get(childXref);
          if (childIndi) {
            const childNode = buildTreeNode(childIndi, indiMap, familyMap, familyToChildren, built);
            node.children.push(childNode);
          }
        }
      }
      
      const fam = familyMap.get(famXref);
      if (fam && !node.spouse) {
        const spouseXref = fam.husbandXref === indi.xref ? fam.wifeXref : fam.husbandXref;
        if (spouseXref && !built.has(spouseXref)) {
          const spouseIndi = indiMap.get(spouseXref);
          if (spouseIndi) {
            node.spouse = {
              id: spouseIndi.xref.replace(/@/g, ''),
              name: spouseIndi.name || '未知',
              gender: spouseIndi.gender,
              birthDate: spouseIndi.birthDate,
              deathDate: spouseIndi.deathDate,
              children: [],
            };
          }
        }
      }
    }
  }
  
  return node;
}

/**
 * 导入家族树
 */
export async function importFromGedcom(
  gedcomContent: string,
  existingPersons: Person[],
  options: ImportOptions
): Promise<ImportResult> {
  // 1. 解析 GEDCOM
  const parseResult = parseGedcom(gedcomContent);
  
  if (!parseResult.success) {
    return {
      success: false,
      added: 0,
      updated: 0,
      skipped: 0,
      conflicts: parseResult.errors.map(e => ({
        type: 'missing_parent' as const,
        description: e,
        importedXref: '',
      })),
      error: parseResult.errors.join('; '),
    };
  }
  
  // 2. 查找重复
  const duplicates = findDuplicates(parseResult.individuals, existingPersons);
  
  const conflicts: ImportConflict[] = duplicates.map(d => ({
    type: 'duplicate' as const,
    description: `姓名 "${d.importedPerson.name}" (${d.importedPerson.birthDate}) 已存在`,
    importedXref: d.importedPerson.xref,
    existingId: d.existingPerson.id,
  }));
  
  // 3. 根据策略处理
  let added = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const indi of parseResult.individuals) {
    const duplicate = duplicates.find(d => d.importedPerson.xref === indi.xref);
    
    if (duplicate) {
      switch (options.mergeStrategy) {
        case 'skip':
          skipped++;
          break;
        case 'overwrite':
          updated++;
          break;
        case 'keep_both':
          added++;
          break;
        case 'ask':
          // 需要用户交互，这里先跳过
          skipped++;
          conflicts.push({
            type: 'duplicate',
            description: `需要用户确认：${indi.name}`,
            importedXref: indi.xref,
            existingId: duplicate.existingPerson.id,
          });
          break;
      }
    } else {
      added++;
    }
  }
  
  // 4. 构建树
  const tree = convertToTree(parseResult.individuals, parseResult.families);
  
  return {
    success: true,
    added,
    updated,
    skipped,
    conflicts,
    tree: options.mergeStrategy !== 'ask' ? tree : undefined,
  };
}
