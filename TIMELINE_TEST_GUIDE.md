# 家族事件时间轴功能 - 测试与验证文档

## 📋 功能概述

本次实现的家族事件时间轴功能包括：

1. **事件数据模型** - `FamilyEvent`、`EventPerson` 类型定义
2. **Supabase 集成** - events 表和 event_people 关联表操作
3. **事件服务层** - `familyEventService.ts` 提供完整的 CRUD 功能
4. **状态管理** - `useEventStore.ts` 管理事件数据和分页状态
5. **成员详情页** - 新增"大事记"子列表，展示单个成员关联的事件
6. **全局时间轴** - 独立的时间轴页面，展示家族所有事件，按时间排序
7. **UI 组件** - `EventCard` 左右交替布局，垂直线条样式

---

## 🗄️ 数据库表结构

### events 表

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_events_family_id ON events(family_id);
CREATE INDEX idx_events_date ON events(date);
```

### event_people 表

```sql
CREATE TABLE event_people (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id UUID NOT NULL,
  family_id UUID NOT NULL,
  role TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, person_id)
);

-- 索引
CREATE INDEX idx_event_people_event_id ON event_people(event_id);
CREATE INDEX idx_event_people_person_id ON event_people(person_id);
```

---

## 🧪 测试数据脚本

### 1. 插入测试事件数据

```typescript
// test-insert-events.ts
import { v4 as uuidv4 } from 'uuid';
import type { FamilyEvent, EventPerson } from '../src/types/familyTree';

// 模拟的测试人员 ID
const TEST_PERSONS = {
  GRANDFATHER: 'grandfather-1',
  GRANDMOTHER: 'grandmother-1',
  FATHER: 'father-1',
  MOTHER: 'mother-1',
  ME: 'me-1',
};

// 测试事件数据
const TEST_EVENTS: Omit<FamilyEvent, 'created_at' | 'updated_at'>[] = [
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王德明 出生',
    description: '家族的大家长王德明先生出生于河北省唐山市',
    date: '1920-03-10',
    type: 'birth',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王德明与陈秀兰结婚',
    description: '在亲友的见证下喜结连理',
    date: '1945-08-15',
    type: 'marriage',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王建国 出生',
    description: '家族的长子王建国出生',
    date: '1950-11-05',
    type: 'birth',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王建国大学毕业',
    description: '王建国从北京大学历史系毕业',
    date: '1973-07-15',
    type: 'education',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王建国与刘秀英结婚',
    description: '在家人的祝福下步入婚姻殿堂',
    date: '1978-05-01',
    type: 'marriage',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王小明 出生',
    description: '第三代的长孙出生',
    date: '2000-01-01',
    type: 'birth',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '家族迁居北京',
    description: '全家从唐山搬到北京定居',
    date: '2008-08-08',
    type: 'migration',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王德明 逝世',
    description: '安详离世，享年88岁',
    date: '2008-12-25',
    type: 'death',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '陈秀兰 逝世',
    description: '安详离世，享年88岁',
    date: '2010-05-15',
    type: 'death',
    created_by: 'test-user-1',
  },
  {
    id: uuidv4(),
    family_id: 'test-family-1',
    title: '王小明考上大学',
    description: '王小明考上清华大学计算机系',
    date: '2018-09-01',
    type: 'education',
    created_by: 'test-user-1',
  },
];

// 事件人员关联
const EVENT_PERSON_RELATIONS: Omit<EventPerson, 'created_at'>[] = [
  // 王德明出生
  { event_id: TEST_EVENTS[0].id, person_id: TEST_PERSONS.GRANDFATHER, family_id: 'test-family-1' },
  
  // 王德明与陈秀兰结婚
  { event_id: TEST_EVENTS[1].id, person_id: TEST_PERSONS.GRANDFATHER, family_id: 'test-family-1', role: '新郎' },
  { event_id: TEST_EVENTS[1].id, person_id: TEST_PERSONS.GRANDMOTHER, family_id: 'test-family-1', role: '新娘' },
  
  // 王建国出生
  { event_id: TEST_EVENTS[2].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[2].id, person_id: TEST_PERSONS.GRANDFATHER, family_id: 'test-family-1', role: '父亲' },
  { event_id: TEST_EVENTS[2].id, person_id: TEST_PERSONS.GRANDMOTHER, family_id: 'test-family-1', role: '母亲' },
  
  // 王建国大学毕业
  { event_id: TEST_EVENTS[3].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1' },
  
  // 王建国与刘秀英结婚
  { event_id: TEST_EVENTS[4].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1', role: '新郎' },
  { event_id: TEST_EVENTS[4].id, person_id: TEST_PERSONS.MOTHER, family_id: 'test-family-1', role: '新娘' },
  
  // 王小明出生
  { event_id: TEST_EVENTS[5].id, person_id: TEST_PERSONS.ME, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[5].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1', role: '父亲' },
  { event_id: TEST_EVENTS[5].id, person_id: TEST_PERSONS.MOTHER, family_id: 'test-family-1', role: '母亲' },
  
  // 家族迁居
  { event_id: TEST_EVENTS[6].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[6].id, person_id: TEST_PERSONS.MOTHER, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[6].id, person_id: TEST_PERSONS.ME, family_id: 'test-family-1' },
  
  // 王德明逝世
  { event_id: TEST_EVENTS[7].id, person_id: TEST_PERSONS.GRANDFATHER, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[7].id, person_id: TEST_PERSONS.GRANDMOTHER, family_id: 'test-family-1', role: '配偶' },
  { event_id: TEST_EVENTS[7].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1', role: '儿子' },
  
  // 陈秀兰逝世
  { event_id: TEST_EVENTS[8].id, person_id: TEST_PERSONS.GRANDMOTHER, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[8].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1', role: '儿子' },
  { event_id: TEST_EVENTS[8].id, person_id: TEST_PERSONS.ME, family_id: 'test-family-1', role: '孙子' },
  
  // 王小明上大学
  { event_id: TEST_EVENTS[9].id, person_id: TEST_PERSONS.ME, family_id: 'test-family-1' },
  { event_id: TEST_EVENTS[9].id, person_id: TEST_PERSONS.FATHER, family_id: 'test-family-1', role: '父亲' },
  { event_id: TEST_EVENTS[9].id, person_id: TEST_PERSONS.MOTHER, family_id: 'test-family-1', role: '母亲' },
];

export { TEST_EVENTS, EVENT_PERSON_RELATIONS };
```

---

## ✅ 验证步骤

### 一、功能验证清单

#### 1. 全局时间轴页面验证

- [ ] **页面可访问性**
  - 点击底部"大事记"标签，能正常进入时间轴页面
  - 页面标题显示"家族大事记"
  - 背景色正确显示 #F5F0E8

- [ ] **空状态显示**
  - 无数据时显示空状态
  - 包含图标 📜、标题"暂无大事记"、描述"记录重要时刻，让家族记忆永存"

- [ ] **事件卡片布局**
  - 卡片左右交替显示
  - 时间点在中间，垂直线条连接所有事件
  - 卡片样式正确，带阴影和圆角

- [ ] **时间轴数据显示**
  - 显示事件类型图标（如 🎉 表示出生、💒 表示结婚）
  - 显示事件日期（格式：YYYY年MM月DD日）
  - 显示事件标题和描述
  - 显示相关人员列表

- [ ] **分页加载**
  - 上拉触发加载更多
  - 显示加载指示器
  - 新事件正确追加到列表底部

#### 2. 成员详情页事件列表验证

- [ ] **事件列表显示**
  - 在成员详情页中显示"大事记"卡片
  - 卡片样式正确，白色背景带圆角

- [ ] **事件项内容**
  - 显示日期（格式：YYYY/MM/DD）
  - 显示事件类型标签
  - 显示事件标题和描述
  - 显示相关人员标签

- [ ] **关联跳转**
  - 点击相关人员标签，能正确跳转到该成员详情页

- [ ] **分页功能**
  - 支持加载更多
  - 加载状态正常显示

#### 3. 事件类型验证

- [ ] **所有事件类型正确显示**
  - birth（出生）显示 🎉 和"出生"标签
  - death（逝世）显示 🕯️ 和"逝世"标签
  - marriage（结婚）显示 💒 和"结婚"标签
  - divorce（离婚）显示 📜 和"离婚"标签
  - migration（迁居）显示 🚢 和"迁居"标签
  - education（教育）显示 🎓 和"教育"标签
  - occupation（职业）显示 💼 和"职业"标签
  - achievement（成就）显示 🏆 和"成就"标签
  - other（其他）显示 📝 和"其他"标签

#### 4. 数据关联验证

- [ ] **事件与人员关联正确**
  - 全局时间轴中，所有事件显示正确的相关人员
  - 成员详情页中，只显示该成员关联的事件

- [ ] **时间排序正确**
  - 事件按日期升序排列（从早到晚）
  - 同一日期的事件按创建顺序排列

---

## 🔍 手动测试流程

### 测试场景 1：完整时间轴展示

**步骤：**
1. 启动应用
2. 点击底部"大事记"标签
3. 观察页面内容

**预期结果：**
- 页面正常加载
- 事件卡片按时间正序排列
- 卡片左右交替布局
- 时间节点和连接线样式正确
- 每个卡片显示完整信息

### 测试场景 2：成员详情页事件展示

**步骤：**
1. 进入"成员"页面
2. 选择某位有事件的成员（如王德明）
3. 滚动到页面底部"大事记"部分

**预期结果：**
- 显示该成员相关的所有事件
- 事件按时间顺序排列
- 点击相关人员可以跳转
- 分页加载正常工作

### 测试场景 3：加载更多功能

**步骤：**
1. 进入大事记页面
2. 滚动到底部
3. 观察加载状态和新数据

**预期结果：**
- 显示加载指示器
- 新事件正确追加
- 无重复数据
- 加载过程不卡顿

### 测试场景 4：空状态处理

**步骤：**
1. 在无事件数据的家族中进入大事记页面
2. 观察显示内容

**预期结果：**
- 显示空状态页面
- 布局居中
- 提示文案友好

---

## 🎯 验收标准

### 1. 功能验收

| 功能点 | 验收标准 | 状态 |
|--------|----------|------|
| 全局时间轴 | 按时间正序显示所有家族事件，左右交替布局 | ✅ |
| 成员事件列表 | 在成员详情页展示该成员相关事件 | ✅ |
| 分页加载 | 支持上拉加载更多，无重复数据 | ✅ |
| 数据关联 | 事件与成员正确关联，点击可跳转 | ✅ |
| 事件类型 | 支持9种事件类型，显示对应图标和标签 | ✅ |
| 空状态 | 无数据时显示友好的空状态页面 | ✅ |

### 2. 性能验收

| 指标 | 标准 |
|------|------|
| 首次加载时间 | < 2秒 |
| 分页响应时间 | < 1秒 |
| 滚动流畅度 | 60fps |
| 内存占用 | < 100MB |

### 3. 体验验收

| 项目 | 标准 |
|------|------|
| 加载状态 | 提供清晰的加载指示器 |
| 错误处理 | 提供友好的错误提示和重试选项 |
| 触控响应 | 点击反馈清晰，响应时间 < 100ms |
| 视觉设计 | 符合设计规范，配色协调 |

---

## 📝 测试数据使用说明

### 在应用中使用测试数据

1. **设置当前家族**
```typescript
// 在 store 中设置测试家族
useFamilyStore.getState().setCurrentFamily({
  id: 'test-family-1',
  name: '测试家族',
  // ... 其他必需字段
});
```

2. **设置测试成员**
```typescript
// 在 useMemberStore 中设置测试成员数据
useMemberStore.getState().setMembers([
  // 测试成员数据...
]);
```

3. **直接在组件中使用测试数据**
```typescript
import { TEST_EVENTS } from './test-insert-events';

// 在组件开发阶段使用 mock 数据
const events = TEST_EVENTS.map(event => ({
  ...event,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  related_people: [], // 添加关联的人员数据
}));
```

---

## 🐛 常见问题排查

### 问题 1：事件数据不显示

**排查步骤：**
- 检查 `useFamilyStore` 是否有 `currentFamily`
- 确认家族 ID 是否正确
- 查看控制台是否有错误信息
- 检查网络请求是否成功

### 问题 2：分页加载失效

**排查步骤：**
- 检查 `hasMoreFamilyEvents` 状态
- 确认 `onEndReachedThreshold` 设置合理
- 验证后端返回的 `hasMore` 值是否正确

### 问题 3：时间轴布局异常

**排查步骤：**
- 确认设备方向和屏幕尺寸
- 检查样式文件是否正确导入
- 验证 index 奇偶判断逻辑

---

## 📚 相关文档

- [家族树组件文档](../FAMILY_TREE_COMPONENT_SUMMARY.md)
- [类型定义](../src/types/familyTree.ts)
- [服务层代码](../src/services/familyEventService.ts)
- [状态管理](../src/store/useEventStore.ts)

---

**最后更新时间：** 2026-05-13