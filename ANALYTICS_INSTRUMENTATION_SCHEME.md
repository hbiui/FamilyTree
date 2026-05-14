# 家族树应用核心埋点方案

## 概述

本方案为家族树应用提供完整的埋点设计，涵盖核心事件、页面浏览记录和隐私保护措施。

---

## 目录

1. [埋点架构](#1-埋点架构)
2. [核心事件定义](#2-核心事件定义)
3. [页面浏览记录](#3-页面浏览记录)
4. [事件参数设计](#4-事件参数设计)
5. [隐私保护措施](#5-隐私保护措施)
6. [验证方案](#6-验证方案)
7. [数据应用建议](#7-数据应用建议)

---

## 1. 埋点架构

### 1.1 架构设计

```
┌─────────────────────────────────────────┐
│         用户行为数据层          │
│  ┌──────────────┐  ┌──────────┐ │
│  │ Family Tree │  │  用户操  │ │
│  └──────┬─────┘  │  作采集  │ │
└─────────┼──────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│      事件队列与过滤层         │
│  ┌──────────────┐  ┌──────────┐ │
│  │ 事件采集器  │  │  隐私过滤 │ │
│  └──────┬─────┘  └────┬─────┘ │
└─────────┼─────────────────┼────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  Firebase Analytics │  │  自定义后端  │
│  (可选)       │  │  (主后端   │
└─────────────────┘  └──────────────────┘
          │                 │
          └────────┬────────┘
                   ▼
         ┌─────────────────┐
         │  数据存储与分析  │
         └─────────────────┘
```

### 1.2 核心组件

| 组件 | 职责 |
|------|------|
| AnalyticsService | 埋点核心服务 |
| useScreenTracking | 页面追踪 Hook |
| useEventTracking | 事件追踪 Hook |
| 事件队列 | 事件缓存与批量发送 |
| 隐私过滤器 | 隐私信息过滤 |

---

## 2. 核心事件定义

### 2.1 家族管理事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `family_create` | 创建家族 | 用户创建新家族时 |
| `family_edit` | 编辑家族 | 用户编辑家族信息时 |
| `family_delete` | 删除家族 | 用户删除家族时 |
| `family_join` | 加入家族 | 用户接受邀请加入家族时 |
| `family_switch` | 切换家族 | 用户切换不同家族时 |

#### family_create 事件

```typescript
{
  event: 'family_create',
  params: {
    family_size: 5, // 初始成员数
    duration_ms: 2000, // 创建耗时(ms)
    operating_system: 'ios',
    os_version: '15.0,
    app_version: '1.0.0',
  }
}
```

### 2.2 成员管理事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `member_add` | 添加成员 | 用户添加新成员时 |
| `member_edit` | 编辑成员 | 用户编辑成员信息时 |
| `member_delete` | 删除成员 | 用户删除成员时 |
| `member_view` | 查看成员 | 用户查看成员详情时 |
| `member_photo_upload` | 上传照片 | 用户上传成员照片时 |

#### member_add 事件

```typescript
{
  event: 'member_add',
  params: {
    family_id: 'xxx',
    member_gender: 'male', // male / female / unknown
    member_birth_year: 1990, // 出生年份
    family_size: 5, // 添加后的成员数
  }
}
```

### 2.3 关系管理事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `relation_calculate` | 计算关系 | 用户计算成员关系时 |
| `relation_add` | 添加关系 | 用户添加新关系时 |
| `relation_view` | 查看关系 | 用户查看关系时 |

#### relation_calculate 事件

```typescript
{
  event: 'relation_calculate',
  params: {
    family_id: 'xxx',
    relation_type: 'direct', // direct / collateral / in_law
    relation_depth: 3, // 关系深度
    duration_ms: 150, // 计算耗时(ms)
  }
}
```

### 2.4 导出分享事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `gedcom_export` | 导出 GEDCOM | 用户导出 GEDCOM 文件时 |
| `gedcom_import` | 导入 GEDCOM | 用户导入 GEDCOM 文件时 |
| `share_invite_send` | 发送邀请 | 用户发送协作邀请时 |
| `share_family_tree` | 分享族谱 | 用户分享家族树时 |
| `share_family_photo` | 分享照片 | 用户分享家族照片时 |

#### gedcom_export 事件

```typescript
{
  event: 'gedcom_export',
  params: {
    export_format: 'gedcom',
    family_size: 25, // 导出成员数
    has_private_data: true, // 是否包含隐私数据
    is_password_protected: true, // 是否密码保护
    export_file_size: 102400, // 文件大小(字节)
  }
}
```

### 2.5 照片管理事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `photo_upload` | 上传照片 | 用户上传照片时 |
| `photo_view` | 查看照片 | 用户查看照片时 |
| `photo_delete` | 删除照片 | 用户删除照片时 |
| `photo_restore` | 修复照片 | 用户使用照片修复功能时 |

#### photo_restore 事件

```typescript
{
  event: 'photo_restore',
  params: {
    photo_id: 'xxx',
    photo_age_years: 50, // 照片年份
    photo_restore_duration: 1500, // 修复耗时(ms)
  }
}
```

### 2.6 设置事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|----------|
| `theme_switch` | 切换主题 | 用户切换应用主题时 |
| `language_switch` | 切换语言 | 用户切换语言时 |
| `privacy_settings_change` | 隐私设置 | 用户修改隐私设置时 |
| `account_delete` | 删除账号 | 用户删除账号前 |

### 2.7 活跃事件

| 事件名称 | 事件含义 | 触发时机 |
|----------|----------|
| `app_open` | 应用打开 | 应用启动时 |
| `app_background` | 应用后台 | 应用进入后台时 |
| `user_session_start` | 会话开始 | 用户会话开始时 |
| `user_session_end` | 会话结束 | 用户会话结束时 |

---

## 3. 页面浏览记录

### 3.1 页面定义

| 页面名称 | 页面英文 | 页面含义 |
|----------|----------|----------|
| 首页 | home | 应用首页 |
| 家族树 | family_tree | 家族树可视化页面 |
| 成员列表 | member_list | 成员列表页面 |
| 成员详情 | member_detail | 成员详情页 |
| 导出 | export | 数据导出页面 |
| 家族详情 | family_detail | 家族详情页 |
| 设置 | settings | 设置页面 |

### 3.2 screen_view 事件

```typescript
{
  event: 'screen_view',
  params: {
    screen_name: 'family_tree',
    screen_class: 'FamilyTreeScreen',
    screen_duration_ms: 15000, // 页面停留时间(ms)
  }
}
```

### 3.3 页面停留时间

- 在用户离开页面时记录停留时间

---

## 4. 事件参数设计

### 4.1 公共参数

| 参数名称 | 参数类型 | 参数含义 |
|----------|----------|----------|
| operating_system | 字符串 | 操作系统 (ios / android) |
| os_version | 字符串 | 操作系统版本 |
| app_version | 字符串 | 应用版本 |
| device_model | 字符串 | 设备型号 |
| is_tablet | 布尔值 | 是否平板 |
| connection_type | 字符串 | 网络类型 |
| session_id | 字符串 | 会话ID |
| timestamp | 数字 | 事件发生时间戳 |

### 4.2 事件特定参数

| 参数名称 | 适用事件 | 参数类型 | 参数含义 |
|----------|----------|----------|----------|
| family_id | 家族管理 | 字符串 | 家族ID |
| family_size | 家族/成员事件 | 数字 | 家族成员数 |
| member_gender | 成员添加 | 字符串 | 成员性别 |
| member_birth_year | 成员添加 | 数字 | 出生年份 |
| relation_type | 关系计算 | 字符串 | 关系类型 |
| relation_depth | 关系计算 | 数字 | 关系深度 |
| export_format | 导出事件 | 字符串 | 导出格式 |
| has_private_data | 导出事件 | 布尔值 | 是否包含隐私数据 |
| is_password_protected | 导出事件 | 布尔值 | 是否密码保护 |
| duration_ms | 耗时相关事件 | 数字 | 操作耗时(ms) |
| theme | 主题切换 | 字符串 | 主题 (light / dark / system) |
| language | 语言切换 | 字符串 | 语言 (zh-CN / en-US) |

---

## 5. 隐私保护措施

### 5.1 不收集的信息

| 信息类型 | 说明 |
|----------|------|
| 真实姓名 | 不收集真实姓 |
| 出生日期 | 仅收集出生年份 |
| 联系方式 | 不收集 |
| 地理位置 | 不收集 |
| 个人身份信息 | 不收集 |
| 生物特征 | 不收集 |

### 5.2 数据匿名化

| 处理方式 |
|------|
| 用户ID 使用 UUID |
| 无个人姓名 匿名处理 |
| 不关联真实身份 |

### 5.3 用户控制

| 功能 | 说明 |
|------|
| 退出追踪 | 用户可关闭追踪 |
| 删除历史数据 | 用户可删除历史数据 |
| 导出数据 | 用户可导出自己的数据 |

---

## 6. 验证方案

### 6.1 调试模式验证

#### 步骤 1: 启用调试模式

```typescript
// 在应用启动时
import { analytics } from './src/config/analytics';

analytics.initialize({
  debug: true, // 启用调试模式
  trackingEnabled: true,
});
```

#### 步骤 2: 模拟操作

1. 打开应用，打开埋点测试页面
2. 依次点击测试按钮触发事件
3. 查看控制台日志输出

#### 步骤 3: 验证事件队列

```typescript
// 在控制台打印事件队列
const queue = analytics.getEventQueue();
console.log('Event Queue:', queue);
```

### 6.2 数据后台验证

| 平台 | 验证项 |
|------|--------|
| Firebase Analytics | 事件页面 |
| 自定义后端 | 事件日志 |

#### Firebase Analytics 验证

1. 打开 Firebase Console
2. 选择项目
3. 进入 Events 页面
4. 验证事件列表和参数值

### 6.3 验证清单

#### 事件验证

| 事件 | 是否触发 | 参数正确 | 无隐私泄露 |
|------|----------|------------|
| family_create | ☐ | ☐ | ☐ |
| member_add | ☐ | ☐ | ☐ |
| relation_calculate | ☐ | ☐ | ☐ |
| gedcom_export | ☐ | ☐ | ☐ |
| photo_restore | ☐ | ☐ | ☐ |

#### 页面验证

| 页面 | screen_view | 停留时间记录 |
|------|------------|--------------|
| home | ☐ | ☐ |
| family_tree | ☐ | ☐ |
| member_list | ☐ | ☐ |

### 6.4 隐私验证

| 检查项 | 检查内容 |
|--------|
| 无真实姓名 | ☑️ |
| 无完整出生日期 | ☑️ |
| 无联系方式 | ☑️ |
| 无地理位置 | ☑️ |

---

## 7. 数据应用建议

### 7.1 产品优化建议

| 分析维度 | 分析内容 |
|----------|----------|
| 用户行为路径 | 主要操作路径 |
| 功能使用频率 | 功能使用情况 |
| 性能指标 | 页面/功能使用时长 |

### 7.2 性能优化建议

| 优化方向 | 分析内容 |
|----------|----------|
| 页面加载时间 | 优化目标 |
| 功能响应时间 | 性能瓶颈 |
| 崩溃监控 | 稳定性监控 |

### 7.3 商业洞察

| 洞察方向 | 具体内容 |
|----------|----------|
| 用户偏好 | 功能受欢迎程度 |
| 家族规模 | 平均/分布 |
| 功能覆盖 | 用户使用范围 |

---

## 附录

### A. 相关文件

| 文件 | 描述 |
|------|------|
| src/constants/analytics.ts | 事件和参数定义 |
| src/config/analytics.ts | 埋点核心服务 |
| src/hooks/useAnalytics.ts | 埋点 Hooks |
| app/dev/analytics-test.tsx | 埋点测试页面 |

### B. 快速集成示例

#### 集成到组件

```typescript
import { useScreenTracking, useEventTracking } from './src/hooks/useAnalytics';
import { analytics } from './src/config/analytics';

const YourComponent = () => {
  useScreenTracking('screen_name');
  const { logFamilyCreate } = useEventTracking();
  
  const handleCreateFamily = () => {
    const startTime = Date.now();
    // ... 创建家族
    const duration = Date.now() - startTime;
    logFamilyCreate(5, duration);
  };
  
  return <View />;
};
```

### C. 错误处理

```typescript
try {
  analytics.logEvent('event_name');
} catch (error) {
  console.error('Analytics error:', error);
}
```
