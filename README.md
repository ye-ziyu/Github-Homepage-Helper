<div align="center">

# GitHub Profile Enhancer

**AI 驱动的 GitHub 个人形象增强器**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

[功能特性](#-核心特性) · [工作原理](#工作原理) · [快速开始](#快速开始) · [项目结构](#项目结构)

</div>

---

## 👋 项目简介

**GitHub Profile Enhancer** 是一款 **AI 驱动的 GitHub 个人主页美化工具**，通过智能分析您的 GitHub 数据，一键生成个性化的个人简介、炫酷头像和精美的 README，让您的 GitHub 主页焕然一新！

### 🎯 解决三大核心痛点

| 痛点 | 问题描述 | 解决方案 |
|-----|---------|----------|
| 😓 **个人主页"千篇一律"** | GitHub 主页平淡无奇，无法展现个性 | AI 分析您的 GitHub 数据，生成独特的个人简介 |
| 🎨 **头像缺乏个性** | 默认头像缺乏个性，无法给访客留下印象 | 使用 AI 生成符合您风格的个性化头像 |
| 📝 **README 编写困难** | 不知道如何写好个人主页 README | 一键生成包含动态横幅、技能徽章、统计图表等 |

### ✨ 核心特性

| 特性 | 描述 |
|-----|------|
| 🚀 **一键生成** | 基于您的 GitHub 数据，一键生成个性化的个人简介 |
| 🎨 **AI 头像生成** | 支持多种风格的 AI 头像生成（Sora Image） |
| 📝 **README 生成器** | 自动生成炫酷的个人主页 README |
| 🔄 **实时同步** | 一键同步 README 到 GitHub 仓库 |
| 📊 **GitHub 统计** | 展示您的 GitHub 统计数据和图表 |
| 🎯 **技能徽章** | 自动识别并展示技术栈徽章 |
| 🌙 **多主题支持** | 支持多种 README 主题风格 |
| 💾 **配置保存** | 保存您的配置，方便下次使用 |

---

## 🔧 工作原理

GitHub Profile Enhancer 通过分析用户的 GitHub 数据，结合 AI 技术生成个性化内容。

### 核心流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub OAuth   │────>│  数据获取        │────> │  AI 分析        │
│  登录授权        │     │  (仓库/提交/star) │     │  生成个人简介    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub 同步    │<────│  README 渲染     │<────│  内容定制        │
│  一键发布        │     │  模板渲染        │      │  用户调整        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 技术实现

1. **GitHub 数据采集**：
   - 通过 GitHub API 获取用户信息、仓库、提交记录等
   - 分析用户的编程语言偏好、技术栈
   - 统计用户的活跃度和贡献度

2. **AI 内容生成**：
   - 基于 OpenAI API 生成个性化的个人简介
   - 支持多种风格模板
   - 智能匹配用户技术栈

3. **AI 头像生成**：
   - 集成 API易 Sora Image API
   - 支持多种风格（动漫、写实、像素等）
   - 高分辨率图片输出

4. **README 渲染**：
   - 基于 Markdown 模板引擎
   - 动态横幅、技能徽章、统计图表
   - 支持多种主题风格

---

## 🏗️ 技术架构

项目采用前后端分离架构，由 React 前端和 NestJS 后端组成。

```
┌──────────────────────────────────────────────────────────────┐
│                         用户层                                │
│              浏览器 ←→ React 前端 (Vite)                      │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                       服务层                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 认证服务     │  │ GitHub 服务  │  │ AI 生成服务        │  │
│  │ (OAuth)      │  │ (数据采集)   │  │ (OpenAI/API易)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ README 生成  │  │ 图片生成     │  │ 同步服务            │  │
│  │ (模板引擎)   │  │ (队列处理)   │  │ (GitHub 发布)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                       数据层                                  │
│      PostgreSQL 16       │       Redis 7       │              │
└──────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| **前端** | React 18 + TypeScript + Vite + Ant Design | 现代化前端技术栈，提供良好的用户体验 |
| **后端** | NestJS 10 + TypeScript + TypeORM | 企业级 Node.js 后端框架 |
| **认证** | GitHub OAuth + JWT | GitHub 授权登录，安全可靠 |
| **数据库** | PostgreSQL 16 | 关系型数据库存储用户配置 |
| **缓存** | Redis 7 | 会话存储和限流控制 |
| **AI 服务** | OpenAI + API易 | 内容生成和图片生成 |
| **部署** | Docker + Docker Compose | 容器化部署，简化环境配置 |

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 | 用途 |
|-----|---------|------|
| Node.js | 18+ | 前端和后端运行环境 |
| Docker & Docker Compose | 最新版 | 容器化部署（推荐） |
| PostgreSQL | 16+ | 关系型数据库 |
| Redis | 7.0+ | 缓存和会话存储 |

### 方式一：Docker 一键部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/github-profile-enhancer.git
cd github-profile-enhancer

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 填写您的配置

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:5173
# 后端 API: http://localhost:3000
```

### 方式二：本地开发

#### 后端启动

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填写配置

# 4. 启动开发服务器
npm run start:dev
```

#### 前端启动

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 环境变量配置

在 `backend/.env` 中配置以下参数：

```env
# 应用配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=github_helper

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# API易 (图片生成)
APIYI_BASE_URL=https://api.apiyi.com
APIYI_API_KEY=your_apiyi_api_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# 前端地址
FRONTEND_URL=http://localhost:5173
```

---

## 📁 项目结构

```
github-profile-enhancer/
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── modules/              # 业务模块
│   │   │   ├── auth/             # 认证模块 (GitHub OAuth)
│   │   │   ├── github/           # GitHub 数据服务
│   │   │   ├── profile/          # 个人简介生成
│   │   │   ├── image/            # AI 头像生成
│   │   │   ├── readme/           # README 生成
│   │   │   └── sync/             # GitHub 同步
│   │   ├── common/               # 公共模块
│   │   ├── config/               # 配置文件
│   │   └── main.ts               # 入口文件
│   ├── package.json
│   └── .env.example
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── components/           # React 组件
│   │   ├── pages/                # 页面组件
│   │   ├── api/                  # API 封装
│   │   ├── stores/               # 状态管理 (Zustand)
│   │   └── main.tsx              # 入口文件
│   └── package.json
│
├── docker-compose.yml            # Docker 编排文件
└── README.md                     # 项目文档
```

---

## 💡 使用指南

### 1. 登录授权

- 点击"登录"按钮
- 授权 GitHub 访问权限
- 完成登录，系统会自动获取您的 GitHub 数据

### 2. 生成个人简介

- 进入"个人简介"页面
- 选择风格和语言
- 点击生成，AI 会基于您的 GitHub 数据生成简介
- 可编辑生成的内容

### 3. 生成 AI 头像

- 进入"头像生成"页面
- 选择模型和风格
- 输入提示词（可选）
- 点击生成，等待 AI 生成图片
- 下载喜欢的头像

### 4. 生成 README

- 进入"README 生成"页面
- 选择主题风格
- 配置要显示的模块（技能、统计、动态横幅等）
- 预览生成的 README
- 点击"同步到 GitHub"一键发布到您的仓库

---

## 🤝 参与贡献

欢迎贡献代码、提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

用 ❤️ 打造 | 由 AI 辅助开发

</div>
