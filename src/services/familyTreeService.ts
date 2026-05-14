import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Person, Relation, Family, TreeNode } from '../types/familyTree';
import { buildTree, flattenTree } from '../utils/treeBuilder';

let supabase: SupabaseClient | null = null;

export function initSupabase(url: string, key: string): SupabaseClient {
  if (!supabase) {
    supabase = createClient(url, key);
  }
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initSupabase first.');
  }
  return supabase;
}

export async function getFamilyTree(familyId: string): Promise<TreeNode | null> {
  const client = getSupabase();

  const [personsResult, relationsResult] = await Promise.all([
    client
      .from('persons')
      .select('*')
      .eq('family_id', familyId),
    client
      .from('relations')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true),
  ]);

  if (personsResult.error) {
    throw new Error(`Failed to fetch persons: ${personsResult.error.message}`);
  }

  if (relationsResult.error) {
    throw new Error(`Failed to fetch relations: ${relationsResult.error.message}`);
  }

  const persons = personsResult.data as Person[];
  const relations = relationsResult.data as Relation[];

  return buildTree(persons, relations);
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const client = getSupabase();

  const result = await client
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();

  if (result.error) {
    if (result.error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch family: ${result.error.message}`);
  }

  return result.data as Family;
}

export async function getPersonsByFamily(familyId: string): Promise<Person[]> {
  const client = getSupabase();

  const result = await client
    .from('persons')
    .select('*')
    .eq('family_id', familyId);

  if (result.error) {
    throw new Error(`Failed to fetch persons: ${result.error.message}`);
  }

  return result.data as Person[];
}

export async function getRelationsByFamily(familyId: string): Promise<Relation[]> {
  const client = getSupabase();

  const result = await client
    .from('relations')
    .select('*')
    .eq('family_id', familyId);

  if (result.error) {
    throw new Error(`Failed to fetch relations: ${result.error.message}`);
  }

  return result.data as Relation[];
}

export async function saveFamilyTree(
  familyId: string,
  root: TreeNode
): Promise<{ success: boolean; errors?: string[] }> {
  const client = getSupabase();

  const errors: string[] = [];

  try {
    const { persons, relations } = flattenTree(root);

    const existingPersons = await getPersonsByFamily(familyId);
    const existingPersonIds = new Set(existingPersons.map((p: Person) => p.id));
    const personsToUpsert = persons.map((p: any) => ({
      ...p,
      family_id: familyId,
      created_at: existingPersonIds.has(p.id)
        ? existingPersons.find((ep: Person) => ep.id === p.id)?.created_at
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const personsResult = await client
      .from('persons')
      .upsert(personsToUpsert);

    if (personsResult.error) {
      errors.push(`Failed to upsert persons: ${personsResult.error.message}`);
    }

    const relationsToUpsert = relations.map((r: any) => ({
      ...r,
      family_id: familyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await client
      .from('relations')
      .delete()
      .eq('family_id', familyId);

    const relationsResult = await client
      .from('relations')
      .upsert(relationsToUpsert);

    if (relationsResult.error) {
      errors.push(`Failed to upsert relations: ${relationsResult.error.message}`);
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, errors };
  }
}

export async function addPerson(person: Omit<Person, 'created_at' | 'updated_at'>): Promise<Person> {
  const client = getSupabase();

  const now = new Date().toISOString();
  const newPerson = {
    ...person,
    created_at: now,
    updated_at: now,
  };

  const result = await client
    .from('persons')
    .insert(newPerson)
    .select()
    .single();

  if (result.error) {
    throw new Error(`Failed to add person: ${result.error.message}`);
  }

  return result.data as Person;
}

export async function updatePerson(
  id: string,
  updates: Partial<Omit<Person, 'id' | 'created_at' | 'updated_at'>>
): Promise<Person> {
  const client = getSupabase();

  const result = await client
    .from('persons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (result.error) {
    throw new Error(`Failed to update person: ${result.error.message}`);
  }

  return result.data as Person;
}

export async function deletePerson(id: string): Promise<void> {
  const client = getSupabase();

  const result = await client
    .from('persons')
    .delete()
    .eq('id', id);

  if (result.error) {
    throw new Error(`Failed to delete person: ${result.error.message}`);
  }
}
