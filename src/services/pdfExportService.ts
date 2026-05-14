/**
 * PDF 族谱图导出服务
 * 
 * 功能说明：
 * 1. 生成高清族谱 PDF 文档
 * 2. 支持横向和纵向布局
 * 3. 包含成员详细信息
 * 4. 生成目录和页码
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import type { TreeNode, Person } from '../types/familyTree';

export interface PdfExportOptions {
  title: string;
  familyName: string;
  author?: string;
  orientation?: 'portrait' | 'landscape';
  includePhotos?: boolean;
  includeGenerations?: boolean;
  paperSize?: 'A4' | 'Letter';
}

export interface PdfExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

interface TreeNodeCard {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  birthDate?: string;
  deathDate?: string;
  generation: number;
  x: number;
  y: number;
  children: TreeNodeCard[];
}

const GENDER_COLORS = {
  male: '#4A90D9',
  female: '#E87878',
  unknown: '#9E9E9E',
};

const CHINESE_MONTHS = [
  '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'
];

function formatChineseDate(dateStr?: string): string {
  if (!dateStr) return '';
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const [, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthStr = CHINESE_MONTHS[monthIndex] || month;
  
  return `农历${monthStr}月${day}日`;
}

function calculateTreePositions(
  node: TreeNode,
  generation: number = 0,
  startX: number = 0,
  positions: Map<string, { x: number; y: number }> = new Map()
): void {
  const nodeWidth = 140;
  const nodeHeight = 80;
  const horizontalGap = 40;
  const verticalGap = 120;
  
  let subtreeWidth = nodeWidth;
  const childPositions: number[] = [];
  
  for (const child of node.children) {
    const childWidth = calculateSubtreeWidth(child, nodeWidth, horizontalGap);
    childPositions.push(subtreeWidth + horizontalGap / 2);
    subtreeWidth += childWidth + horizontalGap;
  }
  
  const totalWidth = subtreeWidth - horizontalGap;
  const nodeX = startX + (totalWidth - nodeWidth) / 2;
  const nodeY = generation * (nodeHeight + verticalGap);
  
  positions.set(node.id, { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight / 2 });
  
  let currentX = startX;
  for (let i = 0; i < node.children.length; i++) {
    const childWidth = calculateSubtreeWidth(node.children[i], nodeWidth, horizontalGap);
    calculateTreePositions(node.children[i], generation + 1, currentX, positions);
    currentX += childWidth + horizontalGap;
  }
  
  if (node.spouse) {
    positions.set(node.spouse.id, { 
      x: nodeX + nodeWidth + horizontalGap / 2, 
      y: nodeY + nodeHeight / 2 
    });
  }
}

function calculateSubtreeWidth(
  node: TreeNode,
  nodeWidth: number,
  horizontalGap: number
): number {
  if (node.children.length === 0) {
    return nodeWidth;
  }
  
  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += calculateSubtreeWidth(child, nodeWidth, horizontalGap) + horizontalGap;
  }
  
  return Math.max(nodeWidth, totalWidth - horizontalGap);
}

function buildCardHtml(
  node: TreeNode,
  spouse: TreeNode | undefined,
  isRoot: boolean = false
): string {
  const cardStyle = (n: TreeNode) => `
    <div style="
      width: 120px;
      min-height: 70px;
      background: white;
      border: 2px solid ${GENDER_COLORS[n.gender]};
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
      page-break-inside: avoid;
    ">
      <div style="
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      ">${n.name}</div>
      ${n.birthDate ? `<div style="font-size: 10px; color: #666;">${n.birthDate}</div>` : ''}
      ${n.deathDate ? `<div style="font-size: 10px; color: #999;">殁 ${n.deathDate}</div>` : ''}
    </div>
  `;

  if (spouse) {
    return `
      <div style="display: flex; gap: 10px; align-items: center;">
        ${cardStyle(node)}
        <div style="
          width: 40px;
          height: 2px;
          background: ${GENDER_COLORS[node.gender]};
        "></div>
        ${cardStyle(spouse)}
      </div>
    `;
  }
  
  return cardStyle(node);
}

function buildTreeHtml(
  node: TreeNode,
  positions: Map<string, { x: number; y: number }>,
  level: number = 0
): string {
  const pos = positions.get(node.id);
  if (!pos) return '';
  
  const lines: string[] = [];
  
  if (node.spouse) {
    const spousePos = positions.get(node.spouse.id);
    if (spousePos) {
      lines.push(`<line x1="${pos.x}" y1="${pos.y}" x2="${spousePos.x}" y2="${spousePos.y}" stroke="#999" stroke-width="2"/>`);
    }
  }
  
  for (const child of node.children) {
    const childPos = positions.get(child.id);
    if (childPos) {
      const parentY = pos.y + 70;
      lines.push(`<line x1="${pos.x}" y1="${parentY}" x2="${childPos.x}" y2="${childPos.y - 70}" stroke="#999" stroke-width="2"/>`);
      lines.push(buildTreeHtml(child, positions, level + 1));
    }
  }
  
  return lines.join('\n');
}

function generateHtmlContent(
  tree: TreeNode,
  options: PdfExportOptions,
  positions: Map<string, { x: number; y: number }>
): string {
  const { title, familyName, author, includeGenerations = true } = options;
  
  let maxX = 0;
  let maxY = 0;
  positions.forEach((pos) => {
    maxX = Math.max(maxX, pos.x + 100);
    maxY = Math.max(maxY, pos.y + 100);
  });
  
  const width = Math.max(maxX + 100, 800);
  const height = maxY + 150;
  
  const cards: string[] = [];
  
  function collectCards(node: TreeNode): void {
    cards.push(buildCardHtml(node, node.spouse));
    node.children.forEach(collectCards);
  }
  collectCards(tree);
  
  const svgLines: string[] = [];
  function collectLines(node: TreeNode): void {
    const pos = positions.get(node.id);
    if (!pos) return;
    
    if (node.spouse) {
      const spousePos = positions.get(node.spouse.id);
      if (spousePos) {
        svgLines.push(`<line x1="${pos.x}" y1="${pos.y}" x2="${spousePos.x}" y2="${spousePos.y}" stroke="#999" stroke-width="2"/>`);
      }
    }
    
    const parentY = pos.y + 70;
    for (const child of node.children) {
      const childPos = positions.get(child.id);
      if (childPos) {
        svgLines.push(`<line x1="${pos.x}" y1="${parentY}" x2="${childPos.x}" y2="${childPos.y - 70}" stroke="#999" stroke-width="2"/>`);
      }
    }
    
    node.children.forEach(collectLines);
  }
  collectLines(tree);
  
  let generationInfo = '';
  if (includeGenerations) {
    const generations = new Map<number, number>();
    positions.forEach((_, id) => {
      // 简化代数统计
    });
    generationInfo = `<p style="margin-top: 20px; color: #666;">共 ${countGenerations(tree)} 代</p>`;
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${options.paperSize || 'A4'} ${options.orientation || 'landscape'};
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 36px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }
    .tree-container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      overflow-x: auto;
    }
    .tree-svg {
      display: block;
      margin: 0 auto;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    .legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 20px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <div class="subtitle">${familyName}家族</div>
      ${author ? `<div class="subtitle" style="margin-top: 10px;">编纂者：${author}</div>` : ''}
      <div class="subtitle" style="margin-top: 10px;">导出日期：${new Date().toLocaleDateString('zh-CN')}</div>
    </div>
    
    <div class="tree-container">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background: ${GENDER_COLORS.male};"></div>
          <span>男性</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: ${GENDER_COLORS.female};"></div>
          <span>女性</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: ${GENDER_COLORS.unknown};"></div>
          <span>未知</span>
        </div>
      </div>
      
      <svg class="tree-svg" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${svgLines.join('\n')}
      </svg>
      
      ${generationInfo}
    </div>
    
    <div class="footer">
      <p>本族谱由家族树 App 生成</p>
      <p>仅供家族内部使用</p>
    </div>
  </div>
</body>
</html>
  `;
}

function countGenerations(node: TreeNode, currentDepth: number = 1): number {
  if (node.children.length === 0) {
    return currentDepth;
  }
  
  let maxDepth = currentDepth;
  for (const child of node.children) {
    maxDepth = Math.max(maxDepth, countGenerations(child, currentDepth + 1));
  }
  
  return maxDepth;
}

function flattenTree(node: TreeNode): Person[] {
  const result: Person[] = [];
  
  function traverse(n: TreeNode): void {
    result.push({
      id: n.id,
      name: n.name,
      gender: n.gender,
      birth_date: n.birthDate,
      death_date: n.deathDate,
      avatar_url: n.avatarUrl,
      family_id: n.familyId,
      created_by: n.createdBy || '',
      created_at: n.createdAt || new Date().toISOString(),
      updated_at: n.updatedAt || new Date().toISOString(),
    });
    
    if (n.spouse) {
      result.push({
        id: n.spouse.id,
        name: n.spouse.name,
        gender: n.spouse.gender,
        birth_date: n.spouse.birthDate,
        death_date: n.spouse.deathDate,
        avatar_url: n.spouse.avatarUrl,
        family_id: n.familyId,
        created_by: n.spouse.createdBy || '',
        created_at: n.spouse.createdAt || new Date().toISOString(),
        updated_at: n.spouse.updatedAt || new Date().toISOString(),
      });
    }
    
    n.children.forEach(traverse);
  }
  
  traverse(node);
  return result;
}

export async function exportToPdf(
  tree: TreeNode,
  options: PdfExportOptions
): Promise<PdfExportResult> {
  try {
    const positions = new Map<string, { x: number; y: number }>();
    calculateTreePositions(tree, 0, 50, positions);
    
    const htmlContent = generateHtmlContent(tree, options, positions);
    
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });
    
    if (!uri) {
      return {
        success: false,
        error: 'PDF 生成失败',
      };
    }
    
    const fileName = `${options.familyName}_族谱_${new Date().toISOString().split('T')[0]}.pdf`;
    const destPath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destPath,
    });
    
    await FileSystem.deleteAsync(uri, { idempotent: true });
    
    return {
      success: true,
      uri: destPath,
    };
  } catch (error) {
    console.error('PDF export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF 导出失败',
    };
  }
}

export async function sharePdf(uri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return false;
    }
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: '分享族谱 PDF',
      UTI: 'com.adobe.pdf',
    });
    
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
}

export async function generateMemberListPdf(
  persons: Person[],
  familyName: string
): Promise<PdfExportResult> {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${familyName}家族成员列表</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #667eea;
      color: white;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .male { color: #4A90D9; }
    .female { color: #E87878; }
  </style>
</head>
<body>
  <h1>${familyName}家族成员列表</h1>
  <table>
    <thead>
      <tr>
        <th>姓名</th>
        <th>性别</th>
        <th>出生日期</th>
        <th>去世日期</th>
      </tr>
    </thead>
    <tbody>
      ${persons.map(p => `
        <tr>
          <td class="${p.gender}">${p.name}</td>
          <td>${p.gender === 'male' ? '男' : p.gender === 'female' ? '女' : '未知'}</td>
          <td>${p.birth_date || '-'}</td>
          <td>${p.death_date || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <p style="text-align: center; color: #666; margin-top: 20px;">
    共 ${persons.length} 位成员
  </p>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (!uri) {
      return { success: false, error: 'PDF 生成失败' };
    }

    const fileName = `${familyName}_成员列表_${new Date().toISOString().split('T')[0]}.pdf`;
    const destPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: uri,
      to: destPath,
    });

    await FileSystem.deleteAsync(uri, { idempotent: true });

    return { success: true, uri: destPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF 导出失败',
    };
  }
}
