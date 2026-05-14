import { v4 as uuidv4 } from 'uuid';

type Gender = 'male' | 'female' | 'unknown';

interface Person {
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
  created_at: string;
  updated_at: string;
}

const MALE_NAMES = [
  '建国', '伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '明',
  '超', '秀', '刚', '平', '文', '华', '飞', '斌', '波', '宇',
  '浩', '轩', '泽', '睿', '晨', '瑞', '浩然', '文昊', '子骞', '明辉',
];

const FEMALE_NAMES = [
  '娜', '静', '敏', '燕', '艳', '莉', '娟', '丽', '芳', '萍',
  '玲', '慧', '敏', '婷', '霞', '秀', '桂英', '玉兰', '美', '雪',
  '欣怡', '梓萱', '梦琪', '思颖', '佳怡', '雨萱', '欣妍', '可馨', '诗琪', '婧琪',
];

const SURNAMES = [
  '张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
];

const BIRTHPLACES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆',
  '天津', '苏州', '长沙', '郑州', '青岛', '大连', '宁波', '厦门', '福州', '济南',
];

const OCCUPATIONS = [
  '教师', '医生', '工程师', '律师', '公务员', '企业家', '设计师', '程序员', '艺术家', '音乐家',
  '作家', '记者', '编辑', '翻译', '会计', '金融', '销售', '市场', '人力', '行政',
];

export const generateMockMembers = (count: number = 200): Person[] => {
  const members: Person[] = [];
  const familyId = 'mock-family-id';
  
  for (let i = 0; i < count; i++) {
    const generation = Math.floor(Math.random() * 5) + 1;
    const isAlive = Math.random() > 0.2;
    const isMale = Math.random() > 0.45;
    const gender = isMale ? 'male' : isMale === false ? 'female' : 'unknown';
    
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const nameList = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const givenName = nameList[Math.floor(Math.random() * nameList.length)];
    const name = surname + givenName;
    
    const birthYear = 1930 + (2024 - 1930) * (5 - generation) / 5;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = `${Math.floor(birthYear)}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    
    let deathDate: string | undefined;
    if (!isAlive) {
      const deathYear = birthYear + 50 + Math.random() * 40;
      if (deathYear < 2024) {
        const deathMonth = Math.floor(Math.random() * 12) + 1;
        const deathDay = Math.floor(Math.random() * 28) + 1;
        deathDate = `${Math.floor(deathYear)}-${String(deathMonth).padStart(2, '0')}-${String(deathDay).padStart(2, '0')}`;
      }
    }

    members.push({
      id: uuidv4(),
      family_id: familyId,
      name,
      name_pinyin: name.toLowerCase(),
      birth_date: birthDate,
      death_date: deathDate,
      gender,
      avatar_url: Math.random() > 0.5 
        ? `https://picsum.photos/seed/${i}/300/300` 
        : undefined,
      bio: Math.random() > 0.5 
        ? `这是${name}的个人简介，记录了其一生的经历和故事。` 
        : undefined,
      birthplace: Math.random() > 0.4 
        ? BIRTHPLACES[Math.floor(Math.random() * BIRTHPLACES.length)] 
        : undefined,
      occupation: Math.random() > 0.3 
        ? OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)] 
        : undefined,
      generation,
      is_alive: isAlive,
      parent_id: i > 0 && Math.random() > 0.5 
        ? members[Math.floor(Math.random() * members.length)].id 
        : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return members;
};

export const loadMockData = async (count: number = 200): Promise<Person[]> => {
  // 模拟异步加载
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateMockMembers(count);
};
