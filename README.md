# FamilyTree App

家族族谱应用 - 记录家族历史，传承家族文化

## 技术栈

- **框架**: React Native + Expo SDK 52
- **状态管理**: Zustand
- **后端服务**: Supabase
- **路由**: expo-router
- **图表**: react-native-svg

## 项目结构

```
FamilyTree/
├── app/                    # 页面路由
│   ├── (tabs)/            # 底部标签栏
│   └── family/            # 家族相关页面
├── src/
│   ├── components/        # 组件
│   ├── store/            # Zustand 状态
│   ├── constants/        # 常量配置
│   ├── types/            # TypeScript 类型
│   └── database/         # 数据库相关
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# Web 预览
npx expo start --web
```

## 数据库配置

在 Supabase 创建数据库后，运行 `schema.sql` 初始化表结构。
