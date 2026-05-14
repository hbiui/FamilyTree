# FamilyTree App - 家族族谱应用

## 项目概述

一个现代化的家族族谱管理应用，帮助用户记录、追溯和传承家族历史。采用 React Native + Expo 构建，支持 iOS 和 Android 双平台。

## 技术栈

| 类别 | 技术选型 |
|------|---------|
| 框架 | React Native + Expo SDK 52 |
| 状态管理 | Zustand |
| 后端服务 | Supabase |
| 路由 | expo-router |
| UI 组件 | react-native-svg + 自定义组件 |
| 图表 | d3-hierarchy (树形结构) |
| 本地存储 | expo-sqlite |
| 图片处理 | expo-image-picker |
| 身份验证 | Supabase Auth |

---

## 1. 项目目录结构

```
FamilyTree/
├── app/                          # expo-router 页面目录
│   ├── (tabs)/                   # 底部标签栏
│   │   ├── _layout.tsx           # 标签栏布局
│   │   ├── index.tsx             # 首页 - 家族概览
│   │   ├── tree.tsx              # 家族树页面
│   │   ├── members.tsx           # 成员列表页面
│   │   └── settings.tsx          # 设置页面
│   ├── family/
│   │   ├── [id].tsx              # 家族详情页
│   │   └── create.tsx            # 创建家族页
│   ├── person/
│   │   ├── [id].tsx              # 成员详情页
│   │   ├── add.tsx               # 添加成员页
│   │   └── edit.tsx              # 编辑成员页
│   ├── relation/
│   │   └── manage.tsx             # 关系管理页
│   ├── _layout.tsx               # 根布局
│   └── +not-found.tsx             # 404 页面
│
├── src/
│   ├── components/               # 通用组件
│   │   ├── common/               # 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── family/               # 家族相关组件
│   │   │   ├── FamilyCard.tsx
│   │   │   └── FamilyStats.tsx
│   │   ├── member/               # 成员相关组件
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberForm.tsx
│   │   │   └── MemberAvatar.tsx
│   │   ├── tree/                 # 家族树组件
│   │   │   ├── FamilyTreeView.tsx
│   │   │   ├── TreeNode.tsx
│   │   │   ├── TreeEdge.tsx
│   │   │   └── TreeControls.tsx
│   │   └── layout/               # 布局组件
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── SafeArea.tsx
│   │
│   ├── screens/                  # 业务逻辑层（可选）
│   │   ├── HomeScreen.ts
│   │   ├── TreeScreen.ts
│   │   └── MemberScreen.ts
│   │
│   ├── features/                  # 功能模块
│   │   ├── auth/                 # 认证模块
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── store/
│   │   ├── family/               # 家族管理模块
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── store/
│   │   ├── members/              # 成员管理模块
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── tree/                  # 家族树模块
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── store/
│   │
│   ├── database/                 # 数据库相关
│   │   ├── supabase.ts           # Supabase 客户端
│   │   ├── schema.sql            # 数据库 schema
│   │   ├── migrations/           # 迁移文件
│   │   └── queries/              # SQL 查询语句
│   │       ├── person.queries.ts
│   │       ├── family.queries.ts
│   │       └── relation.queries.ts
│   │
│   ├── store/                    # Zustand 状态管理
│   │   ├── useAuthStore.ts       # 认证状态
│   │   ├── useFamilyStore.ts     # 家族状态
│   │   ├── useMemberStore.ts     # 成员状态
│   │   └── useTreeStore.ts       # 树视图状态
│   │
│   ├── services/                 # API 服务层
│   │   ├── auth.service.ts
│   │   ├── family.service.ts
│   │   ├── member.service.ts
│   │   └── relation.service.ts
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useFamily.ts
│   │   ├── useMembers.ts
│   │   ├── useTree.ts
│   │   └── useRelation.ts
│   │
│   ├── utils/                    # 工具函数
│   │   ├── tree.ts               # 树结构操作
│   │   ├── relation.ts           # 关系计算
│   │   ├── date.ts               # 日期处理
│   │   ├── validation.ts         # 表单验证
│   │   └── helpers.ts            # 通用辅助函数
│   │
│   ├── constants/                # 常量配置
│   │   ├── theme.ts              # 主题配置
│   │   ├── colors.ts             # 颜色配置
│   │   ├── typography.ts         # 字体配置
│   │   └── relation-types.ts     # 关系类型定义
│   │
│   ├── types/                    # TypeScript 类型
│   │   ├── family.ts
│   │   ├── person.ts
│   │   ├── relation.ts
│   │   └── navigation.ts
│   │
│   └── assets/                   # 静态资源
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── components/                   # 全局组件（可直接导入）
├── constants/                    # 全局常量
├── hooks/                        # 全局 Hooks
├── app.json                      # Expo 配置
├── babel.config.js               # Babel 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖
└── README.md                     # 项目说明
```

---

## 2. 核心数据模型

### 2.1 实体关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Family    │       │   Person     │       │ Relation    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ name        │       │ family_id   │◄──────│ family_id   │
│ description │       │ name        │       │ person_a_id │◄─┐
│ avatar_url  │       │ birth_date  │       │ person_b_id │──┘
│ created_at  │       │ death_date  │       │ relation_type│
│ updated_at  │       │ gender      │       │ created_at  │
└─────────────┘       │ avatar_url  │       └─────────────┘
       │             │ bio         │
       │             │ birthplace  │
       │             │ occupation   │
       │             │ generation   │
       │             │ parent_id    │────► 指向父母
       │             │ spouse_ids[] │────► 配偶列表
       └─────────────│ created_at  │
                     │ updated_at  │
                     └─────────────┘
```

### 2.2 数据模型 TypeScript 定义

```typescript
// types/person.ts
export type Gender = 'male' | 'female' | 'unknown';

export interface Person {
  id: string;
  family_id: string;
  name: string;
  name_pinyin?: string;           // 姓名拼音
  birth_date?: string;            // ISO 8601 格式
  death_date?: string;
  gender: Gender;
  avatar_url?: string;
  bio?: string;                   // 个人简介
  birthplace?: string;
  occupation?: string;            // 职业
  generation?: number;            // 辈分代数
  is_alive: boolean;
  parent_id?: string;             // 父亲 ID
  mother_id?: string;             // 母亲 ID
  created_at: string;
  updated_at: string;
}

// types/family.ts
export interface Family {
  id: string;
  name: string;                   // 家族名称（如"张氏家族"）
  surname?: string;               // 姓氏
  description?: string;
  avatar_url?: string;
  root_person_id?: string;        // 家族树根节点（创始人）
  settings?: FamilySettings;
  created_by: string;              // 创建者用户 ID
  created_at: string;
  updated_at: string;
}

export interface FamilySettings {
  default_generation_naming?: string[];  // 辈分用字
  tree_direction?: 'vertical' | 'horizontal';
  show_deceased_first?: boolean;
}

// types/relation.ts
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

export interface Relation {
  id: string;
  family_id: string;
  person_a_id: string;
  person_b_id: string;
  relation_type: RelationType;    // A 对 B 的关系
  reverse_type?: RelationType;     // B 对 A 的反向关系
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 用于血缘关系计算
export interface RelationPath {
  from: string;
  to: string;
  path: RelationType[];
  common_ancestor?: string;
  depth: number;
}
```

---

## 3. 数据库表设计 SQL

### 3.1 Supabase Database Schema

```sql
-- ============================================
-- FamilyTree App - Supabase Database Schema
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Families 表 - 家族信息
-- ============================================
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    root_person_id UUID,
    settings JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_families_created_by ON families(created_by);
CREATE INDEX idx_families_surname ON families(surname);

-- ============================================
-- 2. Persons 表 - 家族成员
-- ============================================
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_pinyin VARCHAR(255),
    birth_date DATE,
    death_date DATE,
    gender VARCHAR(20) NOT NULL DEFAULT 'unknown',
    avatar_url TEXT,
    bio TEXT,
    birthplace VARCHAR(255),
    occupation VARCHAR(255),
    generation INTEGER DEFAULT 1,
    is_alive BOOLEAN DEFAULT TRUE,
    parent_id UUID REFERENCES persons(id),
    mother_id UUID REFERENCES persons(id),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    education VARCHAR(255),
    achievements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 约束：死亡日期必须晚于出生日期
    CONSTRAINT check_dates CHECK (
        death_date IS NULL OR birth_date IS NULL OR death_date >= birth_date
    ),
    -- 约束：性别只能是指定值
    CONSTRAINT check_gender CHECK (
        gender IN ('male', 'female', 'unknown')
    )
);

-- 索引
CREATE INDEX idx_persons_family_id ON persons(family_id);
CREATE INDEX idx_persons_parent_id ON persons(parent_id);
CREATE INDEX idx_persons_generation ON persons(generation);
CREATE INDEX idx_persons_name ON persons(name);
CREATE INDEX idx_persons_name_pinyin ON persons(name_pinyin);
CREATE INDEX idx_persons_created_at ON persons(created_at DESC);

-- ============================================
-- 3. Relations 表 - 成员关系
-- ============================================
CREATE TABLE relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    person_a_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    person_b_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    reverse_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 唯一约束：同一家族中，相同两人只能有一种关系
    CONSTRAINT unique_relation UNIQUE (family_id, person_a_id, person_b_id),
    -- 约束：关系类型必须是指定值
    CONSTRAINT check_relation_type CHECK (
        relation_type IN (
            'father', 'mother', 'son', 'daughter',
            'spouse', 'brother', 'sister',
            'grandfather', 'grandmother', 'grandson', 'granddaughter',
            'uncle', 'aunt', 'cousin',
            'brother_in_law', 'sister_in_law',
            'nephew', 'niece'
        )
    ),
    -- 约束：不能自己跟自己建立关系
    CONSTRAINT check_different_persons CHECK (person_a_id != person_b_id)
);

-- 索引
CREATE INDEX idx_relations_family_id ON relations(family_id);
CREATE INDEX idx_relations_person_a ON relations(person_a_id);
CREATE INDEX idx_relations_person_b ON relations(person_b_id);
CREATE INDEX idx_relations_type ON relations(relation_type);
CREATE INDEX idx_relations_both_persons ON relations(person_a_id, person_b_id);

-- ============================================
-- 4. FamilyMembers 表 - 家族成员关系（方便查询）
-- ============================================
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',  -- 'owner', 'admin', 'member', 'viewer'
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_family_person UNIQUE (family_id, person_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_person ON family_members(person_id);

-- ============================================
-- 5. Photos 表 - 家族/成员照片
-- ============================================
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(500),
    photo_date DATE,
    taken_at VARCHAR(255),        -- 拍照地点
    category VARCHAR(50),          -- 'avatar', 'gallery', 'event', 'document'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_family ON photos(family_id);
CREATE INDEX idx_photos_person ON photos(person_id);
CREATE INDEX idx_photos_category ON photos(category);

-- ============================================
-- 6. Events 表 - 家族事件
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50),        -- 'wedding', 'birth', 'death', 'reunion', 'other'
    location VARCHAR(255),
    photo_ids UUID[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_family ON events(family_id);
CREATE INDEX idx_events_date ON events(event_date DESC);

-- ============================================
-- 辅助函数和视图
-- ============================================

-- 自动更新 updated_at 触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加 updated_at 触发器
CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relations_updated_at
    BEFORE UPDATE ON relations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 实用视图
-- ============================================

-- 成员树形结构视图
CREATE OR REPLACE VIEW person_tree_view AS
SELECT
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', r.person_b_id,
                'type', r.relation_type
            )
        ) FILTER (WHERE r.person_b_id IS NOT NULL AND r.person_a_id = p.id),
        '[]'
    ) AS relationships
FROM persons p
LEFT JOIN relations r ON p.id = r.person_a_id
GROUP BY p.id;

-- 家族统计视图
CREATE OR REPLACE VIEW family_statistics AS
SELECT
    f.id AS family_id,
    f.name AS family_name,
    COUNT(DISTINCT p.id) AS total_members,
    COUNT(DISTINCT p.id) FILTER (WHERE p.gender = 'male') AS male_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.gender = 'female') AS female_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_alive = TRUE) AS alive_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_alive = FALSE) AS deceased_count,
    MAX(p.generation) AS max_generation,
    MIN(p.birth_date) FILTER (WHERE p.birth_date IS NOT NULL) AS earliest_birth,
    MAX(p.death_date) FILTER (WHERE p.death_date IS NOT NULL) AS latest_death
FROM families f
LEFT JOIN persons p ON f.id = p.family_id
GROUP BY f.id;

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 家族策略：成员可以查看
CREATE POLICY "家族成员可查看" ON families
    FOR SELECT USING (
        id IN (
            SELECT family_id FROM family_members
            WHERE person_id = auth.uid()
        )
    );

-- 家族策略：创建者可修改
CREATE POLICY "创建者可修改" ON families
    FOR UPDATE USING (created_by = auth.uid());

-- 成员策略：家族成员可查看
CREATE POLICY "成员可查看家族成员" ON persons
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE person_id = auth.uid()
        )
    );

-- 成员策略：管理员可修改
CREATE POLICY "管理员可修改成员" ON persons
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE person_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 关系策略：家族成员可查看
CREATE POLICY "成员可查看关系" ON relations
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE person_id = auth.uid()
        )
    );

-- 关系策略：管理员可修改
CREATE POLICY "管理员可修改关系" ON relations
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE person_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

### 3.3 常用查询示例

```typescript
// queries/person.queries.ts

// 获取家族成员列表（带分页）
export const getMembersQuery = `
  SELECT p.*,
    (SELECT COUNT(*) FROM persons WHERE parent_id = p.id) as children_count
  FROM persons p
  WHERE p.family_id = $1
  ORDER BY p.generation ASC, p.birth_date ASC NULLS LAST
  LIMIT $2 OFFSET $3;
`;

// 获取成员详细信息（包含关系）
export const getMemberDetailQuery = `
  SELECT
    p.*,
    parent.name as parent_name,
    mother.name as mother_name,
    json_agg(
      DISTINCT jsonb_build_object(
        'id', spouse.id,
        'name', spouse.name,
        'relation_id', r.id
      )
    ) FILTER (WHERE spouse.id IS NOT NULL) as spouses
  FROM persons p
  LEFT JOIN persons parent ON p.parent_id = parent.id
  LEFT JOIN persons mother ON p.mother_id = mother.id
  LEFT JOIN relations r ON p.id = r.person_a_id AND r.relation_type = 'spouse'
  LEFT JOIN persons spouse ON r.person_b_id = spouse.id
  WHERE p.id = $1
  GROUP BY p.id, parent.name, mother.name;
`;

// 获取成员后代（递归查询）
export const getDescendantsQuery = `
  WITH RECURSIVE descendants AS (
    SELECT id, name, generation, parent_id, 1 as depth
    FROM persons
    WHERE parent_id = $1

    UNION ALL

    SELECT p.id, p.name, p.generation, p.parent_id, d.depth + 1
    FROM persons p
    INNER JOIN descendants d ON p.parent_id = d.id
    WHERE d.depth < 50  -- 防止无限递归
  )
  SELECT * FROM descendants ORDER BY depth, birth_date;
`;

// 获取成员祖先链（递归查询）
export const getAncestorsQuery = `
  WITH RECURSIVE ancestors AS (
    SELECT id, name, gender, generation, parent_id, mother_id, 1 as depth
    FROM persons
    WHERE id = $1

    UNION ALL

    SELECT p.id, p.name, p.gender, p.generation, p.parent_id, p.mother_id, a.depth + 1
    FROM persons p
    INNER JOIN ancestors a ON p.id = a.parent_id OR p.id = a.mother_id
    WHERE a.depth < 50
  )
  SELECT * FROM ancestors ORDER BY depth;
`;
```

---

## 4. UI 设计风格规范

### 4.1 设计理念：现代中式温馨风格

融合传统中式元素与现代极简设计，营造温馨、庄重、典雅的家族氛围。

### 4.2 配色方案

```typescript
// constants/colors.ts

export const Colors = {
  // 主色调 - 朱砂红（中国传统色）
  primary: {
    50: '#FEF2F2',   // 最浅
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // 主色
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',  // 最深
  },

  // 辅助色 - 墨灰
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',  // 墨色
  },

  // 背景色 - 米白/宣纸色
  background: {
    primary: '#FFFBF5',     // 主背景 - 暖米白
    secondary: '#FFF8F0',   // 次背景 - 象牙白
    tertiary: '#F5F0E8',     // 第三背景 - 浅宣纸
    card: '#FFFFFF',        // 卡片背景
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // 强调色 - 金色/琥珀色（用于重要元素）
  accent: {
    gold: '#D4A574',        // 古铜金
    amber: '#F59E0B',       // 琥珀
    bronze: '#CD7F32',      // 青铜
  },

  // 语义色
  semantic: {
    success: '#059669',      // 翠绿
    warning: '#D97706',      // 橙黄
    error: '#DC2626',        // 朱红
    info: '#2563EB',         // 靛蓝
  },

  // 性别颜色
  gender: {
    male: '#3B82F6',        // 蓝色
    female: '#EC4899',      // 粉色
    unknown: '#9CA3AF',      // 灰色
  },

  // 文字颜色
  text: {
    primary: '#1F2937',      // 主文字
    secondary: '#6B7280',    // 次文字
    tertiary: '#9CA3AF',     // 弱文字
    inverse: '#FFFFFF',      // 反色文字
    disabled: '#D1D5DB',    // 禁用文字
  },

  // 边框颜色
  border: {
    light: '#F3F4F6',
    default: '#E5E7EB',
    dark: '#D1D5DB',
  },

  // 阴影颜色
  shadow: {
    color: 'rgba(0, 0, 0, 0.08)',
  },

  // 透明色
  transparent: 'transparent',
};

// 渐变组合
export const Gradients = {
  primary: ['#EF4444', '#B91C1C'],           // 朱红渐变
  warm: ['#FFFBF5', '#F5F0E8'],              // 暖色渐变
  gold: ['#D4A574', '#CD7F32'],              // 金色渐变
  treeMale: ['#3B82F6', '#1D4ED8'],          // 男性分支
  treeFemale: ['#EC4899', '#DB2777'],         // 女性分支
};
```

### 4.3 字体规范

```typescript
// constants/typography.ts

import { Platform } from 'react-native';

const fontFamilies = {
  // 中文优先使用系统字体
  chinese: Platform.select({
    ios: 'PingFang SC',
    android: 'Noto Sans SC',
    default: 'System',
  }),

  // 数字和英文
  english: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),

  // 装饰性字体（用于标题）
  decorative: Platform.select({
    ios: 'Songti SC',
    android: 'Noto Serif SC',
    default: 'System',
  }),
};

export const Typography = {
  // 标题层级
  h1: {
    fontFamily: fontFamilies.decorative,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: fontFamilies.decorative,
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  h3: {
    fontFamily: fontFamilies.chinese,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontFamily: fontFamilies.chinese,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontFamily: fontFamilies.chinese,
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
  },

  // 正文
  body: {
    fontFamily: fontFamilies.chinese,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fontFamilies.chinese,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // 辅助文字
  caption: {
    fontFamily: fontFamilies.chinese,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  overline: {
    fontFamily: fontFamilies.english,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },

  // 按钮文字
  button: {
    fontFamily: fontFamilies.chinese,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontFamily: fontFamilies.chinese,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },

  // 数字显示
  number: {
    fontFamily: fontFamilies.english,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
};
```

### 4.4 间距系统

```typescript
// constants/spacing.ts

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

### 4.5 设计元素

```
┌─────────────────────────────────────────────────────┐
│  设计元素说明                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 圆角卡片                                        │
│     - 背景：米白色 (#FFFBF5)                         │
│     - 圆角：12px                                    │
│     - 阴影：柔和投影                                 │
│                                                     │
│  2. 家族树节点                                       │
│     - 形状：圆角矩形或圆形头像                       │
│     - 男性：蓝色渐变边框                             │
│     - 女性：粉色渐变边框                             │
│     - 连接线：优雅曲线                               │
│                                                     │
│  3. 图标风格                                         │
│     - 使用线性图标                                   │
│     - 线条粗细：2px                                  │
│     - 圆角端点                                       │
│                                                     │
│  4. 装饰元素                                         │
│     - 可使用水墨画风格背景                           │
│     - 传统纹样边框（云纹、回纹）                     │
│     - 印章风格图标                                   │
│                                                     │
│  5. 动画风格                                         │
│     - 缓入缓出，如水墨晕染                           │
│     - 过渡时长：300-500ms                            │
│     - 使用 spring 动画模拟自然运动                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. 关键依赖列表

```json
{
  "dependencies": {
    // 框架核心
    "expo": "~52.0.0",
    "react": "19.0.0",
    "react-native": "0.76.0",

    // 路由
    "expo-router": "~4.0.0",

    // 状态管理
    "zustand": "^5.0.0",

    // 后端服务
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",

    // UI 组件
    "react-native-svg": "^15.0.0",
    "expo-image-picker": "~16.0.0",

    // 家族树可视化
    "d3-hierarchy": "^3.1.2",
    "d3-shape": "^3.2.0",

    // 表单处理
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",

    // 动画
    "react-native-reanimated": "^3.16.0",
    "react-native-gesture-handler": "^2.20.0",
    "react-native-screens": "^4.0.0",
    "react-native-safe-area-context": "^4.14.0",

    // 工具库
    "date-fns": "^3.6.0",
    "pinyin-pro": "^3.18.0",
    "uuid": "^10.0.0",

    // 本地存储
    "expo-secure-store": "~14.0.0",
    "expo-sqlite": "~15.0.0",
    "@react-native-async-storage/async-storage": "2.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "@types/d3-hierarchy": "^3.1.0",
    "@types/d3-shape": "^3.1.0",
    "@types/uuid": "^10.0.0",
    "typescript": "~5.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 6. 项目初始化步骤

### 6.1 前置要求

```bash
# 检查环境
node -v        # >= 18.0.0
npm -v         # >= 9.0.0
npx --version  # >= 8.0.0
```

### 6.2 初始化命令

```bash
# ============================================
# Step 1: 创建 Expo 项目
# ============================================
npx create-expo-app@latest FamilyTree --template blank-typescript

# 进入项目目录
cd FamilyTree

# ============================================
# Step 2: 安装核心依赖
# ============================================
# 路由系统
npx expo install expo-router react-native-screens react-native-safe-area-context

# 状态管理
npm install zustand

# 后端服务
npx expo install @supabase/supabase-js @supabase/ssr

# UI 和 SVG
npx expo install react-native-svg expo-image-picker

# 动画
npx expo install react-native-reanimated react-native-gesture-handler

# 表单
npm install react-hook-form zod @hookform/resolvers

# 工具库
npx expo install expo-secure-store date-fns
npm install pinyin-pro uuid
npm install @types/uuid -D

# ============================================
# Step 3: 配置项目结构
# ============================================
mkdir -p app/\(tabs\)
mkdir -p app/family
mkdir -p app/person
mkdir -p app/relation
mkdir -p src/{components,features,database,store,services,hooks,utils,constants,types,assets}
mkdir -p src/components/{common,family,member,tree,layout}
mkdir -p src/features/{auth,family,members,tree}
mkdir -p src/database/{migrations,queries}

# ============================================
# Step 4: 配置 app.json
# ============================================
# 编辑 app.json 添加路由配置

# ============================================
# Step 5: 创建数据库 Schema
# ============================================
# 在 Supabase Dashboard 执行 schema.sql

# ============================================
# Step 6: 验证环境
# ============================================
# 启动开发服务器
npx expo start
```

### 6.3 app.json 配置示例

```json
{
  "expo": {
    "name": "FamilyTree",
    "slug": "family-tree",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "familytree",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFBF5"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.familytree.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFBF5"
      },
      "package": "com.familytree.app"
    },
    "plugins": [
      "expo-router",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow FamilyTree to access your photos for family albums."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## 7. Hello World 验证页面

### 7.1 验证步骤

创建以下文件验证环境：

```
app/_layout.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx
```

### 7.2 预期效果

```
┌────────────────────────────────────┐
│ 顶部标题区域                         │
│ "家族族谱"  +  设置图标              │
├────────────────────────────────────┤
│                                    │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   🏠 欢迎使用家族族谱    │     │
│    │                         │     │
│    │   这是一个测试页面        │     │
│    │                         │     │
│    │   家族数量: 0            │     │
│    │   成员数量: 0            │     │
│    │                         │     │
│    │   [ 创建我的第一个家族 ] │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                    │
│  ┌──────┬──────┬──────┬──────┐     │
│  │ 首页 │ 家族树│ 成员 │ 设置 │     │
│  └──────┴──────┴──────┴──────┘     │
│  底部标签栏                         │
└────────────────────────────────────┘
```

### 7.3 验证命令

```bash
# Web 预览
npx expo start --web

# iOS 模拟器（macOS）
npx expo start --ios

# Android 模拟器
npx expo start --android

# 或者使用 Expo Go 应用扫描二维码
```

---

## 8. 下一步开发计划

### Phase 1: 基础功能
- [ ] 完成项目初始化和环境验证
- [ ] 实现 Supabase 集成和认证
- [ ] 完成家族 CRUD 功能
- [ ] 完成成员 CRUD 功能
- [ ] 实现家族树可视化组件

### Phase 2: 关系管理
- [ ] 实现关系类型定义
- [ ] 完成关系计算逻辑
- [ ] 实现关系图可视化
- [ ] 支持关系批量导入

### Phase 3: 高级功能
- [ ] 实现家族相册功能
- [ ] 实现家族事件管理
- [ ] 实现数据导出（PDF/Excel）
- [ ] 实现多语言支持

### Phase 4: 社交功能
- [ ] 实现家族邀请功能
- [ ] 实现成员间私信
- [ ] 实现家族公告
- [ ] 实现在线祭拜功能
