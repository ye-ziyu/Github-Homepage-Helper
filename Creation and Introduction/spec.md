# GitHub 个人形象增强器 - 技术规格书（优化版）

## 一、系统架构

### 1.1 整体架构

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             边缘层 (Edge Layer)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐      │
│  │   CDN       │  │   API 网关   │  │   负载均衡   │  │   WAF        │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            客户端层 (Frontend)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐      │
│  │  认证模块    │  │  信息采集    │  │  简介生成    │  │  形象生成    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐      │
│  │  README构建 │  │  预览导出    │  │  用户界面    │  │  消息队列    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            服务层 (Backend)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐      │
│  │  API 网关   │  │  业务逻辑层  │  │  数据访问层  │  │  消息处理    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐      │
│  │  缓存服务   │  │  任务队列   │  │  监控告警   │  │  日志聚合    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┬───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│GitHub API│ │OpenAI API│ │图像生成API│ │  主数据库  │ │  从数据库  │ │  消息队列  │ │  监控系统  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### 1.2 部署架构

#### 方案 A：纯前端架构（MVP）
- 前端部署在 Vercel/Netlify
- 静态资源 CDN 加速
- API 调用通过 Cloudflare Workers 代理
- Token 使用 HTTP-only Cookie + Secure 标志
- 启用 Service Worker 缓存策略

#### 方案 B：前后端分离架构（推荐）
- **前端**：Vercel/Netlify + CDN
- **API 网关**：Cloudflare Workers/Nginx
- **应用服务**：Kubernetes Cluster / Railway/Render/Fly.io
- **数据库**：PostgreSQL 主从 + PostgreSQL + TiKV（事务）
- **缓存**：Redis Cluster + Redis Cache
- **消息队列**：RabbitMQ / AWS SQS / Kafka
- **监控**：Prometheus + Grafana + Jaeger
- **日志**：ELK Stack / Loki
- **存储**：S3 Compatible / Cloud Storage

---

## 二、技术选型

### 2.1 前端技术栈

| 类别 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| 框架 | React | 18.x | React Server Components 可用 |
| 构建工具 | Vite | 5.x | 快速构建，HMR |
| TypeScript | TypeScript | 5.x | 类型安全 |
| UI 组件库 | Ant Design | 5.x | 企业级组件 |
| 状态管理 | React Query + Zustand | 4.x+ | Server State + Client State |
| HTTP 客户端 | TanStack Query + Axios | 5.x+ | 自动缓存 + 类型安全 |
| 表单处理 | React Hook Form | 7.x | 高性能表单 |
| CSS 方案 | Tailwind CSS + Headless UI | 3.x+ | 原子化 CSS + 无头组件 |
| 图表 | Recharts + D3 | 2.x+ | 可视化 + 自定义图表 |
| 图标库 | @ant-design/icons | 5.x | UI 图标 |
| 性能监控 | Sentry | 8.x+ | 错误追踪 + 性能监控 |
| 分析 | Plausible/GA4 | - | 用户行为分析 |

### 2.2 后端技术栈

| 类别 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| 运行时 | Node.js | 20.x+ | LTS 版本 |
| 框架 | NestJS | 10.x+ | TypeScript，支持微服务 |
| 语言 | TypeScript | 5.x | 类型安全 |
| ORM | Prisma | 5.x+ | 类型安全的数据库访问 |
| 数据库 | PostgreSQL | 16.x+ | 主从复制 |
| 缓存 | Redis | 7.x+ | Cluster 模式 |
| 消息队列 | BullMQ (Redis) | 4.x+ | 可靠的任务队列 |
| 认证 | @nestjs/jwt + Passport | 10.x+ | JWT 认证策略 |
| 验证 | Zod + class-validator | 3.x+ | 运行时 + 装饰器验证 |
| 日志 | winston + @nestjs/metrics | 3.x+ | 结构化日志 + 指标 |
| API 文档 | @nestjs/swagger | 7.x+ | OpenAPI 3.0 支持 |

### 2.3 基础设施

| 服务 | 技术选型 | 用途 |
|------|---------|------|
| 容器化 | Docker + Kubernetes | 容器编排 |
| 服务网关 | Traefik / NGINX Ingress | API 网关 |
| 服务发现 | Consul / K8s Service | 服务注册发现 |
| 配置中心 | K8s ConfigMap / Consul | 动态配置 |
| 监控 | Prometheus + Grafana + Alertmanager | 指标收集与告警 |
| 链路追踪 | Jaeger / OpenTelemetry | 分布式追踪 |
| 日志收集 | Fluentd + Loki / ELK | 日志聚合 |
| 负载均衡 | K8s Ingress / ELB | 流量分发 |
| 存储 | AWS S3 / MinIO / Ceph | 对象存储 |

### 2.4 第三方服务

| 服务 | 提供商 | 用途 | 成本估算 | 优化方案 |
|------|--------|------|----------|----------|
| GitHub API | GitHub | 用户数据、仓库管理 | 免费（限流） | 请求合并 + 缓存 |
| OpenAI API | OpenAI | 文本生成 | $0.002/1K tokens | 模板缓存 + 批处理 |
| DALL-E API | OpenAI | 图像生成 | $0.04-0.12/张 | Celery 任务队列 |
| 图像 API | Replicate | 图像生成替代 | $0.01-0.03/张 | 异步处理 |
| 统计图表 | github-readme-stats | 可视化 | 免费 | 本地缓存 CDN |

---

## 三、数据模型（优化版）

### 3.1 用户信息 (UserInfo)

```typescript
interface UserInfo {
  id: string;
  githubId: string;
  username: string;
  displayName?: string;
  email?: string;
  emailVerified: boolean;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  twitterUsername?: string;
  avatarUrl?: string;
  avatarVersion: number; // 版本控制，用于缓存失效
  followers: number;
  following: number;
  publicRepos: number;
  stars: number;
  languages: LanguageSkill[];
  createdAt: string;
  updatedAt: string;
  lastSyncAt: string; // 最后同步时间
  preferences: UserPreferences; // 用户偏好设置
}

interface UserPreferences {
  language: 'zh' | 'en' | 'bilingual';
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    syncComplete: boolean;
    generatedContent: boolean;
  };
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    showCompany: boolean;
  };
}
```

### 3.2 分页模型

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

### 3.3 事件模型

```typescript
interface UserEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'sync' | 'generate' | 'export';
  eventData: Record<string, any>;
  timestamp: string;
  traceId: string; // 分布式追踪 ID
  sessionId: string; // 会话 ID
}
```

---

## 四、API 设计（优化版）

### 4.1 RESTful API 设计规范

#### 4.1.1 API 版本控制
```
/api/v1/              # 当前版本
/api/v2/              # 未来版本
```

#### 4.1.2 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    duration: number;
    version: string;
  };
}
```

#### 4.1.3 认证流程
```typescript
// 1. OAuth Flow
POST /api/v1/auth/github/login
POST /api/v1/auth/github/callback

// 2. Token 管理
POST /api/v1/auth/token/refresh
DELETE /api/v1/auth/token/revoke
GET /api/v1/auth/token/info

// 3. 会话管理
POST /api/v1/sessions
DELETE /api/v1/sessions/{sessionId}
```

#### 4.1.4 用户信息（支持分页）
```typescript
// 获取用户信息（缓存优先）
GET /api/v1/user/info

// 获取用户仓库（支持分页）
GET /api/v1/user/repos
  ?page=1
  &pageSize=20
  &sortBy=stars
  &sortOrder=desc
  &language=TypeScript

// 获取用户语言统计
GET /api/v1/user/languages

// 获取用户贡献统计
GET /api/v1/user/contributions
  ?year=2024
  &type=contributions

// 更新用户偏好
PATCH /api/v1/user/preferences
```

#### 4.1.5 简介生成（支持模板）
```typescript
// 生成简介（异步）
POST /api/v1/bio/generate
{
  "config": {
    "language": "zh",
    "style": "professional",
    "length": "medium",
    "template": "developer",
    "customPrompt": ""
  }
}

// 获取生成状态
GET /api/v1/bio/generate/{taskId}/status

// 获取生成结果
GET /api/v1/bio/generate/{taskId}/result

// 获取模板列表
GET /api/v1/bio/templates
```

#### 4.1.6 图像生成（队列处理）
```typescript
// 提交图像生成任务（异步）
POST /api/v1/image/generate
{
  "type": "avatar", // avatar, illustration
  "config": {
    // ... ImageConfig
  },
  "priority": "normal" // low, normal, high
}

// 获取任务队列状态
GET /api/v1/image/queue
  ?status=pending
  &page=1
  &pageSize=10

// 取消任务
DELETE /api/v1/image/queue/{taskId}
```

#### 4.1.7 README 生成（预览 + 导出）
```typescript
// 生成 README 预览
POST /api/v1/readme/preview
{
  "config": {
    "sections": ["header", "about", "skills"],
    "theme": "dark",
    "customCSS": ""
  }
}

// 生成正式 README
POST /api/v1/readme/generate

// 导出多种格式
GET /api/v1/readme/export/{format}
  format: markdown, html, pdf

// 同步到 GitHub
POST /api/v1/readme/sync
{
  "targetRepo": "owner/repo",
  "createPR": true,
  "PRTitle": "Update README",
  "PRBody": "Auto-generated README update"
}
```

### 4.2 WebSocket 实时通信
```typescript
// 连接建立
ws://api.example.com/v1/ws

// 事件类型
{
  type: 'task_progress',
  data: {
    taskId: 'xxx',
    progress: 45,
    message: '正在生成头像...'
  }
}

{
  type: 'task_complete',
  data: {
    taskId: 'xxx',
    result: 'avatar_url'
  }
}

{
  type: 'task_error',
  data: {
    taskId: 'xxx',
    error: 'API limit exceeded'
  }
}
```

---

## 五、数据库设计（优化版）

### 5.1 PostgreSQL 主从架构

```sql
-- 主数据库：写操作
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    location VARCHAR(100),
    blog VARCHAR(255),
    company VARCHAR(100),
    twitter_username VARCHAR(50),
    avatar_url TEXT,
    avatar_version INTEGER DEFAULT 1,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    public_repos INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    languages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- 用户偏好表
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(10) DEFAULT 'light',
    notifications JSONB DEFAULT '{}',
    privacy JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 从数据库：只读查询视图
CREATE VIEW user_readonly AS
SELECT
    id,
    github_id,
    username,
    display_name,
    bio,
    location,
    blog,
    company,
    twitter_username,
    avatar_url,
    avatar_version,
    followers,
    following,
    public_repos,
    stars,
    languages,
    created_at
FROM users;
```

### 5.2 分区表设计（大表优化）

```sql
-- 历史记录表按月分区
CREATE TABLE generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    generation_type VARCHAR(20) NOT NULL,
    input_config JSONB NOT NULL,
    output_result TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    task_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建月分区
CREATE TABLE generation_history_2024_01 PARTITION OF generation_history
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 自动清理触发器
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM generation_history
    WHERE created_at < NOW() - INTERVAL '3 months';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_cleanup_generation_history
    AFTER INSERT ON generation_history
    FOR EACH EXECUTE FUNCTION cleanup_old_history();
```

### 5.3 索引优化

```sql
-- 复合索引优化查询
CREATE INDEX idx_users_github_id_updated ON users(github_id, updated_at);
CREATE INDEX idx_user_config_user_key ON user_configs(user_id, config_key);
CREATE INDEX idx_history_user_type_created ON generation_history(user_id, generation_type, created_at);

-- GIN 索引支持 JSONB 查询
CREATE INDEX idx_languages_gin ON users USING GIN (languages);

-- 全文搜索索引
CREATE INDEX idx_user_bio_gin ON users USING GIN (to_tsvector('english', bio));
```

---

## 六、缓存策略（优化版）

### 6.1 多层缓存架构

```
客户端缓存
├── Service Worker (PWA)
├── LocalStorage (非敏感数据)
└── SessionStorage (会话数据)

CDN 缓存
├── 静态资源 (JS, CSS, 图片)
├── API 响应 (GET 请求)
└── GitHub 图表

应用缓存
├── Redis Cluster (热点数据)
├── 内存缓存 (LRU)
└── 数据库查询缓存
```

### 6.2 缓存策略配置

```typescript
// 缓存键设计
const CACHE_KEYS = {
  // 用户信息 (1小时)
  USER_INFO: (username: string) => `user:${username}:info:v2`,
  USER_PREFS: (userId: string) => `user:${userId}:prefs`,

  // 仓库列表 (30分钟)
  USER_REPOS: (username: string, page: number) => `user:${username}:repos:${page}`,
  USER_REPOS_SUMMARY: (username: string) => `user:${username}:repos:summary`,

  // 统计数据 (5分钟)
  USER_STATS: (username: string) => `user:${username}:stats`,
  USER_LANGUAGES: (username: string) => `user:${username}:languages`,

  // 模板 (24小时)
  BIO_TEMPLATES: () => 'bio:templates:v2',
  README_THEMES: () => 'readme:themes',

  // 生成的结果 (7天)
  GENERATED_BIO: (bioId: string) => `bio:${bioId}`,
  GENERATED_IMAGE: (imageId: string) => `image:${imageId}`,
};

// 缓存 TTL 配置
const CACHE_TTL = {
  // 用户信息
  USER_INFO: 3600,      // 1小时
  USER_PREFS: 86400,    // 24小时

  // 仓库相关
  USER_REPOS: 1800,     // 30分钟
  USER_REPOS_SUMMARY: 3600, // 1小时

  // 统计数据
  USER_STATS: 300,       // 5分钟
  USER_LANGUAGES: 600,  // 10分钟

  // 模板
  TEMPLATES: 86400,     // 24小时

  // 生成结果
  GENERATED_CONTENT: 604800, // 7天

  // 队列状态
  QUEUE_STATUS: 60,     // 1分钟
};

// 缓存穿透保护
const CACHE_MISS_PROTECTION = {
  USER_INFO: `user:${username}:info:null`,
  USER_REPOS: `user:${username}:repos:null:${page}`,
};
```

### 6.3 缓存失效策略

```typescript
// 主动失效策略
async function invalidateUserCache(username: string) {
  const pipeline = redis.pipeline();

  // 删除用户信息缓存
  pipeline.del(CACHE_KEYS.USER_INFO(username));
  pipeline.del(CACHE_KEYS.USER_PREFS(userId));
  pipeline.del(CACHE_KEYS.USER_STATS(username));
  pipeline.del(CACHE_KEYS.USER_LANGUAGES(username));

  // 删除仓库缓存
  const reposKeys = await redis.keys(`user:${username}:repos:*`);
  if (reposKeys.length) {
    pipeline.del(...reposKeys);
  }

  await pipeline.exec();
}

// 被动失效策略 (通过 GitHub Webhook)
app.post('/webhooks/github', async (req, res) => {
  const { event } = req.headers;
  const { repository, sender } = req.body;

  if (event === 'push' || event === 'issues' || event === 'pull_request') {
    await invalidateUserCache(sender.login);
    res.sendStatus(200);
  }
});
```

---

## 七、安全设计（优化版）

### 7.1 认证与授权

```typescript
// JWT Token 结构
interface JwtPayload {
  userId: string;
  githubId: string;
  username: string;
  sessionId: string;
  roles: string[];
  iat: number;
  exp: number;
  jti: string; // JWT ID，用于吊销
}

// Token 配置
const TOKEN_CONFIG = {
  ACCESS_TOKEN: {
    expiresIn: '15m',      // 15分钟短期
    algorithm: 'HS256',
  },
  REFRESH_TOKEN: {
    expiresIn: '7d',      // 7天
    algorithm: 'HS256',
  },
  ID_TOKEN: {
    expiresIn: '1h',      // 1小时
    algorithm: 'RS256',   // 非对称加密
  },
};

// Session 管理
interface Session {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}
```

### 7.2 加密策略

```typescript
// 多层加密策略
const ENCRYPTION_CONFIG = {
  // GitHub Token 加密
  GITHUB_TOKEN: {
    algorithm: 'aes-256-gcm',
    keyRotationDays: 90,
  },

  // 数据库加密
  DATABASE: {
    algorithm: 'aes-256-cbc',
    fieldsToEncrypt: ['email', 'twitter_username'],
  },

  // 备份加密
  BACKUP: {
    algorithm: 'aes-256-gcm',
    compression: true,
  },
};

// 密钥管理
class KeyManager {
  private static instance: KeyManager;
  private masterKey: string;
  private rotationKeys: Map<string, string>;

  constructor() {
    this.masterKey = process.env.MASTER_ENCRYPTION_KEY;
    this.rotationKeys = new Map();
  }

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  async rotateKey(keyType: string): Promise<string> {
    const newKey = crypto.randomBytes(32).toString('hex');
    this.rotationKeys.set(keyType, newKey);
    return newKey;
  }
}
```

### 7.3 API 安全

```typescript
// 速率限制（多维度）
interface RateLimitConfig {
  ip: {
    requests: 1000,    // 每小时
    window: 3600000,
  };
  user: {
    requests: 5000,    // 每小时
    window: 3600000,
    burst: 100,       // 突发请求
  };
  endpoint: {
    '/api/v1/user/repos': 50,    // 每分钟
    '/api/v1/bio/generate': 10,  // 每小时
    '/api/v1/image/generate': 20, // 每小时
  };
}

// CORS 配置
const CORS_CONFIG = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
};

// 安全中间件
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000, // 限制每个IP 1000次请求
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  expressValidator(),
];
```

### 7.4 数据安全

```typescript
// 输入验证
const schemas = {
  // 用户信息更新
  updateUser: z.object({
    displayName: z.string().max(100).optional(),
    bio: z.string().max(160).optional(),
    location: z.string().max(100).optional(),
    blog: z.string().url().max(255).optional(),
    company: z.string().max(100).optional(),
  }),

  // 生成配置
  generateBio: z.object({
    config: z.object({
      language: z.enum(['zh', 'en', 'bilingual']),
      style: z.enum(['professional', 'casual', 'humorous', 'minimal']),
      length: z.enum(['short', 'medium', 'long']),
      template: z.string().max(50).optional(),
      customPrompt: z.string().max(1000).optional(),
    }),
  }),

  // 分页参数
  pagination: z.object({
    page: z.number().int().min(1).max(1000).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().max(100).optional(),
  }),
};

// SQL 注入防护
const sqlSafe = (input: string): string => {
  return input.replace(/['";\\]/g, '');
};

// XSS 防护
const sanitize = (input: string): string => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'\/]/g, (m) => map[m]);
};
```

---

## 八、性能优化（优化版）

### 8.1 前端优化

```typescript
// 代码分割（组件级）
const LazyAuthPage = lazy(() => import('./pages/AuthPage'));
const LazyBioGenerator = lazy(() => import('./components/BioGenerator'));
const LazyImageGenerator = lazy(() => import('./components/ImageGenerator'));

// 路由级代码分割
const routes = [
  {
    path: '/auth',
    component: lazy(() => import('./pages/AuthPage')),
  },
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/DashboardPage')),
    children: [
      {
        path: 'bio',
        component: lazy(() => import('./pages/BioPage')),
      },
      // ...
    ],
  },
];

// 图片优化
import Image from 'next/image';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      effect="blur"
      placeholderSrc="/placeholder.jpg"
      {...props}
    />
  );
};

// 虚拟滚动（大数据列表）
import { FixedSizeList as List } from 'react-window';

const VirtualizedReposList = ({ repos }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <RepoItem repo={repos[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={repos.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
};

// Web Worker 处理重计算
const bioWorker = new Worker('./workers/bio.worker.js');

bioWorker.postMessage({ type: 'calculate', data: userInfo });
bioWorker.onmessage = (e) => {
  if (e.data.type === 'result') {
    setGeneratedBio(e.data.data);
  }
};

// Service Worker 缓存
const CACHE_NAME = 'github-helper-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 8.2 后端优化

```typescript
// 连接池优化
const dbConfig = {
  pool: {
    min: 5,
    max: 20,
    idle: 30000,
    acquire: 60000,
  },
  ssl: process.env.NODE_ENV === 'production',
};

// 数据库查询优化
const userRepository = {
  async findByUsernameWithCache(username: string) {
    const cacheKey = CACHE_KEYS.USER_INFO(username);

    // 尝试缓存
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 数据库查询（使用索引）
    const user = await db.users.findOne({
      where: { username },
      include: [
        {
          model: db.userPreferences,
          as: 'preferences',
        },
      ],
      attributes: {
        exclude: ['github_token'],
      },
    });

    // 写入缓存（空值也缓存）
    if (user) {
      await redis.setex(cacheKey, CACHE_TTL.USER_INFO, JSON.stringify(user));
    } else {
      await redis.setex(cacheKey, 300, 'null'); // 空值短缓存
    }

    return user;
  },
};

// 批处理 + 并发控制
import { pLimit } from 'p-limit';

const limit = pLimit(10); // 最大并发数

async function batchProcessRepos(repos: string[]) {
  const batchSize = 20;
  const results = [];

  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(repo =>
        limit(() => githubApi.getRepo(repo))
      )
    );

    results.push(...batchResults);
  }

  return results;
}

// 数据库读写分离
const readReplica = {
  query: async (sql, params) => {
    return await db.readReplica.query(sql, params);
  },
};

// 连接池预热
async function warmUpConnections() {
  const warmUpQueries = [
    db.users.findOne({ where: { id: 1 } }),
    db.userConfigs.findOne({ where: { user_id: 1 } }),
  ];

  await Promise.all(warmUpQueries);
}
```

### 8.3 CDN 优化

```typescript
// 资源预加载
const preloadResources = [
  { href: '/static/css/main.css', as: 'style' },
  { href: '/static/js/main.js', as: 'script' },
];

// DNS 预解析
<link rel="dns-prefetch" href="https://api.github.com" />
<link rel="dns-prefetch" href="https://api.openai.com" />

// 预连接
<link rel="preconnect" href="https://cdn.jsdelivr.net" />

// 缓存头配置
const cacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'ETag': '"1234567890"',
};

// 图片 CDN 配置
const imageConfig = {
  domains: ['img.cdn.example.com'],
  formats: ['webp', 'avif'],
  quality: 85,
  transformations: {
    avatar: { width: 400, height: 400, crop: 'fill' },
    thumbnail: { width: 200, height: 200, crop: 'fit' },
  },
};
```

---

## 九、监控与日志（优化版）

### 9.1 分布式追踪

```typescript
// Tracer 配置
const tracer = new opentelemetry.TracerProvider({
  resource: new opentelemetry.resources.Resource({
    'service.name': 'github-helper-api',
    'service.version': '1.0.0',
  }),
});

// Jaeger 集成
const jaegerExporter = new opentelemetry.exporters.Jaeger({
  serviceName: 'github-helper-api',
  host: 'jaeger',
  port: 14268,
});

// 自定义 Span
const traceGitHubApiCall = async (operation: string, fn: Function) => {
  const span = tracer.startSpan(`github.${operation}`);

  try {
    const result = await fn();
    span.setAttribute('github.success', true);
    return result;
  } catch (error) {
    span.setAttribute('github.success', false);
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
};
```

### 9.2 指标监控

```typescript
// Prometheus 指标
const register = new prometheus.Registry();

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const apiCallCounter = new prometheus.Counter({
  name: 'api_calls_total',
  help: 'Total number of API calls',
  labelNames: ['service', 'endpoint', 'status'],
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

// 指标收集
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(duration);

    apiCallCounter
      .labels('github', req.path, res.statusCode.toString < 400 ? 'success' : 'error')
      .inc();
  });

  next();
});
```

### 9.3 结构化日志

```typescript
// Winston 高级配置
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json({
      replacer: (key, value) => {
        // 过滤敏感信息
        if (['password', 'token', 'secret'].includes(key)) {
          return '***';
        }
        return value;
      },
    }),
  ),
  defaultMeta: {
    service: 'github-helper-api',
    version: '1.0.0',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// 开发环境
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

// 业务日志
logger.info('User action', {
  userId: 'user123',
  action: 'generate_bio',
  config: { style: 'professional' },
  duration: 1234,
  traceId: traceId,
  sessionId: sessionId,
});
```

### 9.4 告警规则

```yaml
# prometheus.yml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: HighMemoryUsage
    expr: (process_resident_memory_bytes / process_virtual_memory_bytes) > 0.9
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is at {{ $value | humanizePercentage }}"

  - alert: DatabaseConnections
    expr: pg_stat_database_numbackends > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High database connections"
      description: "Database connections are at {{ $value }}"
```

---

## 十、测试策略（优化版）

### 10.1 测试架构

```
单元测试 (Jest)
├── 业务逻辑测试
├── 数据访问测试
├── 服务测试
└── 工具函数测试

集成测试
├── API 集成测试
├── 数据库集成测试
├── 外部 API 集成测试
└── 第三方服务集成测试

端到端测试
├── 用户流程测试
├── 表单测试
├── 性能测试
└── 安全测试

性能测试
├── 负载测试
├── 压力测试
├── 基准测试
└── 稳定性测试
```

### 10.2 单元测试

```typescript
// 业务逻辑测试
describe('BioService', () => {
  let bioService: BioService;
  let mockGitHubApi: jest.Mocked<GitHubApi>;
  let mockOpenAIApi: jest.Mocked<OpenAIApi>;

  beforeEach(() => {
    mockGitHubApi = createMockGitHubApi();
    mockOpenAIApi = createMockOpenAIApi();
    bioService = new BioService(mockGitHubApi, mockOpenAIApi);
  });

  describe('generateBio', () => {
    it('should generate professional bio', async () => {
      // Arrange
      const userInfo = {
        username: 'testuser',
        bio: 'Test developer',
        languages: [{ name: 'TypeScript', level: 'advanced' }],
      };

      const config = {
        style: 'professional',
        length: 'medium',
      };

      mockOpenAIApi.generateBio.mockResolvedValueValue(
        'I am a passionate software developer with expertise in TypeScript...'
      );

      // Act
      const result = await bioService.generateBio(userInfo, config);

      // Assert
      expect(result).toContain('software developer');
      expect(mockOpenAIApi.generateBio).toHaveBeenCalledWith(
        expect.stringContaining('TypeScript')
      );
    });

    it('should handle API errors', async () => {
      // Arrange
      mockOpenAIApi.generateBio.mockRejectedValue(
        new Error('API limit exceeded')
      );

      // Act & Assert
      await expect(
        bioService.generateBio(mockUserInfo, mockConfig)
      ).rejects.toThrow('API limit exceeded');
    });
  });

  describe('getBioTemplates', () => {
    it('should return cached templates', async () => {
      // Arrange
      const templates = [
        { id: '1', name: 'Developer', prompt: '...' },
      ];

      mockGitHubApi.getTemplates.mockResolvedValue(templates);

      // Act
      const result1 = await bioService.getBioTemplates();
      const result2 = await bioService.getBioTemplates();

      // Assert
      expect(result1).toEqual(templates);
      expect(result2).toEqual(templates);
      expect(mockGitHubApi.getTemplates).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 10.3 API 测试

```typescript
// API 测试
describe('BioController', () => {
  let app: INestApplication;
  let mockBioService: jest.Mocked<BioService>;

  beforeAll(async () => {
    const moduleFixture:TestingModule = await Test.createTestingModule({
      controllers: [BioController],
      providers: [
        {
          provide: BioService,
          useFactory: () => mockBioService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      })
    );
    await app.init();
  });

  it('POST /api/v1/bio/generate should return 200', async () => {
    // Arrange
    const generateDto: GenerateBioDto = {
      config: {
        style: 'professional',
        length: 'medium',
      },
    };

    mockBioService.generateBio.mockResolvedValue(
      'Generated bio content...'
    );

    // Act
    const response = await request(app.getHttpServer())
      .post('/api/v1/bio/generate')
      .send(generateDto)
      .expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should validate input', async () => {
    const invalidDto = {
      config: {
        style: 'invalid-style',
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/bio/generate')
      .send(invalidDto)
      .expect(400);
  });
});
```

### 10.4 E2E 测试

```typescript
// Playwright E2E 测试
import { test, expect } from '@playwright/test';

test.describe('Bio Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=GitHub 登录');
  });

  test('complete bio generation flow', async ({ page }) => {
    // 1. 输入 Token
    await page.fill('input[name="token"]', 'ghp_test_token');
    await page.click('button:has-text("确认")');

    // 2. 等待用户信息加载
    await expect(page.locator('text="用户信息"')).toBeVisible();

    // 3. 配置 bio 生成
    await page.selectOption('select[name="style"]', 'professional');
    await page.selectOption('select[name="length"]', 'medium');

    // 4. 生成 bio
    await page.click('button:has-text("生成简介")');

    // 5. 等待生成完成
    await expect(page.locator('text="生成中..."')).toBeVisible();
    await expect(page.locator('text="生成成功"')).toBeVisible();

    // 6. 验证生成的 bio
    const bioContent = await page.locator('.bio-content').textContent();
    expect(bioContent).toContain('开发者');
  });

  test('handle generation error', async ({ page }) => {
    // 模拟 API 错误
    await page.route('**/api/openai/completions', route => {
      route.abort('failed');
    });

    await page.click('button:has-text("生成简介")');

    await expect(page.locator('text="生成失败"')).toBeVisible();
  });
});
```

### 10.5 性能测试

```typescript
// K6 性能测试
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // 预热
    { duration: '1m', target: 100 },   // 负载测试
    { duration: '30s', target: 0 },    // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 请求 < 500ms
    http_req_failed: ['rate<0.01'],    // 错误率 < 1%
  },
};

export default function () {
  const loginRes = http.post('https://api.example.com/v1/auth/login', {
    username: 'testuser',
    password: 'testpass',
  });

  check(loginRes, {
    'login status was 200': (r) => r.status == 200,
  });

  const authToken = loginRes.json().data.token;

  const bioRes = http.post('https://api.example.com/v1/bio/generate', {
    config: {
      style: 'professional',
      length: 'medium',
    },
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  check(bioRes, {
    'bio generation status was 200': (r) => r.status == 200,
    'bio generation time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}
```

---

## 十一、部署配置（优化版）

### 11.1 Docker 多阶段构建

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# 创建 non-root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# 启动应用
USER nextjs
CMD ["node", "dist/index.js"]
```

### 11.2 Kubernetes 部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-helper-api
  namespace: production
  labels:
    app: github-helper
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: github-helper
  template:
    metadata:
      labels:
        app: github-helper
        version: v1.0.0
    spec:
      serviceAccountName: github-helper-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: api
        image: github-helper/api:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
```

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: github-helper-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: github-helper-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

### 11.3 Helm Chart

```yaml
# Chart.yaml
apiVersion: v2
name: github-helper
description: A Helm chart for GitHub Helper API
type: application
version: 1.0.0
appVersion: 1.0.0
```

```yaml
# values.yaml
replicaCount: 3

image:
  repository: github-helper/api
  pullPolicy: IfNotPresent
  tag: "v1.0.0"

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: api.github-helper.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# Database
postgresql:
  enabled: true
  global:
    postgresql:
      postgresqlDatabase: github_helper
      postgresqlUsername: postgres
      postgresqlPassword: password
  primary:
    persistence:
      enabled: true
      size: 10Gi

# Redis
redis:
  enabled: true
  master:
    persistence:
      enabled: true
      size: 5Gi
```

### 11.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 0

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/github-helper-api:latest
          ${{ secrets.DOCKER_USERNAME }}/github-helper-api:${{ github.ref_name }}

    - name: Deploy to Kubernetes
      uses: steebchen/kubectl@v1.0.0
      with:
        config: ${{ secrets.KUBE_CONFIG }}
        command: set image deployment/github-helper-api api=${{ secrets.DOCKER_USERNAME }}/github-helper-api:${{ github.ref_name }}
        namespace: production

    - name: Rollout status
      uses: steebchen/kubectl@v1.0.0
      with:
        config: ${{ secrets.KUBE_CONFIG }}
        command: rollout status deployment/github-helper-api
        namespace: production
```

---

## 十二、运维与扩展

### 12.1 备份策略

```yaml
# backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: production
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: pg_dump
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres-primary -U postgres github_helper > /backup/db-$$(date +%Y%m%d).sql
              gzip /backup/db-$$(date +%Y%m%d).sql
              aws s3 cp /backup/db-$$(date +%Y%m%d).sql.gz s3://github-helper-backups/db-$$(date +%Y%m%d).sql.gz
            env:
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: secret-access-key
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
```

### 12.2 灾难恢复

```yaml
# disaster-recovery.yaml
apiVersion: v1
kind: Pod
metadata:
  name: disaster-recovery
  namespace: production
spec:
  containers:
  - name: recovery
    image: postgres:15-alpine
    command:
    - /bin/sh
    - -c
    - |
      # 从 S3 恢复数据库
      aws s3 cp s3://github-helper-backups/db-20240101.sql.gz /tmp/backup.sql.gz
      gunzip /tmp/backup.sql.gz
      psql -h postgres-standby -U postgres -d github_helper < /tmp/backup.sql
    env:
    - name: AWS_ACCESS_KEY_ID
      valueFrom:
        secretKeyRef:
          name: aws-credentials
          key: access-key-id
    - name: AWS_SECRET_ACCESS_KEY
      valueFrom:
        secretKeyRef:
          name: aws-credentials
          key: secret-access-key
```

---

*文档版本：2.0*
*最后更新：2026-01-29*
*优化日期：2026-01-29*