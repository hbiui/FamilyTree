# 实时协作功能测试验收指南

## 一、功能概述

本次实现了完整的实时协作功能，包括：

| 功能模块 | 文件 | 说明 |
|---------|------|------|
| 邀请码服务 | `src/services/collaborationService.ts` | 生成、验证邀请码 |
| 实时订阅 | `src/services/realtimeService.ts` | Supabase Realtime 订阅 |
| 状态管理 | `src/store/useCollaborationStore.ts` | Zustand 协作状态 |
| 在线显示 | `src/components/collaboration/OnlineCollaborators.tsx` | 在线协作者头像 |
| 邀请页面 | `app/join-family.tsx` | 加入家族页面 |
| 管理页面 | `app/manage-collaborators.tsx` | 协作者管理页面 |

---

## 二、双设备测试方案

### 2.1 测试环境准备

#### 设备要求

| 设备 | 账号 | 角色 | 说明 |
|------|------|------|------|
| 设备A（模拟器） | 账号A | 管理员 | 主测试设备 |
| 设备B（模拟器/真机） | 账号B | 普通成员 | 协作者设备 |

#### 模拟器启动命令

**Android 模拟器：**

```bash
# 启动两个 Android 模拟器
emulator -avd Pixel_4_API_30 &
emulator -avd Pixel_5_API_30 &

# 或者使用 Genymotion
Genymotion -v TwoDevices &
```

**iOS 模拟器（macOS）：**

```bash
# 打开两个 iOS 模拟器
open -n -a Simulator
# 重复打开第二个
open -n -a Simulator
```

### 2.2 测试账号准备

#### 账号A（管理员）

```javascript
{
  id: "user-admin-001",
  email: "admin@test.com",
  name: "家族管理员",
  role: "owner"
}
```

#### 账号B（普通成员）

```javascript
{
  id: "user-member-001", 
  email: "member@test.com",
  name: "协作成员",
  role: "member"
}
```

---

## 三、验收测试流程

### 3.1 邀请码生成测试

#### 测试步骤

```
步骤1：A账号登录应用
步骤2：进入"我的家族" → "邀请协作者"
步骤3：点击"生成邀请码"
步骤4：等待生成成功，记录6位邀请码
步骤5：点击"复制"或"分享"按钮
```

#### 预期结果

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 生成按钮可见 | 页面有"生成邀请码"按钮 | — |
| 邀请码格式 | 6位大写字母/数字混合 | — |
| 复制功能 | 邀请码复制到剪贴板 | — |
| 分享功能 | 弹出系统分享面板 | — |
| 有效期显示 | 显示"24小时后过期" | — |

### 3.2 加入家族测试

#### 测试步骤

```
步骤1：B账号登录应用
步骤2：进入"加入家族"页面
步骤3：输入正确的6位邀请码
步骤4：观察是否显示家族名称预览
步骤5：点击"加入家族"按钮
步骤6：等待加入成功提示
```

#### 预期结果

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 输入验证 | 只接受6位大写字母 | — |
| 实时预览 | 输入完整码后显示家族名 | — |
| 加载状态 | 按钮显示加载中 | — |
| 成功提示 | 弹出"加入成功"Alert | — |
| 自动跳转 | 加入后跳转至家族树页面 | — |

### 3.3 实时同步测试（核心）

#### 测试步骤

```
前提条件：A和B都已加入同一家族，且都在线

【场景一：编辑成员姓名同步】

步骤1：A在设备A打开家族树
步骤2：B在设备B打开同一家族树
步骤3：A点击某个成员（如"王志强"）
步骤4：A点击"编辑"按钮
步骤5：A修改姓名为"王志强化名"
步骤6：A点击"保存修改"
步骤7：立即在设备B观察该节点

【场景二：新增成员同步】

步骤1：A点击"添加成员"按钮
步骤2：A填写新成员"李四"
步骤3：A点击"添加成员"
步骤4：立即在设备B观察新节点是否出现

【场景三：删除成员同步】

步骤1：A选择某个成员
步骤2：A点击删除按钮
步骤3：A确认删除
步骤4：立即在设备B观察该节点是否消失
```

#### 预期结果

| 检查点 | 预期结果 | 最大延迟 | 通过 |
|--------|---------|---------|------|
| 姓名修改同步 | 设备B看到新姓名 | 2秒 | — |
| 新增成员同步 | 设备B看到新节点 | 2秒 | — |
| 删除成员同步 | 设备B节点消失 | 2秒 | — |
| 在线指示器 | 双方都能看到对方头像 | 即时 | — |
| 状态更新 | 树组件自动重新渲染 | 1秒 | — |

---

## 四、边界情况测试

### 4.1 冲突编辑测试

#### 测试场景：两人同时编辑同一成员

**测试编号：** BC-001

**测试目的：** 验证后提交者的变更能正确覆盖

**前置条件：**
- A和B都在线
- 成员"王志强"的当前姓名是"王志强"

**测试步骤：**

```
1. A和B同时进入"王志强"的编辑页面
2. A将姓名修改为"王志强-A"
3. B将姓名修改为"王志强-B"
4. A先点击"保存"（时间戳较早）
5. B后点击"保存"（时间戳较晚）
6. 观察两设备的最终显示
```

**预期结果：**

```
最终状态：所有人的设备都显示"王志强-B"
原因：B的保存时间戳晚于A，后提交者覆盖
```

**验收标准：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 冲突检测 | 系统不报冲突错误 | — |
| 乐观更新 | 提交者立即看到自己的修改 | — |
| 最终一致性 | 所有设备显示相同的最终结果 | — |
| 时间戳顺序 | 较晚的保存覆盖较早的 | — |

### 4.2 网络中断测试

#### 测试场景：编辑时网络断开

**测试编号：** BC-002

**测试目的：** 验证网络恢复后数据同步

**测试步骤：**

```
1. A开始编辑成员"李四"
2. A修改姓名为"李四-编辑中"
3. 在A点击保存前，切换设备A为飞行模式
4. A点击"保存修改"
5. 观察错误提示（应该提示网络错误）
6. 等待30秒
7. 恢复网络连接
8. 观察数据是否自动同步
```

**预期结果：**

```
1. 保存失败，显示错误提示
2. 数据保持在"李四-编辑中"状态
3. 网络恢复后，如果没有自动同步，A可以重试保存
4. 如果自动同步，应该看到两个选择：
   - "同步远程版本（王志强）"
   - "保留本地修改（李四-编辑中）"
```

**验收标准：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 错误提示 | 显示"网络错误"提示 | — |
| 数据保持 | 编辑内容没有丢失 | — |
| 重试机制 | 可以重新提交 | — |
| 数据完整性 | 最终数据不会损坏 | — |

### 4.3 重复加入测试

#### 测试场景：同一账号重复加入家族

**测试编号：** BC-003

**测试目的：** 验证不能重复加入

**测试步骤：**

```
1. B使用同一账号登录
2. B尝试使用同一邀请码再次加入
3. 或者B使用不同邀请码加入同一家族
```

**预期结果：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 重复码加入 | 提示"您已是该家族成员" | — |
| 不同码同家族 | 提示"您已是该家族成员" | — |
| 加入页面状态 | 显示当前已加入的家族 | — |

### 4.4 权限验证测试

#### 测试场景：普通成员尝试管理员操作

**测试编号：** BC-004

**测试目的：** 验证权限控制生效

**测试步骤：**

```
1. B以普通成员身份登录
2. B尝试进入"邀请协作者"页面
3. B尝试点击"生成邀请码"按钮
4. B尝试移除其他成员
```

**预期结果：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 邀请页面访问 | 可能隐藏或显示权限不足 | — |
| 生成按钮 | 可能禁用或点击后提示无权限 | — |
| 移除操作 | 提示"无权执行此操作" | — |
| 编辑权限 | 普通成员可以编辑成员信息 | — |

---

## 五、在线协作者显示测试

### 5.1 在线指示器测试

**测试步骤：**

```
1. A登录并进入家族树
2. 观察在线协作者显示区域（右上角）
3. B登录并进入同一家族
4. 观察A的设备是否更新在线列表
5. 记录在线头像数量
6. B退出应用或关闭屏幕
7. 等待30秒，观察A的设备
```

**预期结果：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 单人在线 | 只显示A的头像 | — |
| 双人在线 | 显示A和B的头像堆叠 | — |
| 头像样式 | 绿色圆点指示在线 | — |
| 离开状态 | B的头像消失或变灰 | — |
| 实时更新 | 头像列表实时更新 | — |

### 5.2 性能测试

**测试步骤：**

```
1. 5人同时在线
2. A进行编辑操作
3. 观察B、C、D、E是否都收到更新
4. 记录从A保存到其他设备显示的时间
```

**预期结果：**

| 检查点 | 预期结果 | 通过 |
|--------|---------|------|
| 多设备同步 | 所有在线设备都收到更新 | — |
| 延迟 | 5人在线时延迟 < 3秒 | — |
| 性能 | 家族树页面无卡顿 | — |
| 内存 | 内存占用无异常增长 | — |

---

## 六、数据库 Schema 更新

如果需要手动创建相关表，请执行以下 SQL：

```sql
-- 邀请码表
CREATE TABLE invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) NOT NULL UNIQUE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_code CHECK (LENGTH(code) = 6)
);

-- 家族成员表
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    avatar_url TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_family_user UNIQUE (family_id, user_id),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

-- 索引
CREATE INDEX idx_invite_codes_family ON invite_codes(family_id);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);

-- RLS 策略
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 邀请码：家族成员可查看
CREATE POLICY "invite_codes_read" ON invite_codes
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- 邀请码：管理员可创建
CREATE POLICY "invite_codes_insert" ON invite_codes
    FOR INSERT WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 邀请码：管理员可删除
CREATE POLICY "invite_codes_delete" ON invite_codes
    FOR DELETE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 家族成员：可查看同家族成员
CREATE POLICY "family_members_read" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- 家族成员：管理员可修改
CREATE POLICY "family_members_update" ON family_members
    FOR UPDATE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 启用 Realtime（需要 Supabase Pro 计划）
ALTER PUBLICATION supabase_realtime ADD TABLE persons;
ALTER PUBLICATION supabase_realtime ADD TABLE relations;
```

---

## 七、测试报告模板

### 7.1 测试执行记录

| 测试编号 | 测试类型 | 测试人 | 测试时间 | 结果 |
|---------|---------|--------|---------|------|
| | | | | |
| | | | | |

### 7.2 发现的问题

| 问题编号 | 严重程度 | 描述 | 复现步骤 | 状态 |
|---------|---------|------|---------|------|
| | | | | |
| | | | | |

### 7.3 验收签字

| 角色 | 姓名 | 日期 | 签字 |
|------|------|------|------|
| 测试人员 | | | |
| 开发人员 | | | |
| 产品人员 | | | |

---

## 八、常见问题排查

### 问题1：实时同步不生效

**排查步骤：**

```
1. 检查 Supabase 项目是否启用 Realtime
   - Settings → Database → Replication
   - 确保 persons 和 relations 表在 Replication 中

2. 检查 RLS 策略
   - 确保表有正确的 SELECT 权限

3. 检查网络连接
   - 确保设备网络正常
   - 测试其他 API 调用是否正常

4. 检查浏览器控制台
   - 查看是否有 WebSocket 连接错误
   - 查看订阅状态
```

### 问题2：在线状态不更新

**排查步骤：**

```
1. 检查 Presence 配置
   - 确保 channel 配置了 presence

2. 检查 track 调用
   - 确保每个用户都正确调用了 track

3. 检查防火墙
   - 确保 54321 端口可访问
```

### 问题3：权限控制不生效

**排查步骤：**

```
1. 检查 RLS 策略
   - 查看数据库中的策略定义
   - 测试 SELECT 权限

2. 检查服务端验证
   - 邀请码创建等操作是否在服务端验证了权限
```

---

**文档版本**：v1.0  
**最后更新**：2024年  
**测试覆盖率**：8个核心测试场景 + 4个边界测试
