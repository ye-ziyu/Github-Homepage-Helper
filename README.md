# GitHub 个人形象增强器

一个帮助 GitHub 用户使用 AI 生成个人简介、头像和 README 的 Web 应用。

## 功能特性

- **个人简介生成**: 使用 AI 根据用户信息生成个性化简介
- **头像生成**: 生成独特的个人头像
- **README 生成**: 自动生成专业的 GitHub 个人主页 README
- **信息同步**: 将生成的内容同步到 GitHub 个人资料

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- Ant Design 5
- Zustand (状态管理)
- React Query (数据获取)
- Tailwind CSS

### 后端
- NestJS 10
- TypeScript
- Prisma (ORM)
- PostgreSQL (数据库)
- Redis (缓存)
- BullMQ (任务队列)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd github-helper
```

### 2. 启动开发环境

```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d

# 等待数据库和 Redis 就绪...
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
```

### 4. 启动后端

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 5. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 6. 访问应用

打开浏览器访问: http://localhost:5173

## 项目结构

```
github-helper/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── stores/       # 状态管理
│   │   ├── api/          # API 客户端
│   │   └── types/        # 类型定义
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # 后端项目
│   ├── src/
│   │   ├── modules/      # 功能模块
│   │   ├── common/       # 公共模块
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml     # Docker Compose 配置
├── .env.example          # 环境变量模板
└── README.md
```

## API 文档

启动后端服务后，访问: http://localhost:3000/api

## 开发指南

### 前端开发

```bash
cd frontend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 代码检查
```

### 后端开发

```bash
cd backend
npm run start:dev   # 启动开发服务器
npm run build        # 构建生产版本
npm run test         # 运行测试
npx prisma studio    # 打开数据库管理界面
```

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 | 是 |
| REDIS_URL | Redis 连接字符串 | 是 |
| JWT_SECRET | JWT 密钥 | 是 |
| ENCRYPTION_KEY | 加密密钥 | 是 |
| OPENAI_API_KEY | OpenAI API 密钥 | 是 |
| GITHUB_CLIENT_ID | GitHub OAuth 客户端 ID | 否 |
| GITHUB_CLIENT_SECRET | GitHub OAuth 客户端密钥 | 否 |

## 许可证

MIT
