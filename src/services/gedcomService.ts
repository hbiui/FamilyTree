import type { TreeNode, Person, PrivacyLevel, PersonPrivacy } from '../types/familyTree';
import type { PrivacyOptions } from './privacyService';

export interface GedcomOptions {
  sourceSystem?: string;
  familyName?: string;
  exportDate?: Date;
  privacyFilter?: boolean;
  privacyOptions?: PrivacyOptions;
  encrypt?: boolean;
  password?: string;
}

export interface GedcomExportResult {
  success: boolean;
  content: string;
  fileName: string;
  error?: string;
  encrypted?: boolean;
}

function formatGedcomDate(dateStr?: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

function formatGedcomTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function generateHeader(options: GedcomOptions): string {
  const now = options.exportDate || new Date();
  
  return `0 HEAD
1 SOUR FamilyTree App
2 NAME FamilyTree
2 VERS 1.0.0
1 DEST ANSTFILE
1 DATE ${formatGedcomDate(now.toISOString())}
2 TIME ${formatGedcomTime(now)}
1 FILE ${options.familyName || 'family'}.ged
1 GEDC
2 VERS 5.5.5
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
`;
}

function generateTrailer(): string {
  return '0 TRLR\n';
}

function flattenTreeNodes(root: TreeNode): TreeNode[] {
  const nodes: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    nodes.push(node);
    if (node.spouse) {
      nodes.push(node.spouse);
    }
    for (const child of node.children || []) {
      traverse(child);
    }
  }
  
  traverse(root);
  return nodes;
}

function generateXref(base: string, index: number): string {
  return `@${base}${index.toString().padStart(4, '0')}@`;
}

function generateIndividualRecord(
  node: TreeNode,
  xref: string,
  isSpouse: boolean = false,
  privacyFilter: boolean = false,
  privacyOptions?: PrivacyOptions
): string {
  const lines: string[] = [];
  
  lines.push(`0 ${xref} INDI`);
  
  lines.push(`1 NAME ${node.name}`);
  
  const sex = node.gender === 'male' ? 'M' : node.gender === 'female' ? 'F' : 'U';
  lines.push(`1 SEX ${sex}`);
  
  if (node.birthDate) {
    lines.push('1 BIRT');
    lines.push(`2 DATE ${formatGedcomDate(node.birthDate)}`);
  }
  
  if (node.deathDate) {
    lines.push('1 DEAT Y');
    lines.push(`2 DATE ${formatGedcomDate(node.deathDate)}`);
  } else if (node.deathDate === null && node.deathDate !== undefined) {
  }
  
  return lines.join('\n');
}

function generateFamilyRecord(
  famXref: string,
  husbandXref: string,
  wifeXref: string,
  childrenXrefs: string[]
): string {
  const lines: string[] = [];
  
  lines.push(`0 ${famXref} FAM`);
  
  if (husbandXref) {
    lines.push(`1 HUSB ${husbandXref}`);
  }
  
  if (wifeXref) {
    lines.push(`1 WIFE ${wifeXref}`);
  }
  
  for (const childXref of childrenXrefs) {
    lines.push(`1 CHIL ${childXref}`);
  }
  
  return lines.join('\n');
}

function simpleEncrypt(text: string, password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = encoder.encode(password);
  
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const encrypted = data[i] ^ key[i % key.length];
    result += String.fromCharCode(encrypted);
  }
  
  return btoa(result);
}

function simpleDecrypt(encryptedText: string, password: string): string {
  const decoder = new TextDecoder();
  const data = atob(encryptedText);
  const key = new TextEncoder().encode(password);
  
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data.charCodeAt(i) ^ key[i % key.length];
  }
  
  return decoder.decode(result);
}

export function exportToGedcom(
  tree: TreeNode,
  options: GedcomOptions = {}
): GedcomExportResult {
  try {
    const {
      familyName = 'family',
      exportDate = new Date(),
      privacyFilter = false,
      privacyOptions,
      encrypt = false,
      password,
    } = options;
    
    const lines: string[] = [];
    
    lines.push(generateHeader({
      ...options,
      exportDate,
    }));
    
    const allNodes = flattenTreeNodes(tree);
    const individuals: { node: TreeNode; xref: string; isSpouse: boolean }[] = [];
    const families: {
      xref: string;
      husbandXref?: string;
      wifeXref?: string;
      childrenXrefs: string[];
    }[] = [];
    
    let indiIndex = 1;
    let famIndex = 1;
    
    const nodeToXref = new Map<string, string>();
    const spouseXrefs = new Map<string, string>();
    
    function processNode(node: TreeNode, isSpouseNode: boolean = false): string {
      const key = isSpouseNode ? `${node.id}-spouse` : node.id;
      
      if (nodeToXref.has(key)) {
        return nodeToXref.get(key)!;
      }
      
      const xref = generateXref('I', indiIndex++);
      nodeToXref.set(key, xref);
      spouseXrefs.set(node.id, xref);
      
      individuals.push({
        node,
        xref,
        isSpouse: isSpouseNode,
      });
      
      return xref;
    }
    
    function processTreeNode(node: TreeNode) {
      processNode(node, false);
      
      if (node.spouse) {
        processNode(node.spouse, true);
      }
      
      for (const child of node.children || []) {
        processTreeNode(child);
      }
    }
    
    processTreeNode(tree);
    
    function processFamily(node: TreeNode): string {
      const famXref = generateXref('F', famIndex++);
      
      let husbandXref: string | undefined;
      let wifeXref: string | undefined;
      const childrenXrefs: string[] = [];
      
      if (node.gender === 'male') {
        husbandXref = nodeToXref.get(node.id);
        if (node.spouse) {
          wifeXref = nodeToXref.get(`${node.spouse.id}-spouse`);
        }
      } else if (node.gender === 'female') {
        wifeXref = nodeToXref.get(node.id);
        if (node.spouse) {
          husbandXref = nodeToXref.get(`${node.spouse.id}-spouse`);
        }
      } else {
        husbandXref = nodeToXref.get(node.id);
      }
      
      for (const child of node.children || []) {
        const childXref = nodeToXref.get(child.id);
        if (childXref) {
          childrenXrefs.push(childXref);
          processFamily(child);
        }
      }
      
      families.push({
        xref: famXref,
        husbandXref,
        wifeXref,
        childrenXrefs,
      });
      
      return famXref;
    }
    
    if (tree) {
      processFamily(tree);
    }
    
    lines.push('0 @XREF@ INDI');
    let indiSection = '';
    
    for (const { node, xref, isSpouse } of individuals) {
      indiSection += generateIndividualRecord(node, xref, isSpouse, privacyFilter, privacyOptions) + '\n';
    }
    
    lines[lines.length - 1] = indiSection.trim();
    
    for (const family of families) {
      lines.push(generateFamilyRecord(
        family.xref,
        family.husbandXref || '',
        family.wifeXref || '',
        family.childrenXrefs
      ));
    }
    
    lines.push(generateTrailer());
    
    let content = lines.join('\n').trim();
    
    let encrypted = false;
    if (encrypt && password) {
      content = simpleEncrypt(content, password);
      encrypted = true;
    }
    
    const fileName = `${familyName}_${exportDate.toISOString().split('T')[0]}${encrypted ? '_encrypted' : ''}.ged`;
    
    return {
      success: true,
      content,
      fileName,
      encrypted,
    };
    
  } catch (error) {
    return {
      success: false,
      content: '',
      fileName: '',
      error: error instanceof Error ? error.message : '导出失败',
    };
  }
}

export function generateGedcomSample(): string {
  const sampleTree: TreeNode = {
    id: 'grandpa',
    name: '王德明',
    gender: 'male',
    birthDate: '1920-03-10',
    deathDate: '2005-12-25',
    spouse: {
      id: 'grandma',
      name: '陈秀兰',
      gender: 'female',
      birthDate: '1922-07-20',
      deathDate: '2010-05-15',
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
  
  const result = exportToGedcom(sampleTree, {
    familyName: '王氏家族',
    exportDate: new Date(),
  });
  
  return result.content;
}

export { simpleEncrypt, simpleDecrypt };
