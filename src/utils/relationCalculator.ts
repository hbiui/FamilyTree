/**
 * 血缘关系计算器模块
 * 
 * 算法说明：
 * 本模块使用最近公共祖先(LCA)算法来计算两人之间的血缘关系
 * 
 * 主要思路：
 * 1. 从根节点开始，构建每个节点到根节点的路径
 * 2. 比较两个路径，找到最近公共祖先
 * 3. 根据公共祖先的位置和深度差计算关系
 * 
 * 示例：
 *    A(曾祖父)
 *     │
 *    B(祖父)
 *    /    \
 *  C(父)   D(叔)
 *   |
 *  E(我)
 * 
 * 我和叔叔D的关系：
 * - 从根A到我的路径: A -> B -> C -> E
 * - 从根A到D的路径: A -> B -> D
 * - 最近公共祖先: B(祖父)
 * - 我相对于B的深度: 2
 * - D相对于B的深度: 1
 * - B是我和D的最近公共祖先
 * - 结果: 叔侄关系 -> "叔叔"
 */

import type { TreeNode } from '../types/familyTree';

export interface RelationResult {
  /** 中文称谓 */
  title: string;
  /** 关系类型 */
  type: RelationType;
  /** 关系描述 */
  description: string;
  /** 亲疏程度 (1-10, 10为最亲) */
  intimacy: number;
}

export type RelationType =
  | 'self'              // 自己
  | 'spouse'            // 配偶
  | 'parent'            // 父母
  | 'child'             // 子女
  | 'sibling'           // 兄弟姐妹
  | 'grandparent'        // 祖父母
  | 'grandchild'         // 孙子孙女
  | 'great_grandparent'  // 曾祖父母
  | 'great_grandchild'   // 曾孙
  | 'uncle_aunt'         // 叔伯姑姨
  | 'nephew_niece'       // 侄子侄女
  | 'cousin'             // 堂表兄弟姐妹
  | 'in_law'             // 姻亲
  | 'no_blood'           // 无血缘
  | 'unknown';           // 未知

/**
 * 中文称谓映射表
 */
const TITLE_MAP: Record<RelationType, { title: string; intimacy: number }> = {
  self: { title: '自己', intimacy: 10 },
  spouse: { title: '配偶', intimacy: 9 },
  parent: { title: '父母', intimacy: 9 },
  child: { title: '子女', intimacy: 9 },
  sibling: { title: '兄弟姐妹', intimacy: 8 },
  grandparent: { title: '祖父母', intimacy: 7 },
  grandchild: { title: '孙子孙女', intimacy: 7 },
  great_grandparent: { title: '曾祖父母', intimacy: 5 },
  great_grandchild: { title: '曾孙', intimacy: 5 },
  uncle_aunt: { title: '叔伯姑姨', intimacy: 6 },
  nephew_niece: { title: '侄子侄女', intimacy: 6 },
  cousin: { title: '堂表兄弟姐妹', intimacy: 4 },
  in_law: { title: '姻亲', intimacy: 3 },
  no_blood: { title: '无直接血缘关系', intimacy: 0 },
  unknown: { title: '关系未知', intimacy: 0 },
};

/**
 * 性别对应的称谓后缀
 */
const GENDER_TITLES: Record<string, Record<string, string>> = {
  parent: { male: '父亲', female: '母亲' },
  child: { male: '儿子', female: '女儿' },
  sibling: { male: '兄弟', female: '姐妹' },
  grandparent: { male: '祖父', female: '祖母' },
  grandchild: { male: '孙子', female: '孙女' },
  great_grandparent: { male: '曾祖父', female: '曾祖母' },
  great_grandchild: { male: '曾孙', female: '曾孙女' },
  uncle_aunt: { male: '叔叔', female: '姑姑' },
  nephew_niece: { male: '侄子', female: '侄女' },
  cousin: { male: '表哥/弟', female: '表姐/妹' },
};

/**
 * 从树中获取节点的所有祖先路径
 * @param root 树的根节点
 * @param targetId 目标节点ID
 * @returns 从根到目标节点的路径数组，如果未找到返回null
 */
function getAncestorPath(root: TreeNode, targetId: string): TreeNode[] | null {
  if (root.id === targetId) {
    return [root];
  }

  // 检查配偶
  if (root.spouse && root.spouse.id === targetId) {
    return [root];
  }

  // 递归搜索子节点
  for (const child of root.children || []) {
    const path = getAncestorPath(child, targetId);
    if (path) {
      return [root, ...path];
    }
  }

  return null;
}

/**
 * 找到两个节点的最近公共祖先
 * @param path1 节点1到根的路径
 * @param path2 节点2到根的路径
 * @returns 最近公共祖先节点和路径索引
 */
function findLCA(
  path1: TreeNode[],
  path2: TreeNode[]
): { lca: TreeNode; index1: number; index2: number } | null {
  if (path1.length === 0 || path2.length === 0) {
    return null;
  }

  // 使用集合来快速查找公共节点
  const set1 = new Set(path1.map(n => n.id));

  // 从根开始找第一个公共节点
  for (let i = 0; i < path2.length; i++) {
    if (set1.has(path2[i].id)) {
      const index1 = path1.findIndex(n => n.id === path2[i].id);
      return {
        lca: path2[i],
        index1,
        index2: i,
      };
    }
  }

  return null;
}

/**
 * 计算两个节点之间的关系
 * @param tree 家族树根节点
 * @param id1 第一个人的ID
 * @param id2 第二个人的ID
 * @returns 关系结果
 */
export function calculateRelation(
  tree: TreeNode,
  id1: string,
  id2: string
): RelationResult {
  // 自己与自己的关系
  if (id1 === id2) {
    return createResult('self', '自己');
  }

  // 检查是否是配偶关系
  const path1 = getAncestorPath(tree, id1);
  const path2 = getAncestorPath(tree, id2);

  if (!path1 || !path2) {
    return createResult('unknown', '关系未知');
  }

  // 检查配偶关系（在路径中相邻）
  if (isSpouse(path1, path2)) {
    return createResult('spouse', '配偶');
  }

  // 找到最近公共祖先
  const lcaInfo = findLCA(path1, path2);
  if (!lcaInfo) {
    return createResult('no_blood', '无直接血缘关系');
  }

  const { lca, index1, index2 } = lcaInfo;

  // 计算相对于LCA的深度
  // index是从LCA到目标节点的距离
  const depth1 = path1.length - index1 - 1;
  const depth2 = path2.length - index2 - 1;

  // 根据深度差确定关系类型
  return determineRelation(
    depth1,
    depth2,
    path1[0]?.gender || 'unknown',
    path2[0]?.gender || 'unknown',
    lca.gender
  );
}

/**
 * 检查两个人是否是配偶关系
 */
function isSpouse(path1: TreeNode[], path2: TreeNode[]): boolean {
  if (path1.length < 2 || path2.length < 2) {
    return false;
  }

  // 检查路径中的相邻节点是否是配偶
  for (let i = 0; i < path1.length - 1; i++) {
    const node1 = path1[i];
    if (node1.spouse && node1.spouse.id === path2[0]?.id) {
      return true;
    }
  }

  for (let i = 0; i < path2.length - 1; i++) {
    const node2 = path2[i];
    if (node2.spouse && node2.spouse.id === path1[0]?.id) {
      return true;
    }
  }

  return false;
}

/**
 * 根据深度差确定具体关系
 */
function determineRelation(
  depth1: number,
  depth2: number,
  gender1: string,
  gender2: string,
  lcaGender: string
): RelationResult {
  // 深度差为0：同辈关系
  if (depth1 === 0 && depth2 === 0) {
    // 自己
    return createResult('self', '自己');
  }

  // 深度差为1：直接上下辈关系
  if (Math.abs(depth1 - depth2) === 1) {
    if (depth1 > depth2) {
      // id1是id2的后代
      if (depth1 === 1) {
        return createResult('child', gender2 === 'female' ? '女儿' : '儿子');
      } else if (depth1 === 2) {
        return createResult('grandchild', gender2 === 'female' ? '孙女' : '孙子');
      } else if (depth1 === 3) {
        return createResult('great_grandchild', gender2 === 'female' ? '曾孙女' : '曾孙');
      }
    } else {
      // id1是id2的长辈
      if (depth2 === 1) {
        return createResult('parent', gender1 === 'female' ? '母亲' : '父亲');
      } else if (depth2 === 2) {
        return createResult('grandparent', gender1 === 'female' ? '祖母' : '祖父');
      } else if (depth2 === 3) {
        return createResult('great_grandparent', gender1 === 'female' ? '曾祖母' : '曾祖父');
      }
    }
  }

  // 深度差为0但不是自己：平辈关系（兄弟姐妹或堂表亲）
  if (depth1 === depth2 && depth1 > 0) {
    // 如果是直接兄弟姐妹（在同一个直接父母下）
    if (depth1 === 1) {
      return createResult('sibling', gender1 === 'female' ? '姐妹' : '兄弟');
    }
    // 堂表兄弟姐妹
    return createResult('cousin', gender1 === 'female' ? '表姐/妹' : '表哥/弟');
  }

  // 深度差不为0且不为1：旁系血亲
  if (depth1 > 0 && depth2 > 0 && Math.abs(depth1 - depth2) > 0) {
    // 叔伯姑姨或侄子侄女
    const younger = depth1 > depth2 ? depth1 : depth2;
    const older = depth1 > depth2 ? depth2 : depth1;

    if (younger - older === 1) {
      // 叔伯姑姨（祖父母的孩子）
      if (older === 1) {
        return createResult('uncle_aunt', gender1 === 'female' ? '姑姑' : '叔叔');
      }
    }

    if (younger > older && older === 1) {
      // 侄子侄女（兄弟姐妹的孩子）
      return createResult('nephew_niece', gender1 === 'female' ? '侄女' : '侄子');
    }
  }

  // 其他情况
  return createResult('no_blood', '无直接血缘关系');
}

/**
 * 创建关系结果
 */
function createResult(type: RelationType, description: string): RelationResult {
  return {
    title: TITLE_MAP[type].title,
    type,
    description,
    intimacy: TITLE_MAP[type].intimacy,
  };
}

/**
 * 获取更精确的称谓（考虑堂/表）
 */
export function getPreciseTitle(
  depth1: number,
  depth2: number,
  gender: string,
  viaSpouse: boolean = false
): string {
  const prefix = viaSpouse ? '表' : (depth1 === 1 ? '堂' : '表');

  if (depth1 === 0 && depth2 === 0) return '自己';
  if (depth1 === 0 && depth2 === 1) return gender === 'female' ? '女儿' : '儿子';
  if (depth1 === 1 && depth2 === 0) return gender === 'female' ? '母亲' : '父亲';
  if (depth1 === 1 && depth2 === 1) return gender === 'female' ? '姐妹' : '兄弟';
  if (depth1 === 0 && depth2 === 2) return gender === 'female' ? '孙女' : '孙子';
  if (depth1 === 2 && depth2 === 0) return gender === 'female' ? '祖母' : '祖父';
  if (depth1 === 1 && depth2 === 2) return gender === 'female' ? '外甥女' : '外甥';
  if (depth1 === 2 && depth2 === 1) return gender === 'female' ? '舅妈/姨母' : '姑父/伯父';
  
  return `${prefix}兄弟姐妹`;
}

/**
 * 计算所有可能的亲属关系（批量计算）
 */
export function calculateAllRelations(
  tree: TreeNode,
  personId: string
): Map<string, RelationResult> {
  const results = new Map<string, RelationResult>();

  function traverse(node: TreeNode) {
    if (node.id !== personId) {
      const result = calculateRelation(tree, personId, node.id);
      results.set(node.id, result);
    }

    // 遍历子节点
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }

    // 遍历配偶
    if (node.spouse) {
      if (node.spouse.id !== personId) {
        const result = calculateRelation(tree, personId, node.spouse.id);
        results.set(node.spouse.id, result);
      }
    }
  }

  traverse(tree);
  return results;
}
