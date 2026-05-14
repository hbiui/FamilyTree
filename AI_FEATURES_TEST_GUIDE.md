# AI 功能测试与验证指南

## 📋 功能概述

本次实现了两个 AI 驱动的功能：

1. **关系智能推测** - 使用自然语言描述家族关系，AI 自动解析并生成成员节点和关系
2. **老照片智能修复** - 使用 AI 技术提升老照片清晰度，去除噪点和划痕

---

## 🔧 技术架构

### 文件结构

```
src/
├── types/
│   └── familyTree.ts          # 新增 AI 相关类型定义
├── services/
│   └── aiService.ts           # AI 服务（OpenAI + Replicate API）
├── store/
│   └── useAIStore.ts          # AI 功能状态管理
└── components/
    └── ai/
        ├── RelationParser.tsx   # 关系推测组件
        └── PhotoEnhancer.tsx   # 照片优化组件

app/(tabs)/
└── ai.tsx                     # AI 功能页面
```

### 数据模型

#### 关系推测

```typescript
interface ParsedPerson {
  id: string;
  name: string;
  gender: Gender;
  birth_date?: string;
  death_date?: string;
  is_alive: boolean;
  is_placeholder: boolean;  // AI 生成的占位标记
  notes?: string;
}

interface ParsedRelation {
  from_id: string;
  to_id: string;
  relation_type: RelationType;
  confidence: number;       // AI 置信度 (0-1)
  notes?: string;
}
```

#### 照片优化

```typescript
interface PhotoAnalysis {
  clarity_score: number;     // 清晰度 (0-100)
  sharpness_score: number;   // 锐度 (0-100)
  color_score: number;       // 色彩 (0-100)
  noise_level: number;       // 噪点 (0-100，越高越差)
  face_detected: boolean;
  face_count: number;
  resolution: { width: number; height: number };
  file_size_kb: number;
}

interface PhotoEnhancementResult {
  success: boolean;
  original_url: string;
  enhanced_url: string;
  before_analysis: PhotoAnalysis;
  after_analysis: PhotoAnalysis;
  processing_time_ms: number;
  error?: string;
}
```

---

## 🧪 测试指南

### 1. 关系智能推测测试

#### 输入示例

以下是一些可以使用的测试输入：

| 测试输入 | 预期输出 |
|---------|---------|
| `张三是李四的父亲` | 创建张三和李四，张三 → 李四 关系为 father |
| `李华和王芳结婚了，他们的儿子叫李明` | 创建李华、王芳、李明，建立配偶和父子关系 |
| `张建国的父亲叫张大山，母亲叫刘秀英` | 创建三个人物，建立父母关系 |
| `王小明有一个姐姐叫王小红` | 创建两人，建立兄弟姐妹关系 |

#### 预期 JSON 输出（Mock 模式）

当使用 Mock 模式时，输入 `张三是李四的父亲` 会返回：

```json
{
  "success": true,
  "persons": [
    {
      "id": "uuid-1",
      "name": "张三",
      "gender": "male",
      "is_alive": true,
      "is_placeholder": true,
      "notes": "AI 生成的占位节点"
    },
    {
      "id": "uuid-2",
      "name": "李四",
      "gender": "unknown",
      "is_alive": true,
      "is_placeholder": true,
      "notes": "AI 生成的占位节点"
    }
  ],
  "relations": [
    {
      "from_id": "uuid-1",
      "to_id": "uuid-2",
      "relation_type": "father",
      "confidence": 0.95,
      "notes": "从描述 \"张三是李四的父亲\" 解析"
    },
    {
      "from_id": "uuid-2",
      "to_id": "uuid-1",
      "relation_type": "son",
      "confidence": 0.95,
      "notes": "反向关系"
    }
  ],
  "raw_text": "张三是李四的父亲",
  "ai_notes": "成功解析家族关系"
}
```

#### 测试步骤

1. 打开应用，进入 **AI** 标签页
2. 点击 **关系智能推测** 卡片
3. 在输入框中输入测试文本，或点击示例提示
4. 点击 **开始解析** 按钮
5. 等待 1-2 秒，观察解析结果
6. 验证以下内容：
   - ✅ 成员卡片正确显示，包含姓名和性别
   - ✅ 关系列表正确显示，关系类型准确
   - ✅ 置信度合理（0.7+）
   - ✅ 可以编辑成员性别
   - ✅ 可以删除不需要的成员或关系
7. 点击 **确认添加** 按钮
8. 验证数据已正确添加到成员列表

---

### 2. 老照片智能修复测试

#### 照片效果对比分析

**修复前特征：**
- 清晰度：30-50 分
- 锐度：25-45 分  
- 色彩：40-60 分
- 噪点：60-80 分（越高越差）
- 分辨率：较低（如 600x800）

**修复后预期特征：**
- 清晰度：80-95 分（提升 50-100%）
- 锐度：85-98 分（提升 100-200%）
- 色彩：75-90 分（提升 30-80%）
- 噪点：10-20 分（降低 60-80%）
- 分辨率：翻倍（如 1200x1600）

#### 预期 JSON 输出（Mock 模式）

```json
{
  "success": true,
  "original_url": "https://example.com/old-photo.jpg",
  "enhanced_url": "https://example.com/enhanced-photo.jpg",
  "before_analysis": {
    "clarity_score": 42,
    "sharpness_score": 38,
    "color_score": 55,
    "noise_level": 75,
    "face_detected": true,
    "face_count": 1,
    "resolution": { "width": 600, "height": 800 },
    "file_size_kb": 120
  },
  "after_analysis": {
    "clarity_score": 88,
    "sharpness_score": 92,
    "color_score": 85,
    "noise_level": 15,
    "face_detected": true,
    "face_count": 1,
    "resolution": { "width": 1200, "height": 1600 },
    "file_size_kb": 450
  },
  "processing_time_ms": 2800
}
```

#### 测试步骤

##### 方式一：从 AI 功能页进入

1. 进入 **AI** 标签页
2. 点击 **老照片智能修复** 卡片
3. 选择一张照片（会使用示例照片）
4. 点击 **开始优化** 按钮
5. 等待 2-3 秒处理
6. 验证以下内容：
   - ✅ 显示修复前后对比图
   - ✅ 效果指标有显著提升
   - ✅ 处理时间显示合理
   - ✅ 详细分析数据准确
7. 点击 **保存优化结果**

##### 方式二：从成员详情页进入

1. 进入 **成员** 标签页
2. 选择一位有照片的成员
3. 在头像右上角找到 ✨ 按钮
4. 点击进入优化界面
5. 按照上述步骤测试

---

## 🎯 验证清单

### 关系推测功能

- [ ] **基本解析** - 能正确解析简单的父子、母子关系
- [ ] **复杂关系** - 能解析包含配偶、多个子女的复杂关系
- [ ] **编辑功能** - 可以修改 AI 识别的成员性别
- [ ] **删除功能** - 可以删除不需要的成员或关系
- [ ] **确认添加** - 点击确认后数据正确保存
- [ ] **错误处理** - 输入无效文本时显示友好提示
- [ ] **加载状态** - 解析时显示加载动画

### 照片优化功能

- [ ] **对比显示** - 正确并排显示修复前后对比
- [ ] **指标提升** - 清晰度、锐度等指标显著改善
- [ ] **详细分析** - 显示完整的分析数据
- [ ] **保存功能** - 保存后成员头像更新
- [ ] **入口便捷** - 可从成员详情页快速进入
- [ ] **处理时间** - 显示合理的处理时长
- [ ] **错误处理** - API 失败时有友好提示

### UI/UX

- [ ] **视觉风格** - 与应用整体风格一致
- [ ] **响应速度** - 交互响应及时
- [ ] **空状态** - 无数据时显示友好提示
- [ ] **模态框** - 打开/关闭动画流畅
- [ ] **移动端适配** - 在不同尺寸设备上显示正常

---

## 🔌 API 集成指南

### 启用真实 API

当前默认使用 Mock 模式进行测试。要启用真实 API：

1. 打开 `src/services/aiService.ts`
2. 修改 `MOCK_MODE` 常量：
   ```typescript
   const MOCK_MODE = false;  // 改为 false
   ```
3. 配置 API Keys：
   ```typescript
   // 在初始化时传入
   const aiService = new AIService({
     openaiApiKey: 'your-openai-api-key',
     replicateApiKey: 'your-replicate-api-key',
   });
   ```

### OpenAI API 配置

**API 端点：** `https://api.openai.com/v1/chat/completions`

**模型：** `gpt-4o` 或 `gpt-4`

**请求格式：**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "你是一位专业的家族关系分析助手..."
    },
    {
      "role": "user",
      "content": "用户输入的文本"
    }
  ],
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

### Replicate API 配置

**模型：** `tencentarc/gfpgan`

**输入参数：**
```json
{
  "image": "base64-encoded-image",
  "version": "v1.4",
  "scale": 2
}
```

---

## 📊 性能基准

| 功能 | 预期响应时间 | 目标 |
|-----|-------------|------|
| 关系推测（Mock） | 1-2 秒 | < 2 秒 |
| 关系推测（真实 API） | 3-5 秒 | < 5 秒 |
| 照片优化（Mock） | 2-3 秒 | < 3 秒 |
| 照片优化（真实 API） | 10-30 秒 | < 30 秒 |

---

## 🐛 常见问题排查

### 问题：关系推测结果不准确

**排查步骤：**
1. 检查输入文本是否清晰明确
2. 尝试使用更简单的描述
3. 查看 AI 备注信息
4. 可以手动编辑结果后再保存

### 问题：照片优化无效果

**排查步骤：**
1. 确认照片包含清晰的人脸
2. 检查原始照片质量
3. 查看详细分析数据
4. 尝试使用更高分辨率的原图

### 问题：Mock 模式无法关闭

**解决：**
1. 检查 `aiService.ts` 中的 `MOCK_MODE` 常量
2. 确认 API Key 已正确配置
3. 检查网络连接

---

## ✅ 验收标准

### 功能完整性

- [ ] 两个 AI 功能均可正常使用
- [ ] 所有 UI 元素正确显示
- [ ] Mock 模式工作正常
- [ ] 数据保存和读取正确

### 用户体验

- [ ] 操作流程简单直观
- [ ] 加载状态清晰可见
- [ ] 错误提示友好明确
- [ ] 交互反馈及时准确

### 代码质量

- [ ] 类型定义完整准确
- [ ] 组件职责单一清晰
- [ ] 状态管理合理有效
- [ ] 错误处理完善全面

---

## 📚 相关文档

- [家族树组件文档](./FAMILY_TREE_COMPONENT_SUMMARY.md)
- [大事记功能文档](./TIMELINE_TEST_GUIDE.md)
- [类型定义](./src/types/familyTree.ts)
- [AI 服务代码](./src/services/aiService.ts)

---

**测试完成日期：** _______________
**测试人员：** _______________
**测试结果：** ✅ 通过 / ❌ 不通过
