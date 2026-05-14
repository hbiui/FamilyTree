# 空状态引导设计 - 验证清单与设计文档

## 一、空状态设计原则

### 1.1 设计理念

空状态不仅是"没有数据"的提示，更是与用户建立情感连接的起点。我们遵循以下原则：

- **温暖如家**：用亲情化的语言，让用户感受到家的温暖
- **引导行动**：明确告知用户下一步应该做什么
- **视觉愉悦**：使用温馨的插画和emoji，缓解用户的焦虑
- **简洁明了**：文案简短有力，避免冗长说明

### 1.2 情感化文案策略

| 场景 | 文案风格 | 示例 |
|------|---------|------|
| 创建家族 | 播种希望 | "每一棵参天大树，都始于一颗小小的种子" |
| 添加成员 | 开启故事 | "每一个家族都从一个名字开始" |
| 记录事件 | 珍藏记忆 | "每个人的一生都有值得铭记的时刻" |
| 邀请协作 | 传递牵挂 | "每一份邀请都承载着家的牵挂" |

---

## 二、空状态触发条件清单

### 2.1 家族树空状态

#### 触发条件

| 条件编号 | 触发条件 | 描述 | 优先级 |
|---------|---------|------|--------|
| TRIG-FT-001 | 无家族数据 | `currentFamily === null` 或 `currentFamily === undefined` | P0 |
| TRIG-FT-002 | 无成员数据 | `members.length === 0` 且 `currentFamily` 存在 | P0 |
| TRIG-FT-003 | 数据加载中 | `loading === true` | P1 |
| TRIG-FT-004 | 数据加载失败 | `error !== null` | P1 |

#### 对应组件

- 文件位置：`app/(tabs)/tree.tsx`
- 组件：`EmptyState` (type="no_family" 或 "no_members")
- 按钮目标：`router.push('/family/create')` 或 `router.push('/person/add')`

#### UI 验证清单

| 检查项 | 验证内容 | 预期结果 | 通过/失败 |
|-------|---------|---------|----------|
| VC-FT-001 | 插画显示 | 显示 🏠 emoji插画，带暖色光晕效果 | ☐ |
| VC-FT-002 | 标题文案 | 显示"创建您的第一个家族" | ☐ |
| VC-FT-003 | 描述文案 | 显示亲情化描述，包含种子的比喻 | ☐ |
| VC-FT-004 | 主按钮 | 显示"创建家族"按钮，红色背景 | ☐ |
| VC-FT-005 | 按钮可点击 | 点击后跳转到创建家族页面 | ☐ |
| VC-FT-006 | 背景色 | 温暖的米白色 #FFFBF5 | ☐ |
| VC-FT-007 | 底部文案 | 显示"每一段记忆都值得被珍藏 💝" | ☐ |
| VC-FT-008 | 响应式布局 | 在不同屏幕尺寸下布局正常 | ☐ |

### 2.2 成员详情无事件状态

#### 触发条件

| 条件编号 | 触发条件 | 描述 | 优先级 |
|---------|---------|------|--------|
| TRIG-ME-001 | 无事件数据 | `events.length === 0` 且加载完成 | P0 |
| TRIG-ME-002 | 加载失败 | `error !== null` 且无缓存数据 | P1 |
| TRIG-ME-003 | 加载中 | `isLoadingMemberEvents === true` 且 `events.length === 0` | P2 |

#### 对应组件

- 文件位置：`src/components/event/MemberEventsList.tsx`
- 组件：`EmptyState` (type="no_events", compact=true)
- 按钮目标：`router.push('/event/add?personId=xxx')`

#### UI 验证清单

| 检查项 | 验证内容 | 预期结果 | 通过/失败 |
|-------|---------|---------|----------|
| VC-ME-001 | 紧凑模式 | 使用compact样式，高度适中 | ☐ |
| VC-ME-002 | 插画显示 | 显示 📖 emoji插画 | ☐ |
| VC-ME-003 | 标题文案 | 显示"记录生命的故事" | ☐ |
| VC-ME-004 | 描述文案 | 包含"出生、结婚、升学"等关键词 | ☐ |
| VC-ME-005 | 主按钮 | 显示"添加故事"按钮 | ☐ |
| VC-ME-006 | 按钮可点击 | 点击后跳转到添加事件页面 | ☐ |
| VC-ME-007 | 情感化文案 | 包含"让他的故事永远被铭记" | ☐ |
| VC-ME-008 | 与其他内容区分 | 有明显的视觉分隔 | ☐ |

### 2.3 邀请无响应状态

#### 触发条件

| 条件编号 | 触发条件 | 描述 | 优先级 |
|---------|---------|------|--------|
| TRIG-IN-001 | 无邀请码 | `inviteCodes.length === 0` | P0 |
| TRIG-IN-002 | 邀请待处理 | `inviteCodes.some(c => c.status === 'pending')` | P1 |
| TRIG-IN-003 | 邀请已过期 | `inviteCodes.some(c => isExpired(c))` | P1 |
| TRIG-IN-004 | 邀请码无效 | `error !== null` 且无有效邀请码 | P2 |

#### 对应组件

- 文件位置：`src/components/collaboration/InvitePromptCard.tsx`
- 组件：`InvitePromptCard`
- 按钮功能：分享邀请码、复制邀请码、重新生成

#### UI 验证清单

| 检查项 | 验证内容 | 预期结果 | 通过/失败 |
|-------|---------|---------|----------|
| VC-IN-001 | 主卡片显示 | 显示邀请引导卡片，暖色阴影 | ☐ |
| VC-IN-002 | 插画显示 | 显示 💌 emoji | ☐ |
| VC-IN-003 | 标题文案 | 显示"邀请家人加入" | ☐ |
| VC-IN-004 | 副标题文案 | 包含"分享邀请码"相关内容 | ☐ |
| VC-IN-005 | 邀请码展示 | 如果有码则显示，否则显示"暂无邀请码" | ☐ |
| VC-IN-006 | 分享按钮 | 显示"📤 分享"按钮 | ☐ |
| VC-IN-007 | 复制按钮 | 显示"📋 复制"按钮 | ☐ |
| VC-IN-008 | 提示列表 | 显示3条使用提示 | ☐ |
| VC-IN-009 | 待处理提示 | 如果有待处理邀请显示黄色提示条 | ☐ |
| VC-IN-010 | 底部文案 | 显示"💝 每一份邀请都承载着家的牵挂" | ☐ |
| VC-IN-011 | 分享功能 | 点击分享按钮调用系统分享 | ☐ |
| VC-IN-012 | 复制功能 | 点击复制按钮复制到剪贴板 | ☐ |

---

## 三、空状态组件库设计

### 3.1 组件架构

```
src/components/common/EmptyState.tsx
├── EmptyState (主组件)
│   ├── props: type, onAction, compact, customTitle...
│   ├── configs: 预定义文案和样式
│   └── styles: warm/neutral/professional 三种风格
│
src/components/collaboration/InvitePromptCard.tsx
└── InvitePromptCard (专用卡片)
    ├── props: inviteCode, pendingInvitations...
    └── 内置分享/复制功能
```

### 3.2 EmptyState 组件类型

```typescript
type EmptyStateType =
  | 'no_family'           // 无家族
  | 'no_members'          // 无成员
  | 'no_events'           // 无事件
  | 'no_invite_response'  // 邀请无响应
  | 'no_search_results'   // 无搜索结果
  | 'no_relations'       // 无关系
  | 'no_timeline'         // 无时间轴
  | 'no_achievements';   // 无成就
```

### 3.3 样式变体

| 样式 | 使用场景 | 主色调 |
|------|---------|--------|
| warm | 家族、成员、事件相关 | 红色 #EF4444 |
| neutral | 通用提示 | 灰色 #6B7280 |
| professional | 成就、专业内容 | 蓝色 #3B82F6 |

---

## 四、空状态交互设计

### 4.1 家族树空状态交互

```
用户进入家族树页面
        ↓
   检查 currentFamily
        ↓
   ┌─────┴─────┐
   ↓           ↓
  无家族      有家族
   ↓           ↓
检查 members  检查 members
   ↓           ↓
┌──┴──┐        ↓
↓     ↓      正常显示
无成员  有成员    ↓
 ↓     ↓      退出
正常显示  ↓
 退出
```

### 4.2 成员事件空状态交互

```
用户进入成员详情页
        ↓
   滚动到事件部分
        ↓
   检查 memberEvents[personId]
        ↓
   ┌─────┴─────┐
   ↓           ↓
  加载中      加载完成
   ↓           ↓
显示loading   检查 events.length
   ↓              ↓
  退出      ┌────┴────┐
            ↓           ↓
         有事件      无事件
            ↓           ↓
         正常显示    显示EmptyState
            ↓           ↓
           退出      点击"添加故事"
                      ↓
                   跳转添加事件页
```

### 4.3 邀请空状态交互

```
用户进入协作管理页面
        ↓
   检查是否管理员
        ↓
   ┌─────┴─────┐
   ↓           ↓
  是管理员    否
   ↓           ↓
检查 inviteCodes  显示权限不足
   ↓           
┌──┴──┐        
↓     ↓        
无码   有码    
 ↓     ↓       
显示   正常显示
InvitePromptCard
   ↓           
┌──┴──┐        
↓     ↓        
点击   点击
分享   复制
 ↓     ↓       
系统   复制到
分享   剪贴板
```

---

## 五、测试场景与验证

### 5.1 手工测试清单

#### 家族树空状态测试

| 序号 | 测试步骤 | 预期结果 | 实际结果 | 通过/失败 |
|------|---------|---------|---------|----------|
| TEST-FT-01 | 全新安装应用后进入家族树页 | 显示"创建家族"空状态 | | ☐ |
| TEST-FT-02 | 点击"创建家族"按钮 | 跳转到创建家族页 | | ☐ |
| TEST-FT-03 | 创建家族后返回家族树页 | 显示"添加成员"空状态 | | ☐ |
| TEST-FT-04 | 添加第一个成员后返回 | 正常显示家族树 | | ☐ |
| TEST-FT-05 | 删除所有成员后进入 | 显示"添加成员"空状态 | | ☐ |
| TEST-FT-06 | 横屏模式下查看空状态 | 布局正常，无溢出 | | ☐ |

#### 成员事件空状态测试

| 序号 | 测试步骤 | 预期结果 | 实际结果 | 通过/失败 |
|------|---------|---------|---------|----------|
| TEST-ME-01 | 进入无事件的成员详情页 | 显示"记录生命的故事" | | ☐ |
| TEST-ME-02 | 点击"添加故事"按钮 | 跳转到添加事件页 | | ☐ |
| TEST-ME-03 | 添加事件后返回成员详情 | 正常显示事件列表 | | ☐ |
| TEST-ME-04 | 在小屏设备上查看空状态 | 内容完整，无溢出 | | ☐ |
| TEST-ME-05 | 在平板上查看空状态 | 居中显示，间距合理 | | ☐ |

#### 邀请空状态测试

| 序号 | 测试步骤 | 预期结果 | 实际结果 | 通过/失败 |
|------|---------|---------|---------|----------|
| TEST-IN-01 | 进入协作管理，无邀请码 | 显示邀请引导卡片 | | ☐ |
| TEST-IN-02 | 点击"分享"按钮 | 调起系统分享 | | ☐ |
| TEST-IN-03 | 点击"复制"按钮 | 复制成功提示 | | ☐ |
| TEST-IN-04 | 点击"生成邀请码" | 创建新邀请码 | | ☐ |
| TEST-IN-05 | 有待处理邀请时查看 | 显示待处理提示条 | | ☐ |
| TEST-IN-06 | 分享后返回 | 卡片消失，显示邀请码列表 | | ☐ |

### 5.2 异常场景测试

| 序号 | 测试场景 | 预期处理 | 通过/失败 |
|------|---------|---------|----------|
| EXCP-01 | 网络断开时进入空状态页 | 显示离线缓存数据或空状态 | ☐ |
| EXCP-02 | 空状态页加载超时 | 显示重试按钮 | ☐ |
| EXCP-03 | 点击按钮时网络错误 | 显示错误提示，不闪退 | ☐ |
| EXCP-04 | 快速连续点击按钮 | 只触发一次跳转 | ☐ |
| EXCP-05 | 应用切后台后返回 | 保持原状态 | ☐ |

### 5.3 兼容性测试

| 序号 | 测试环境 | 验证内容 | 通过/失败 |
|------|---------|---------|----------|
| COMP-01 | iPhone SE (小屏) | 插画和文字无溢出 | ☐ |
| COMP-02 | iPhone 14 (标准) | 布局正常 | ☐ |
| COMP-03 | iPhone 14 Pro Max (大屏) | 充分利用屏幕空间 | ☐ |
| COMP-04 | iPad Mini (平板) | 卡片居中，间距合理 | ☐ |
| COMP-05 | iPad Pro 12.9 (大平板) | 插画和按钮尺寸适中 | ☐ |
| COMP-06 | Android 小米 | 与iOS表现一致 | ☐ |
| COMP-07 | Android 三星 | 与iOS表现一致 | ☐ |
| COMP-08 | 横屏模式 | 布局自适应 | ☐ |

---

## 六、Lottie 动画集成指南

### 6.1 动画资源建议

虽然当前使用 emoji 插画，但建议后续集成 Lottie 动画以提升用户体验：

| 场景 | 动画描述 | 文件名建议 |
|------|---------|-----------|
| 创建家族 | 种子发芽动画 | `family_seed.json` |
| 添加成员 | 人物聚集动画 | `members_gather.json` |
| 记录事件 | 书本翻开动画 | `story_open.json` |
| 邀请协作 | 信封飘动动画 | `invite_fly.json` |

### 6.2 Lottie 集成代码示例

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface EmptyStateAnimationProps {
  type: EmptyStateType;
  size?: number;
}

const EmptyStateAnimation: React.FC<EmptyStateAnimationProps> = ({
  type,
  size = 200,
}) => {
  const animationSource = {
    no_family: require('../../assets/animations/family_seed.json'),
    no_members: require('../../assets/animations/members_gather.json'),
    no_events: require('../../assets/animations/story_open.json'),
    no_invite_response: require('../../assets/animations/invite_fly.json'),
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={animationSource[type]}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default EmptyStateAnimation;
```

### 6.3 Lottie 动画来源

推荐使用以下免费 Lottie 动画资源：

- **LottieFiles**: https://lottiefiles.com/
- **Iconscout**: https://iconscout.com/lottie-animations
- **Lordicon**: https://lordicon.com/

---

## 七、空状态数据追踪

### 7.1 埋点事件

| 事件名称 | 触发时机 | 参数 |
|---------|---------|------|
| `empty_state_view` | 空状态显示时 | `screen`, `type`, `timestamp` |
| `empty_state_action` | 点击空状态按钮 | `screen`, `type`, `button_text` |
| `empty_state_dismiss` | 关闭空状态 | `screen`, `type` |

### 7.2 数据分析指标

| 指标 | 计算方式 | 目标值 |
|------|---------|--------|
| 空状态曝光率 | 空状态展示次数 / 页面访问次数 | - |
| 空状态转化率 | 点击按钮次数 / 空状态展示次数 | > 30% |
| 平均停留时间 | 用户在空状态页的平均时长 | > 3秒 |

---

## 八、设计资源

### 8.1 配色方案

| 用途 | 颜色名称 | 色值 | 使用场景 |
|------|---------|------|---------|
| 主色 | 家族红 | #EF4444 | 主按钮、重点强调 |
| 辅助色 | 暖白 | #FFFBF5 | 背景色 |
| 文字色 | 深灰 | #1F2937 | 标题 |
| 辅助文字 | 中灰 | #6B7280 | 描述文字 |
| 边框色 | 浅灰 | #E5E7EB | 分隔线 |
| 警告色 | 琥珀 | #F59E0B | 待处理提示 |
| 成功色 | 翠绿 | #10B981 | 成功提示 |

### 8.2 字体规范

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 主标题 | 22-28px | 700 (Bold) | 1.3 |
| 副标题 | 16-18px | 600 (SemiBold) | 1.4 |
| 正文 | 14-16px | 400 (Regular) | 1.5 |
| 辅助文字 | 12-14px | 400 (Regular) | 1.4 |
| 按钮文字 | 15-16px | 600 (SemiBold) | 1.0 |

### 8.3 间距规范

| 用途 | 间距值 | 使用场景 |
|------|--------|---------|
| 组件内间距 | 8-16px | 元素之间的间距 |
| 组件外间距 | 24-32px | 与其他组件的间距 |
| 卡片内边距 | 24px | 空状态卡片的内边距 |
| 按钮间距 | 12px | 主按钮和次按钮之间 |

---

## 九、验收标准

### 9.1 功能验收

| 序号 | 验收项 | 验收标准 | 通过/失败 |
|------|-------|---------|----------|
| ACC-01 | 空状态显示 | 所有场景的空状态正确显示 | ☐ |
| ACC-02 | 按钮功能 | 所有按钮功能正常，可点击跳转 | ☐ |
| ACC-03 | 情感化文案 | 文案温馨、亲情化 | ☐ |
| ACC-04 | 响应式布局 | 在不同设备上布局正常 | ☐ |
| ACC-05 | 动画效果 | 插画和按钮有合适的动画反馈 | ☐ |

### 9.2 性能验收

| 序号 | 验收项 | 验收标准 | 通过/失败 |
|------|-------|---------|----------|
| PERF-01 | 渲染时间 | 空状态页面渲染 < 100ms | ☐ |
| PERF-02 | 内存占用 | 额外内存占用 < 5MB | ☐ |
| PERF-03 | 动画帧率 | 动画流畅度 ≥ 30 FPS | ☐ |

### 9.3 体验验收

| 序号 | 验收项 | 验收标准 | 通过/失败 |
|------|-------|---------|----------|
| UX-01 | 第一印象 | 空状态给用户温暖、被引导的感觉 | ☐ |
| UX-02 | 操作清晰 | 用户知道下一步应该做什么 | ☐ |
| UX-03 | 情感共鸣 | 文案能引起用户对家庭的情感共鸣 | ☐ |
| UX-04 | 可访问性 | 支持TalkBack等辅助功能 | ☐ |

---

**文档版本：** 1.0
**创建日期：** 2026-05-13
**最后更新：** 2026-05-13
**维护团队：** 前端团队 & 产品设计团队
