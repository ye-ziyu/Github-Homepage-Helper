# GitHub 个人形象增强器

一个帮助 GitHub 用户使用 AI 生成个人简介、头像和 README 的 Web 应用。

## 功能特性

- **个人简介生成**: 使用 AI（OpenAI GPT）根据用户信息生成个性化简介
- **头像生成**: 使用 API易 的图像生成 API（兼容 DALL-E）生成独特的个人头像
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
- Redis (缓存和任务状态)
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

编辑 `backend/.env` 文件，填入必要的配置（详见下方环境变量说明）

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
│   │   │   ├── bio/      # 个人简介生成 (使用 OpenAI GPT)
│   │   │   ├── image/    # 头像生成 (使用 API易)
│   │   │   ├── readme/   # README生成
│   │   │   ├── sync/     # GitHub同步
│   │   │   └── user/     # 用户管理
│   │   ├── common/       # 公共模块
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml     # Docker Compose 配置
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

### 必需配置

编辑 `backend/.env` 文件：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| DATABASE_URL | PostgreSQL 连接字符串 | `postgresql://postgres:postgres@localhost:5432/github_helper` |
| REDIS_URL | Redis 连接字符串 | `redis://localhost:6379` |
| JWT_SECRET | JWT 密钥 | `your_jwt_secret_key_change_this_in_production` |
| ENCRYPTION_KEY | 加密密钥 (32字节) | `abcdefghijklmnopqrstuvwxyz123456` |

### AI服务配置

#### 文本生成 (OpenAI - 用于个人简介)

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| OPENAI_API_KEY | OpenAI API 密钥 | `sk-proj-xxxxx` |
| OPENAI_MODEL | GPT模型名称 | `gpt-4` 或 `gpt-3.5-turbo` |

#### 图片生成 (API易 - 用于头像生成) ⭐ 新增

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| **API_EASY_KEY** | API易 的 API Key | `your_api_easy_key` |
| API_EASY_URL | API易 图像生成接口 | `https://api.apiyi.com/v1/images/generations` |

### GitHub 配置

| 变量名 | 说明 | 必需 |
|--------|------|------|
| GITHUB_CLIENT_ID | GitHub OAuth 客户端 ID | 否 |
| GITHUB_CLIENT_SECRET | GitHub OAuth 客户端密钥 | 否 |

### 其他配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| API_PORT | 后端服务端口 | 3000 |
| API_HOST | 后端服务绑定地址 | 0.0.0.0 |
| NODE_ENV | 运行环境 | development |
| CORS_ORIGIN | CORS 允许来源 | http://localhost:5173 |

## 获取 API Key

### 获取 OpenAI API Key (文本生成必需)

1. 访问 https://platform.openai.com
2. 注册/登录账户
3. 进入 API Keys 页面
4. 创建新的 Secret Key
5. 将 Key 填入 `backend/.env` 的 `OPENAI_API_KEY`

### 获取 API易 Key (图片生成必需) ⭐ 新增

1. 访问 https://api.apiyi.com
2. 注册/登录账户
3. 充值并获取 API Key
4. 将 Key 填入 `backend/.env` 的 `API_EASY_KEY`

> **注意**: API易 兼容 OpenAI 图像生成 API 格式，支持 DALL-E 3 等模型

## 常见问题

### Q: 头像生成失败怎么办？
A: 请检查以下几点：
1. 确保 `API_EASY_KEY` 已正确配置
2. 确保 API易 账户有足够的余额
3. 查看后端日志了解具体错误信息

### Q: 如何更换图像生成模型？
A: 在头像生成页面选择不同的 AI 模型（如 DALL-E 3、DALL-E 2）

### Q: 生成的头像如何使用？
A: 
1. 点击"下载头像"保存图片
2. 前往 GitHub 设置页面
3. 上传下载的头像作为个人头像

## 许可证

MIT
