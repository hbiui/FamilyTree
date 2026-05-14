import type { TreeNode, Person, Relation, TreeBuildOptions } from '../types/familyTree';

export function buildTree(
  persons: Person[],
  relations: Relation[],
  options: TreeBuildOptions = {}
): TreeNode | null {
  const { includeSpouse = true, includeAllFields = false } = options;

  if (persons.length === 0) {
    return null;
  }

  const personMap = new Map<string, Person>();
  const personToChildren: Map<string, string[]> = new Map();
  const personToSpouse: Map<string, string> = new Map();

  for (const person of persons) {
    personMap.set(person.id, person);
  }

  for (const relation of relations) {
    if (!relation.is_active) {
      continue;
    }

    if (relation.relation_type === 'spouse') {
      personToSpouse.set(relation.person_a_id, relation.person_b_id);
      personToSpouse.set(relation.person_b_id, relation.person_a_id);
    } else if (['son', 'daughter'].includes(relation.relation_type)) {
      const children = personToChildren.get(relation.person_a_id) || [];
      children.push(relation.person_b_id);
      personToChildren.set(relation.person_a_id, children);
    }
  }

  let rootPerson: Person | null = null;
  for (const person of persons) {
    const hasParent = person.parent_id || person.mother_id;
    if (!hasParent) {
      rootPerson = person;
      break;
    }
  }

  if (!rootPerson) {
    const minGeneration = Math.min(...persons.map(p => p.generation || Infinity));
    rootPerson = persons.find(p => (p.generation || Infinity) === minGeneration) || persons[0];
  }

  const processed = new Set<string>();

  function buildNode(personId: string): TreeNode {
    if (processed.has(personId)) {
      const person = personMap.get(personId);
      return createBasicTreeNode(person!, includeAllFields);
    }

    processed.add(personId);
    const person = personMap.get(personId);

    if (!person) {
      throw new Error(`Person with id ${personId} not found`);
    }

    const node = createBasicTreeNode(person, includeAllFields);

    if (includeSpouse) {
      const spouseId = personToSpouse.get(personId);
      if (spouseId) {
        const spouse = personMap.get(spouseId);
        if (spouse) {
          node.spouse = createBasicTreeNode(spouse, includeAllFields);
        }
      } else {
        node.spouse = null;
      }
    } else {
      node.spouse = null;
    }

    const childrenIds = personToChildren.get(personId) || [];
    node.children = childrenIds.map(childId => buildNode(childId));

    return node;
  }

  return buildNode(rootPerson.id);
}

export function flattenTree(root: TreeNode): { persons: any[]; relations: any[] } {
  const persons: any[] = [];
  const relations: any[] = [];
  const processed = new Set<string>();

  function traverse(node: TreeNode, parentId?: string) {
    if (processed.has(node.id)) {
      return;
    }
    processed.add(node.id);

    const personData: Record<string, any> = {
      id: node.id,
      name: node.name,
      gender: node.gender,
      birth_date: node.birthDate,
      death_date: node.deathDate,
      parent_id: parentId,
    };

    for (const key of Object.keys(node)) {
      if (!['id', 'name', 'gender', 'birthDate', 'deathDate', 'spouse', 'children'].includes(key)) {
        personData[key] = (node as any)[key];
      }
    }

    persons.push(personData);

    if (node.spouse && !processed.has(node.spouse.id)) {
      relations.push({
        id: `${node.id}-spouse-${node.spouse.id}`,
        person_a_id: node.id,
        person_b_id: node.spouse.id,
        relation_type: 'spouse' as const,
        is_active: true,
      });
      // 配偶不需要 parentId
      traverse(node.spouse);
    }

    for (const child of node.children) {
      const relationType = child.gender === 'male' ? 'son' : child.gender === 'female' ? 'daughter' : 'son';
      relations.push({
        id: `${node.id}-child-${child.id}`,
        person_a_id: node.id,
        person_b_id: child.id,
        relation_type: relationType,
        is_active: true,
      });
      traverse(child, node.id);
    }
  }

  traverse(root);

  return { persons, relations };
}

function createBasicTreeNode(person: Person, includeAllFields: boolean): TreeNode {
  const node: TreeNode = {
    id: person.id,
    name: person.name,
    gender: person.gender,
    birthDate: person.birth_date,
    deathDate: person.death_date,
    children: [],
  };

  if (includeAllFields) {
    Object.assign(node, person);
  }

  return node;
}
