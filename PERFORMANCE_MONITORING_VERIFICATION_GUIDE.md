# 性能监控与错误处理验证指南

## 概述

本指南提供家族树应用性能监控和错误处理功能的完整验证方案，涵盖：
- Sentry 崩溃日志收集
- 关键页面加载时间监控
- 全局错误处理和降级页面

---

## 目录

1. [Sentry 配置验证](#1-sentry-配置验证)
2. [崩溃日志收集验证](#2-崩溃日志收集验证)
3. [性能监控验证](#3-性能监控验证)
4. [错误边界验证](#4-错误边界验证)
5. [慢网络测试](#5-慢网络测试)

---

## 1. Sentry 配置验证

### 1.1 配置文件

确保以下配置正确：

```typescript
// src/config/sentry.ts
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE';
```

### 1.2 环境变量设置

创建 `.env` 文件：

```bash
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/1234567
```

### 1.3 初始化验证

在应用启动时检查 Sentry 是否正确初始化：

```typescript
// app/_layout.tsx
import { initSentry } from '../src/config/sentry';

// 在应用启动时调用
initSentry();
```

### 1.4 验证步骤

1. 打开 [Sentry Dashboard](https://sentry.io/)
2. 选择对应的项目
3. 检查是否有初始化日志

---

## 2. 崩溃日志收集验证

### 2.1 手动触发测试异常

#### 方法 1：使用测试页面

1. 启动应用
2. 导航到「设置」→「开发者选项」→「测试错误」
3. 点击「触发 JavaScript 错误」按钮
4. 检查 Sentry 后台是否收到事件

#### 方法 2：代码中触发

```typescript
import { captureException } from '../config/sentry';

// 在任意位置调用
const testError = () => {
  try {
    throw new Error('Test Error - 这是一条测试错误消息');
  } catch (error) {
    captureException(error, { testType: 'manual_test' });
  }
};
```

### 2.2 验证清单

| 测试项 | 操作 | 预期结果 | 验证状态 |
|--------|------|----------|----------|
| JavaScript 错误 | 点击测试按钮 | Sentry 收到错误事件 | ✅ |
| TypeError | 访问 null 对象属性 | Sentry 收到 TypeError | ✅ |
| 异步错误 | Promise reject | Sentry 收到异步错误 | ✅ |
| 自定义消息 | 发送测试消息 | Sentry 收到消息 | ✅ |
| 警告消息 | 发送警告 | Sentry 收到警告 | ✅ |

### 2.3 Sentry 后台验证

1. 登录 Sentry Dashboard
2. 进入「Issues」页面
3. 查找测试错误事件
4. 检查以下信息：
   - 错误消息
   - 堆栈跟踪
   - 设备信息
   - 用户信息
   - 面包屑（Breadcrumbs）

### 2.4 错误详情验证

在 Sentry 后台检查错误详情：

| 字段 | 预期值 |
|------|--------|
| Error Type | Error / TypeError |
| Message | Test Error - 这是一条测试错误消息 |
| Stack Trace | 显示完整调用栈 |
| Environment | development / production |
| Platform | ios / android |
| Release | 应用版本号 |

---

## 3. 性能监控验证

### 3.1 页面加载时间监控

#### 家族树渲染时间

```typescript
import { performanceMonitor } from '../utils/performance';

// 在家族树页面
const FamilyTreeScreen = () => {
  const startTime = Date.now();
  
  useEffect(() => {
    const duration = performanceMonitor.measurePageLoad('FamilyTree', startTime);
    console.log(`Family tree loaded in ${duration}ms`);
  }, []);
  
  // ...
};
```

#### 详情页打开时间

```typescript
// 在详情页
const MemberDetailScreen = () => {
  const startTime = Date.now();
  
  useEffect(() => {
    const duration = performanceMonitor.measurePageLoad('MemberDetail', startTime);
    console.log(`Member detail loaded in ${duration}ms`);
  }, []);
  
  // ...
};
```

### 3.2 API 调用监控

```typescript
import { performanceMonitor } from '../utils/performance';

// 监控 API 调用
const loadData = async () => {
  const startTime = Date.now();
  
  try {
    const result = await api.get('/members');
    const duration = Date.now() - startTime;
    performanceMonitor.measureApiCall('/api/members', 'GET', duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.measureApiCall('/api/members', 'GET', duration, false);
    throw error;
  }
};
```

### 3.3 性能报告获取

```typescript
// 获取性能报告
const report = performanceMonitor.getReport();
console.log('Performance Report:', report);

// 报告结构
{
  metrics: [...],
  pageLoads: {
    'FamilyTree': 1234,
    'MemberDetail': 567,
  },
  apiCalls: {
    '/api/members': {
      count: 10,
      avgDuration: 234,
      errors: 0,
    },
  },
  userInteractions: {
    'tap_member_card': 15,
    'scroll_list': 8,
  },
}
```

### 3.4 性能阈值验证

| 指标 | 阈值 | 说明 |
|------|------|------|
| 页面加载 | < 1000ms | 正常 |
| 页面加载 | > 1000ms | 触发警告 |
| API 调用 | < 5000ms | 正常 |
| API 调用 | > 5000ms | 触发警告 |

---

## 4. 错误边界验证

### 4.1 错误边界组件

错误边界会捕获以下错误：
- 渲染期间的错误
- 生命周期方法中的错误
- 子组件树中的错误

### 4.2 测试错误边界

```typescript
// 创建一个会抛出错误的组件
const ErrorComponent = () => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Test Error Boundary');
  }
  
  return (
    <Button title="触发错误" onPress={() => setShouldError(true)} />
  );
};

// 使用错误边界包裹
<ErrorBoundary>
  <ErrorComponent />
</ErrorBoundary>
```

### 4.3 降级页面验证

当错误发生时，应显示降级页面，包含：
- 错误提示图标
- 友好的错误消息
- 重试按钮
- 返回首页按钮
- 开发模式下显示错误详情

### 4.4 验证清单

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 错误捕获 | 组件抛出错误 | 显示降级页面 |
| 错误上报 | 查看 Sentry | 收到错误事件 |
| 重试功能 | 点击重试按钮 | 重新渲染组件 |
| 错误详情 | 开发模式 | 显示错误堆栈 |

---

## 5. 慢网络测试

### 5.1 使用 Charles Proxy 模拟慢网络

#### 配置步骤

1. 打开 Charles Proxy
2. 进入「Proxy」→「Throttle Settings」
3. 启用带宽限制
4. 设置参数：
   - Bandwidth: 500 Kbps
   - Latency: 1000 ms

#### 测试场景

| 场景 | 带宽 | 延迟 | 预期结果 |
|------|------|------|----------|
| 3G 网络 | 384 Kbps | 200 ms | 加载时间 > 1s |
| 慢速 4G | 1 Mbps | 100 ms | 加载时间 < 1s |
| 离线模式 | 0 Kbps | - | 显示离线提示 |

### 5.2 使用 Network Link Conditioner (macOS)

#### 配置步骤

1. 打开「Network Link Conditioner」（在 Xcode 工具中）
2. 选择预设配置：
   - 100% Loss: 完全断网
   - 3G: 384Kbps, 100ms 延迟
   - DSL: 2Mbps, 5ms 延迟
3. 启用限制

### 5.3 验证加载时间上报

#### 步骤 1：配置慢网络

使用 Charles 或 Network Link Conditioner 设置 500ms 延迟。

#### 步骤 2：执行操作

1. 打开家族树页面
2. 观察加载时间
3. 检查性能监控日志

#### 步骤 3：验证上报

1. 查看 Sentry Breadcrumbs
2. 检查是否有慢加载警告
3. 验证加载时间数据

### 5.4 预期结果

| 操作 | 正常网络 | 慢网络 (500ms 延迟) |
|------|----------|---------------------|
| 打开家族树 | < 500ms | > 1000ms (触发警告) |
| 加载成员列表 | < 300ms | > 800ms |
| 打开详情页 | < 200ms | > 500ms |
| API 调用 | < 1000ms | > 3000ms |

---

## 附录

### A. 相关文件

| 文件 | 描述 |
|------|------|
| `src/config/sentry.ts` | Sentry 配置和初始化 |
| `src/utils/performance.ts` | 性能监控工具 |
| `src/utils/errorHandler.ts` | 全局错误处理器 |
| `src/components/error/ErrorBoundary.tsx` | 错误边界组件 |
| `app/dev/test-error.tsx` | 测试错误页面 |

### B. Sentry Dashboard 验证

#### Issues 页面

检查以下内容：
- 错误类型和消息
- 发生次数
- 影响用户数
- 首次和最后发生时间

#### Releases 页面

检查以下内容：
- 版本发布时间
- 崩溃率
- 新问题数量

#### Performance 页面

检查以下内容：
- 事务持续时间
- 吞吐量
- 失败率

### C. 性能指标基准

| 指标 | 目标值 | 警告阈值 |
|------|--------|----------|
| 冷启动时间 | < 3s | > 5s |
| 热启动时间 | < 1s | > 2s |
| 页面切换 | < 300ms | > 500ms |
| API 响应 | < 1s | > 3s |
| 列表滚动 FPS | 60 | < 30 |

### D. 常见问题

#### Q1: Sentry 未收到错误事件

**可能原因：**
- DSN 配置错误
- 网络问题
- 开发模式被过滤

**解决方案：**
```typescript
// 检查配置
console.log('Sentry DSN:', process.env.EXPO_PUBLIC_SENTRY_DSN);

// 在 beforeSend 中添加日志
beforeSend(event, hint) {
  console.log('Sentry Event:', event);
  return event;
}
```

#### Q2: 性能数据未上报

**可能原因：**
- tracesSampleRate 设置过低
- 未正确调用监控方法

**解决方案：**
```typescript
// 提高采样率
tracesSampleRate: 1.0, // 100% 采样

// 确保正确调用
performanceMonitor.measurePageLoad('PageName', startTime);
```

#### Q3: 错误边界未生效

**可能原因：**
- 错误发生在事件处理器中
- 错误发生在异步代码中

**解决方案：**
- 使用 try-catch 处理事件处理器错误
- 使用 ErrorBoundary 包裹异步组件
