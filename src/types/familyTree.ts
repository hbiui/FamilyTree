export type Gender = 'male' | 'female' | 'unknown';

export type RelationType =
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'spouse'
  | 'brother'
  | 'sister'
  | 'grandfather'
  | 'grandmother'
  | 'grandson'
  | 'granddaughter'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'brother_in_law'
  | 'sister_in_law'
  | 'nephew'
  | 'niece';

export type PrivacyLevel = 'private' | 'family' | 'public';

export interface PersonPrivacy {
  birth_date?: PrivacyLevel;
  death_date?: PrivacyLevel;
  phone?: PrivacyLevel;
  email?: PrivacyLevel;
  address?: PrivacyLevel;
  bio?: PrivacyLevel;
  birthplace?: PrivacyLevel;
  occupation?: PrivacyLevel;
  education?: PrivacyLevel;
  achievements?: PrivacyLevel;
}

export interface Person {
  id: string;
  family_id: string;
  name: string;
  name_pinyin?: string;
  birth_date?: string;
  death_date?: string;
  gender: Gender;
  avatar_url?: string;
  bio?: string;
  birthplace?: string;
  occupation?: string;
  generation?: number;
  is_alive: boolean;
  parent_id?: string;
  mother_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  education?: string;
  achievements?: string;
  privacy_level?: PrivacyLevel;
  privacy_settings?: PersonPrivacy;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Relation {
  id: string;
  family_id: string;
  person_a_id: string;
  person_b_id: string;
  relation_type: RelationType;
  reverse_type?: RelationType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  surname?: string;
  description?: string;
  avatar_url?: string;
  root_person_id?: string;
  settings?: FamilySettings;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilySettings {
  default_generation_naming?: string[];
  tree_direction?: 'vertical' | 'horizontal';
  show_deceased_first?: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  gender: Gender;
  birthDate?: string;
  deathDate?: string;
  spouse?: TreeNode | null;
  children: TreeNode[];
  [key: string]: any;
}

export interface SupabasePerson {
  id: string;
  family_id: string;
  name: string;
  name_pinyin?: string;
  birth_date?: string;
  death_date?: string;
  gender: Gender;
  avatar_url?: string;
  bio?: string;
  birthplace?: string;
  occupation?: string;
  generation?: number;
  is_alive: boolean;
  parent_id?: string;
  mother_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  education?: string;
  achievements?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseRelation {
  id: string;
  family_id: string;
  person_a_id: string;
  person_b_id: string;
  relation_type: RelationType;
  reverse_type?: RelationType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TreeBuildOptions = {
  includeSpouse?: boolean;
  includeAllFields?: boolean;
};

// 事件类型定义
export type EventType = 
  | 'birth'
  | 'death'
  | 'marriage'
  | 'divorce'
  | 'migration'
  | 'education'
  | 'occupation'
  | 'achievement'
  | 'other';

export interface FamilyEvent {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  date: string;
  type: EventType;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventPerson {
  event_id: string;
  person_id: string;
  family_id: string;
  role?: string;
  created_at: string;
}

export interface FamilyEventWithPeople extends FamilyEvent {
  related_people: Person[];
}

export interface SupabaseFamilyEvent {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  date: string;
  type: EventType;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseEventPerson {
  event_id: string;
  person_id: string;
  family_id: string;
  role?: string;
  created_at: string;
}

// ============ AI 功能相关类型 ============

export interface ParsedPerson {
  id: string;
  name: string;
  gender: Gender;
  birth_date?: string;
  death_date?: string;
  is_alive: boolean;
  is_placeholder: boolean; // 是否是占位节点
  notes?: string; // AI 备注
}

export interface ParsedRelation {
  from_id: string;
  to_id: string;
  relation_type: RelationType;
  confidence: number; // AI 置信度 0-1
  notes?: string;
}

export interface RelationParseResult {
  success: boolean;
  persons: ParsedPerson[];
  relations: ParsedRelation[];
  raw_text: string;
  ai_notes?: string;
  error?: string;
}

export interface PhotoEnhancementResult {
  success: boolean;
  original_url: string;
  enhanced_url: string;
  before_analysis: PhotoAnalysis;
  after_analysis: PhotoAnalysis;
  processing_time_ms: number;
  error?: string;
}

export interface PhotoAnalysis {
  clarity_score: number; // 0-100
  sharpness_score: number; // 0-100
  color_score: number; // 0-100
  noise_level: number; // 0-100，越高越差
  face_detected: boolean;
  face_count: number;
  resolution: {
    width: number;
    height: number;
  };
  file_size_kb: number;
}

// ============ 搜索与筛选相关类型 ============

export interface MemberSearchQuery {
  searchText: string;
  searchFields: ('name' | 'birth_year' | 'birthplace')[];
}

export interface MemberFilter {
  generation?: number | null;
  gender?: Gender | null;
  isAlive?: boolean | null;
}

export interface SearchAndFilterState {
  searchQuery: MemberSearchQuery;
  filters: MemberFilter;
  isFiltersVisible: boolean;
}

export interface HighlightedTextPart {
  text: string;
  isHighlighted: boolean;
}

export interface SearchResult {
  person: Person;
  highlightedName: HighlightedTextPart[];
  matchScore: number;
}
