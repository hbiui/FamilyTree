import type { Person, PrivacyLevel, PersonPrivacy } from '../types/familyTree';

export interface PrivacyOptions {
  isFamilyMember: boolean;
  isOwner: boolean;
  userId: string | null;
}

export interface FilteredPerson {
  id: string;
  family_id: string;
  name: string;
  name_pinyin?: string;
  birth_date?: string;
  death_date?: string;
  gender: string;
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
  isFieldHidden?: { [key: string]: boolean };
}

const DEFAULT_PRIVACY: PrivacyLevel = 'family';
const HIDDEN_FIELD_PLACEHOLDER = '•••';

function getFieldPrivacy(
  person: Person,
  field: keyof PersonPrivacy,
  defaultLevel: PrivacyLevel = DEFAULT_PRIVACY
): PrivacyLevel {
  return person.privacy_settings?.[field] || person.privacy_level || defaultLevel;
}

function canViewField(
  person: Person,
  field: keyof PersonPrivacy,
  options: PrivacyOptions
): boolean {
  const { isFamilyMember, isOwner, userId } = options;
  
  if (isOwner) return true;
  if (!isFamilyMember && !isOwner) return false;
  
  const privacyLevel = getFieldPrivacy(person, field);
  
  switch (privacyLevel) {
    case 'private':
      return isOwner;
    case 'family':
      return isFamilyMember || isOwner;
    case 'public':
      return true;
    default:
      return isFamilyMember;
  }
}

export function filterPersonByPrivacy(
  person: Person,
  options: PrivacyOptions
): FilteredPerson {
  const filtered: FilteredPerson = {
    id: person.id,
    family_id: person.family_id,
    name: person.name,
    name_pinyin: person.name_pinyin,
    gender: person.gender,
    avatar_url: person.avatar_url,
    generation: person.generation,
    is_alive: person.is_alive,
    parent_id: person.parent_id,
    mother_id: person.mother_id,
    isFieldHidden: {},
  };
  
  const privacyFields: (keyof PersonPrivacy)[] = [
    'birth_date',
    'death_date',
    'phone',
    'email',
    'address',
    'bio',
    'birthplace',
    'occupation',
    'education',
    'achievements',
  ];
  
  privacyFields.forEach((field) => {
    const canView = canViewField(person, field, options);
    filtered.isFieldHidden![field] = !canView;
    
    if (canView) {
      (filtered as any)[field] = (person as any)[field];
    } else {
      (filtered as any)[field] = undefined;
    }
  });
  
  return filtered;
}

export function getPrivacyLabel(level: PrivacyLevel): string {
  switch (level) {
    case 'private':
      return '仅自己可见';
    case 'family':
      return '家族内可见';
    case 'public':
      return '公开可见';
    default:
      return '家族内可见';
  }
}

export function getPrivacyIcon(level: PrivacyLevel): string {
  switch (level) {
    case 'private':
      return '🔒';
    case 'family':
      return '👨‍👩‍👧‍👦';
    case 'public':
      return '🌐';
    default:
      return '👨‍👩‍👧‍👦';
  }
}

export function getPrivacyColor(level: PrivacyLevel): string {
  switch (level) {
    case 'private':
      return '#EF4444';
    case 'family':
      return '#3B82F6';
    case 'public':
      return '#10B981';
    default:
      return '#3B82F6';
  }
}

export const DEFAULT_PRIVACY_SETTINGS: PersonPrivacy = {
  birth_date: 'family',
  death_date: 'family',
  phone: 'private',
  email: 'private',
  address: 'private',
  bio: 'family',
  birthplace: 'family',
  occupation: 'family',
  education: 'family',
  achievements: 'family',
};

export const PRIVACY_FIELD_LABELS: { [key in keyof PersonPrivacy]: string } = {
  birth_date: '出生日期',
  death_date: '逝世日期',
  phone: '电话号码',
  email: '电子邮箱',
  address: '地址',
  bio: '生平简介',
  birthplace: '籍贯',
  occupation: '职业',
  education: '学历',
  achievements: '成就',
};
