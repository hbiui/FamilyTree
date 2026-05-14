# Detox 端到端测试运行指南

## 概述

本指南提供 Detox 端到端测试的完整运行命令和预期结果，涵盖注册/登录、创建家族、添加成员、建立关系、查看家族树、导出 GEDCOM 和邀请协作者的完整工作流测试。

## 目录

1. [环境准备](#1-环境准备)
2. [安装依赖](#2-安装依赖)
3. [项目配置](#3-项目配置)
4. [运行测试](#4-运行测试)
5. [预期结果](#5-预期结果)
6. [调试方法](#6-调试方法)

---

## 1. 环境准备

### 1.1 系统要求

| 要求 | 说明 |
|------|------|
| 操作系统 | macOS 10.15+ / Windows 10+ / Ubuntu 20.04+ |
| Node.js | v16.0+ |
| npm/yarn | 最新版本 |
| Java | JDK 11+ |
| Xcode | 12.0+（仅 iOS） |
| Android Studio | 最新版本（仅 Android） |

### 1.2 检查环境

```bash
# 检查 Node.js 版本
node --version
# 预期: v16.0.0 或更高

# 检查 npm 版本
npm --version
# 预期: 8.0.0 或更高

# 检查 Java 版本
java -version
# 预期: openjdk 11 或更高
```

---

## 2. 安装依赖

### 2.1 安装 Detox

```bash
# 安装 Detox
npm install --save-dev detox@latest

# 或使用 yarn
yarn add --dev detox@latest
```

### 2.2 安装 Jest 和相关依赖

```bash
# 安装 Jest 测试框架
npm install --save-dev jest @types/jest ts-jest

# 安装 TypeScript 支持
npm install --save-dev typescript @types/node
```

### 2.3 安装 iOS 依赖（仅 macOS）

```bash
# 安装 CocoaPods 依赖
cd ios && pod install && cd ..
```

---

## 3. 项目配置

### 3.1 创建 Detox 配置文件

项目根目录应包含 `detox.config.js`：

```javascript
module.exports = {
  testEnvironment: './e2e/testEnvironment',
  specs: 'e2e/**/*.spec.ts',
  
  configurations: {
    'ios.simulator': {
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/FamilyTree.app',
      build: 'xcodebuild -workspace ios/FamilyTree.xcworkspace -scheme FamilyTree -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      type: 'ios.simulator',
      device: {
        id: 'iPhone 15 Pro',
        type: 'iPhone',
      },
    },
    
    'android.emu': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug && cd ..',
      type: 'android.emulated',
      device: {
        avdName: 'Pixel_5_API_30',
      },
    },
  },
};
```

### 3.2 更新 package.json

```json
{
  "scripts": {
    "detox:build": "detox build",
    "detox:test": "detox test",
    "detox:build:ios": "detox build --configuration ios.simulator",
    "detox:build:android": "detox build --configuration android.emu",
    "detox:test:ios": "detox test --configuration ios.simulator",
    "detox:test:android": "detox test --configuration android.emu",
    "detox:clean": "detox clean-framework-cache && detox build-framework-cache"
  }
}
```

---

## 4. 运行测试

### 4.1 构建应用

#### iOS 构建

```bash
# 构建 iOS 应用
npm run detox:build:ios
```

**预期输出：**

```
✅  Building FamilyTree.app...
   ✓  Built successfully
   📦  Bundle size: ~25MB
```

#### Android 构建

```bash
# 构建 Android 应用
npm run detox:build:android
```

**预期输出：**

```
✅  Building app-debug.apk...
   ✓  Built successfully
   📦  APK size: ~35MB
```

### 4.2 运行测试

#### 运行所有测试

```bash
# 运行所有端到端测试
npm run detox:test
```

#### 运行特定测试套件

```bash
# 只运行认证测试
npm run detox:test -- e2e/auth.spec.ts

# 只运行家族管理测试
npm run detox:test -- e2e/family.spec.ts

# 只运行成员管理测试
npm run detox:test -- e2e/member.spec.ts

# 只运行导出和邀请测试
npm run detox:test -- e2e/export-invite.spec.ts

# 只运行端到端集成测试
npm run detox:test -- e2e/e2e-workflow.spec.ts
```

#### iOS 测试

```bash
# 在 iOS 模拟器上运行测试
npm run detox:test:ios
```

#### Android 测试

```bash
# 在 Android 模拟器上运行测试
npm run detox:test:android
```

### 4.3 调试模式运行

```bash
# 启用调试模式（显示详细日志）
npm run detox:test -- --debug

# 启用 Jest 观察模式
npm run detox:test -- --watch

# 单个测试调试
npm run detox:test -- e2e/auth.spec.ts -- --testNamePattern="S1.1"
```

---

## 5. 预期结果

### 5.1 测试套件概览

| 测试套件 | 文件 | 测试数量 | 描述 |
|---------|------|---------|------|
| 认证测试 | `auth.spec.ts` | 10 | 登录/注册流程 |
| 家族管理测试 | `family.spec.ts` | 13 | 家族 CRUD |
| 成员管理测试 | `member.spec.ts` | 15 | 成员 CRUD 和关系 |
| 导出邀请测试 | `export-invite.spec.ts` | 21 | GEDCOM 导出和邀请 |
| **端到端测试** | `e2e-workflow.spec.ts` | **23** | **完整工作流** |

### 5.2 完整端到端测试预期结果

运行 `npm run detox:test -- e2e/e2e-workflow.spec.ts`：

#### 阶段 1：用户认证

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-01 | 启动应用并验证欢迎页面 | ✅ 通过 | PASS |
| E2E-02 | 导航到注册页面 | ✅ 通过 | PASS |
| E2E-03 | 注册新用户 | ✅ 通过 | PASS |
| E2E-04 | 验证登录成功并进入首页 | ✅ 通过 | PASS |

#### 阶段 2：创建家族

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-05 | 创建新家族 | ✅ 通过 | PASS |
| E2E-06 | 验证家族创建成功 | ✅ 通过 | PASS |
| E2E-07 | 进入家族详情页 | ✅ 通过 | PASS |

#### 阶段 3：添加家族成员

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-08 | 添加父亲 | ✅ 通过 | PASS |
| E2E-09 | 添加母亲 | ✅ 通过 | PASS |
| E2E-10 | 添加子女 | ✅ 通过 | PASS |
| E2E-11 | 验证所有成员已添加 | ✅ 通过 | PASS |

#### 阶段 4：建立成员关系

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-12 | 设置子女的父亲关系 | ✅ 通过 | PASS |
| E2E-13 | 设置子女的母亲关系 | ✅ 通过 | PASS |
| E2E-14 | 设置父母的配偶关系 | ✅ 通过 | PASS |
| E2E-15 | 验证关系设置成功 | ✅ 通过 | PASS |

#### 阶段 5：查看家族树

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-16 | 切换到家族树视图 | ✅ 通过 | PASS |
| E2E-17 | 验证家族树显示所有成员 | ✅ 通过 | PASS |
| E2E-18 | 点击节点查看详情 | ✅ 通过 | PASS |

#### 阶段 6：导出 GEDCOM

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-19 | 进入导出页面 | ✅ 通过 | PASS |
| E2E-20 | 选择 GEDCOM 格式并导出 | ✅ 通过 | PASS |

#### 阶段 7：邀请协作者

| 测试 ID | 测试项 | 预期结果 | 状态 |
|---------|--------|---------|------|
| E2E-21 | 进入邀请页面 | ✅ 通过 | PASS |
| E2E-22 | 复制邀请链接 | ✅ 通过 | PASS |
| E2E-23 | 生成邀请二维码 | ✅ 通过 | PASS |

#### 测试总结

```
====================================================
🎉 端到端测试完成
====================================================
📊 总测试数: 23
✅ 通过: 23
❌ 失败: 0
⏱️  总耗时: ~15-20 分钟
📱 设备: iPhone 15 Pro Simulator / Android Emulator
====================================================
```

### 5.3 单个测试套件预期结果

#### auth.spec.ts（认证测试）

```
describe: 注册/登录流程
  ✅ S1.1: 验证登录页面元素 (2.5s)
  ✅ S1.2: 使用有效凭据登录 (4.0s)
  ✅ S1.3: 空凭据登录失败 (1.5s)
  ✅ S1.4: 无效邮箱格式 (1.5s)
  ✅ S1.5: 导航到注册页面 (1.5s)
  ✅ S1.6: 验证注册页面元素 (2.0s)
  ✅ S1.7: 使用有效信息注册 (4.0s)
  ✅ S1.8: 密码不匹配验证 (1.5s)
  ✅ S1.9: 密码强度验证 (1.5s)
  ✅ S1.10: 导航回登录页面 (1.5s)

总计: 10 tests | ✅ 10 passed | ⏱️ 21.5s
```

#### family.spec.ts（家族管理测试）

```
describe: 家族管理流程
  ✅ S2.1: 验证创建家族页面元素 (2.5s)
  ✅ S2.2: 填写家族信息并创建 (5.0s)
  ✅ S2.3: 空名称创建失败验证 (1.5s)
  ✅ S2.4: 家族名称长度验证 (1.5s)
  ✅ S2.5: 验证家族列表显示 (2.0s)
  ✅ S2.6: 验证家族卡片元素 (2.5s)
  ✅ S2.7: 点击进入家族详情 (3.0s)
  ✅ S2.8: 验证家族成员数量 (2.0s)
  ✅ S2.9: 进入编辑家族页面 (3.0s)
  ✅ S2.10: 修改家族信息 (4.0s)
  ✅ S2.11: 取消编辑操作 (3.0s)
  ✅ S2.12: 删除家族二次确认 (1.5s)
  ✅ S2.13: 取消删除操作 (1.5s)

总计: 13 tests | ✅ 13 passed | ⏱️ 33s
```

#### member.spec.ts（成员管理测试）

```
describe: 成员管理流程
  ✅ S3.1: 验证添加成员按钮 (2.0s)
  ✅ S3.2: 验证添加成员表单元素 (3.0s)
  ✅ S3.3: 填写成员信息并保存 (5.0s)
  ✅ S3.4: 空姓名验证 (2.5s)
  ✅ S3.5: 性别选择验证 (2.0s)
  ✅ S3.6: 成员显示在列表中 (2.0s)
  ✅ S3.7: 进入成员详情页 (3.0s)
  ✅ S3.8: 编辑成员信息 (4.0s)
  ✅ S3.9: 删除成员确认 (1.5s)
  ✅ S3.10: 添加配偶按钮 (3.0s)
  ✅ S3.11: 设置为配偶关系 (2.5s)
  ✅ S3.12: 选择配偶 (3.0s)
  ✅ S3.13: 验证配偶关系显示 (2.5s)
  ✅ S3.14: 添加父亲 (3.0s)
  ✅ S3.15: 设置为父亲关系 (3.0s)

总计: 15 tests | ✅ 15 passed | ⏱️ 45s
```

#### export-invite.spec.ts（导出和邀请测试）

```
describe: 导出与邀请流程
  ✅ S4.1: 验证导出入口 (2.0s)
  ✅ S4.2: 进入导出页面 (3.0s)
  ✅ S4.3: 选择 GEDCOM 格式 (2.0s)
  ✅ S4.4: 验证隐私过滤选项 (2.0s)
  ✅ S4.5: 启用隐私过滤 (1.5s)
  ✅ S4.6: 验证加密选项 (2.0s)
  ✅ S4.7: 启用密码保护 (1.5s)
  ✅ S4.8: 输入密码并确认 (2.5s)
  ✅ S4.9: 执行导出 (6.0s)
  ✅ S4.10: 分享导出文件 (2.5s)
  ✅ S4.11: 选择微信分享 (4.0s)
  ✅ S4.12: 验证邀请入口 (2.0s)
  ✅ S4.13: 进入邀请页面 (3.0s)
  ✅ S4.14: 复制邀请链接 (2.0s)
  ✅ S4.15: 分享邀请链接 (3.0s)
  ✅ S4.16: 选择二维码邀请 (2.0s)
  ✅ S4.17: 保存二维码 (3.0s)
  ✅ S4.18: 分享二维码 (3.0s)
  ✅ S4.19: 查看协作者列表 (3.0s)
  ✅ S4.20: 修改协作者权限 (4.0s)
  ✅ S4.21: 移除协作者 (3.0s)

总计: 21 tests | ✅ 21 passed | ⏱️ 56s
```

---

## 6. 调试方法

### 6.1 查看详细日志

```bash
# 启用详细日志
npm run detox:test -- --loglevel trace
```

### 6.2 截图和录制

Detox 自动在测试失败时截图。查看：

```
e2e/artifacts/
  ├── android.emu/
  │   ├── S1.1/
  │   │   └── screenshot.png
  │   └── ...
  └── ios.simulator/
      └── ...
```

### 6.3 常见问题排查

#### 问题 1：构建失败

```bash
# 清理缓存并重新构建
npm run detox:clean
npm run detox:build
```

#### 问题 2：找不到模拟器

```bash
# 列出可用设备
xcrun simctl list devices available

# 或
adb devices
```

#### 问题 3：测试超时

增加超时时间：

```javascript
// detox.config.js
module.exports = {
  testTimeout: 300000, // 5 分钟
};
```

### 6.4 快速运行单个测试

```bash
# 运行单个测试
npm run detox:test -- e2e/auth.spec.ts -- --testNamePattern="S1.1"
```

---

## 附录

### A. 测试文件清单

| 文件 | 描述 |
|------|------|
| `e2e/config.json` | Detox 配置 |
| `e2e/init.ts` | 测试初始化 |
| `e2e/global-setup.ts` | 全局设置 |
| `e2e/global-teardown.ts` | 全局清理 |
| `e2e/helpers/common.ts` | 通用辅助函数 |
| `e2e/auth.spec.ts` | 认证测试 |
| `e2e/family.spec.ts` | 家族管理测试 |
| `e2e/member.spec.ts` | 成员管理测试 |
| `e2e/export-invite.spec.ts` | 导出邀请测试 |
| `e2e/e2e-workflow.spec.ts` | 端到端集成测试 |

### B. 辅助函数说明

| 函数 | 用途 |
|------|------|
| `waitForElement` | 等待元素出现 |
| `tap` | 点击元素 |
| `inputText` | 输入文本 |
| `expectToBeVisible` | 断言元素可见 |
| `expectToExist` | 断言元素存在 |
| `expectToHaveText` | 断言元素文本 |
| `sleep` | 等待指定时间 |
| `reloadApp` | 重启应用 |

### C. 性能基准

| 指标 | 预期值 |
|------|--------|
| 单个测试平均耗时 | 2-3s |
| 完整测试套件耗时 | 3-5 分钟 |
| 端到端测试耗时 | 15-20 分钟 |
| 应用启动时间 | < 5s |
| 页面切换时间 | < 2s |

### D. CI/CD 集成示例

#### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build iOS
        run: npm run detox:build:ios
        
      - name: Run E2E tests
        run: npm run detox:test:ios
```
