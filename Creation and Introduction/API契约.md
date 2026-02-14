# GitHub 个人形象增强器 - API 契约

## 目录

1. [概述](#一概述)
2. [GitHub REST API](#二github-rest-api)
3. [后端应用 API](#三后端应用-api)
4. [OpenAI API](#四openai-api)
5. [错误响应格式](#五错误响应格式)
6. [API 版本控制](#六api-版本控制)

---

## 一、概述

### 1.1 基础信息

| 属性 | 值 |
|------|-----|
| API 版本 | v1 |
| 协议 | HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

### 1.2 响应格式标准

所有 API 响应遵循统一格式：

```typescript
interface ApiResponse<T> {
  success: boolean;              // 请求是否成功
  data?: T;                      // 响应数据（成功时）
  error?: ApiError;              // 错误信息（失败时）
  meta?: {                       // 元数据
    timestamp: string;           // ISO 8601 时间戳
    requestId: string;           // 请求 ID
  };
}
```

### 1.3 请求头标准

```http
Content-Type: application/json
Accept: application/json
User-Agent: GitHub-Profile-Enhancer/1.0
Authorization: Bearer {token}  // 需要认证的接口
```

---

## 二、GitHub REST API

### 2.1 用户相关接口

#### 2.1.1 获取当前用户信息

```http
GET /user
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
```

**响应示例 (200 OK)**
```json
{
  "login": "octocat",
  "id": 583231,
  "node_id": "MDQ6VXNlcjU4MzIzMQ==",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "gravatar_id": "",
  "url": "https://api.github.com/users/octocat",
  "html_url": "https://github.com/octocat",
  "type": "User",
  "site_admin": false,
  "name": "monalisa octocat",
  "company": "GitHub",
  "blog": "https://github.com/blog",
  "location": "San Francisco",
  "email": "octocat@github.com",
  "hireable": false,
  "bio": "There once was...",
  "twitter_username": "monatheoctocat",
  "public_repos": 2,
  "public_gists": 1,
  "followers": 20,
  "following": 0,
  "created_at": "2008-01-14T04:33:35Z",
  "updated_at": "2008-01-14T04:33:35Z"
}
```

#### 2.1.2 获取用户邮箱列表

```http
GET /user/emails
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
```

**响应示例 (200 OK)**
```json
[
  {
    "email": "octocat@github.com",
    "verified": true,
    "primary": true,
    "visibility": "public"
  }
]
```

#### 2.1.3 获取指定用户信息

```http
GET /users/{username}
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | 是 | GitHub 用户名 |

**响应示例 (200 OK)**
```json
{
  "login": "octocat",
  "id": 583231,
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "name": "monalisa octocat",
  "company": "GitHub",
  "blog": "https://github.com/blog",
  "location": "San Francisco",
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 2,
  "public_gists": 1,
  "followers": 20,
  "following": 0,
  "created_at": "2008-01-14T04:33:35Z",
  "updated_at": "2008-01-14T04:33:35Z"
}
```

#### 2.1.4 更新用户资料

```http
PATCH /user
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
Content-Type: application/json
```

**请求体**
```json
{
  "name": "monalisa octocat",
  "email": "octocat@github.com",
  "blog": "https://github.com/blog",
  "twitter_username": "monatheoctocat",
  "company": "GitHub",
  "location": "San Francisco",
  "hireable": true,
  "bio": "There once was..."
}
```

**响应示例 (200 OK)**
```json
{
  "login": "octocat",
  "id": 583231,
  "name": "monalisa octocat",
  "email": "octocat@github.com",
  "bio": "There once was...",
  "location": "San Francisco",
  "created_at": "2008-01-14T04:33:35Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 2.2 仓库相关接口

#### 2.2.1 获取用户仓库列表

```http
GET /user/repos
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | all | all, owner, member |
| sort | string | updated | created, updated, pushed, full_name |
| direction | string | desc | asc, desc |
| per_page | integer | 30 | 每页数量 (1-100) |
| page | integer | 1 | 页码 |

**响应示例 (200 OK)**
```json
[
  {
    "id": 1296269,
    "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
    "name": "Hello-World",
    "full_name": "octocat/Hello-World",
    "owner": {
      "login": "octocat",
      "id": 583231,
      "avatar_url": "https://github.com/images/error/octocat_happy.gif"
    },
    "private": false,
    "html_url": "https://github.com/octocat/Hello-World",
    "description": "This your first repo!",
    "fork": false,
    "url": "https://api.github.com/repos/octocat/Hello-World",
    "created_at": "2011-01-26T19:01:12Z",
    "updated_at": "2011-01-26T19:14:43Z",
    "pushed_at": "2011-01-26T19:06:43Z",
    "homepage": "https://github.com",
    "size": 108,
    "stargazers_count": 80,
    "watchers_count": 80,
    "language": "Ruby",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 9,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 9,
    "open_issues": 0,
    "watchers": 80,
    "default_branch": "master",
    "topics": [
      "octocat",
      "atom",
      "electron",
      "api"
    ],
    "homepage": "https://github.com"
  }
]
```

#### 2.2.2 获取用户 Star 的仓库

```http
GET /user/starred
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sort | string | created | created, updated |
| direction | string | desc | asc, desc |
| per_page | integer | 30 | 每页数量 |
| page | integer | 1 | 页码 |

**响应示例 (200 OK)**
```json
[
  {
    "id": 1296269,
    "name": "Hello-World",
    "full_name": "octocat/Hello-World",
    "stargazers_count": 80
  }
]
```

---

### 2.3 内容相关接口

#### 2.3.1 获取仓库 README 文件

```http
GET /repos/{owner}/{repo}/readme
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| owner | string | 是 | 仓库所有者 |
| repo | string | 是 | 仓库名称 |

**响应示例 (200 OK)**
```json
{
  "type": "file",
  "encoding": "base64",
  "size": 5362,
  "name": "README.md",
  "path": "README.md",
  "content": "SGVsbG8gV29ybGQh",
  "sha": "3d21ec53a331a6f037a91c368710b99387d012c1",
  "url": "https://api.github.com/repos/octocat/Hello-World/contents/README.md",
  "html_url": "https://github.com/octocat/Hello-World/blob/master/README.md",
  "git_url": "https://api.github.com/repos/octocat/Hello-World/git/blobs/3d21ec53a331a6f037a91c368710b99387d012c1",
  "download_url": "https://raw.githubusercontent.com/octocat/Hello-World/master/README.md"
}
```

#### 2.3.2 更新仓库 README 文件

```http
PUT /repos/{owner}/{repo}/contents/{path}
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
Content-Type: application/json
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| owner | string | 是 | 仓库所有者 |
| repo | string | 是 | 仓库名称 |
| path | string | 是 | 文件路径，通常为 README.md |

**请求体**
```json
{
  "message": "update README",
  "content": "SGVsbG8gV29ybGQh",
  "sha": "3d21ec53a331a6f037a91c368710b99387d012c1"
}
```

**字段说明**
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| message | string | 是 | 提交信息 |
| content | string | 是 | Base64 编码的文件内容 |
| sha | string | 条件必需 | 当前文件的 SHA，用于更新文件 |

**响应示例 (200 OK)**
```json
{
  "content": {
    "name": "README.md",
    "path": "README.md",
    "sha": "95b966ae1c166bd92f8ae7d22c494e9d2cff21cf",
    "size": 5362,
    "url": "https://api.github.com/repos/octocat/Hello-World/contents/README.md",
    "html_url": "https://github.com/octocat/Hello-World/blob/master/README.md",
    "git_url": "https://api.github.com/repos/octocat/Hello-World/git/blobs/95b966ae1c166bd92f8ae7d22c494e9d2cff21cf",
    "download_url": "https://raw.githubusercontent.com/octocat/Hello-World/master/README.md",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/octocat/Hello-World/contents/README.md",
      "git": "https://api.github.com/repos/octocat/Hello-World/git/blobs/95b966ae1c166bd92f8ae7d22c494e9d2cff21cf",
      "html": "https://github.com/octocat/Hello-World/blob/master/README.md"
    }
  },
  "commit": {
    "sha": "7638417db6d59f3c431d3e1f261cc637155684cd",
    "node_id": "MDY6Q29tbWl0NzYzODQxN2RiNmQ1OWYzYzQzMWQzZTFmMjYxY2M2MzcxNTU2ODRjZA==",
    "url": "https://api.github.com/repos/octocat/Hello-World/git/commits/7638417db6d59f3c431d3e1f261cc637155684cd",
    "html_url": "https://github.com/octocat/Hello-World/commit/7638417db6d59f3c431d3e1f261cc637155684cd",
    "author": {
      "date": "2014-11-07T22:01:45Z",
      "name": "Monalisa Octocat",
      "email": "octocat@github.com"
    },
    "committer": {
      "date": "2014-11-07T22:01:45Z",
      "name": "Monalisa Octocat",
      "email": "octocat@github.com"
    },
    "message": "update README"
  }
}
```

---

### 2.4 Pull Request 相关接口

#### 2.4.1 创建 Pull Request

```http
POST /repos/{owner}/{repo}/pulls
```

**请求头**
```http
Authorization: token {ghp_xxxxx}
Content-Type: application/json
```

**请求体**
```json
{
  "title": "Amazing new feature",
  "body": "Please pull these awesome changes in!",
  "head": "octocat:new-feature",
  "base": "master"
}
```

**字段说明**
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | PR 标题 |
| body | string | 否 | PR 描述 |
| head | string | 是 | 源分支 |
| base | string | 是 | 目标分支 |

**响应示例 (201 Created)**
```json
{
  "id": 1,
  "node_id": "MDExOlB1bGxSZXF1ZXN0MQ==",
  "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1",
  "html_url": "https://github.com/octocat/Hello-World/pull/1",
  "diff_url": "https://github.com/octocat/Hello-World/pull/1.diff",
  "patch_url": "https://github.com/octocat/Hello-World/pull/1.patch",
  "issue_url": "https://api.github.com/repos/octocat/Hello-World/issues/1",
  "number": 1,
  "state": "open",
  "locked": false,
  "title": "Amazing new feature",
  "user": {
    "login": "octocat",
    "id": 583231,
    "avatar_url": "https://github.com/images/error/octocat_happy.gif"
  },
  "body": "Please pull these awesome changes in!",
  "created_at": "2011-01-26T19:01:12Z",
  "updated_at": "2011-01-26T19:14:43Z",
  "merged_at": null,
  "head": {
    "label": "octocat:new-feature",
    "ref": "new-feature",
    "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e"
  },
  "base": {
    "label": "octocat:master",
    "ref": "master",
    "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e"
  }
}
```

---

## 三、后端应用 API

### 3.1 认证相关

#### 3.1.1 验证 GitHub Token

```http
POST /api/v1/auth/validate
```

**请求体**
```json
{
  "token": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "userInfo": {
      "username": "octocat",
      "displayName": "Monalisa Octocat",
      "email": "octocat@github.com",
      "avatarUrl": "https://github.com/images/error/octocat_happy.gif"
    },
    "scopes": [
      "read:user",
      "user:email",
      "repo"
    ]
  },
  "meta": {
    "timestamp": "2024-01-29T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

**响应示例 (401 Unauthorized)**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "提供的 GitHub Token 无效或已过期",
    "details": {
      "githubErrorCode": 401
    }
  }
}
```

---

### 3.2 用户信息相关

#### 3.2.1 获取完整用户信息

```http
GET /api/v1/user/info
```

**请求头**
```http
Authorization: Bearer {jwt_token}
```

**查询参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| refresh | boolean | 否 | 是否刷新缓存 |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "githubId": "583231",
    "username": "octocat",
    "displayName": "Monalisa Octocat",
    "email": "octocat@github.com",
    "bio": "There once was...",
    "location": "San Francisco",
    "blog": "https://github.com/blog",
    "company": "GitHub",
    "twitterUsername": "monatheoctocat",
    "avatarUrl": "https://github.com/images/error/octocat_happy.gif",
    "followers": 20,
    "following": 0,
    "publicRepos": 2,
    "stars": 80,
    "languages": [
      "JavaScript",
      "TypeScript",
      "Python",
      "Ruby"
    ],
    "createdAt": "2008-01-14T04:33:35Z",
    "updatedAt": "2024-01-29T10:30:00Z"
  }
}
```

#### 3.2.2 获取用户仓库列表

```http
GET /api/v1/user/repos
```

**请求头**
```http
Authorization: Bearer {jwt_token}
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sort | string | updated | updated, stars, forks |
| limit | integer | 10 | 返回数量 (1-50) |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "repos": [
      {
        "id": "1296269",
        "name": "Hello-World",
        "description": "This your first repo!",
        "language": "Ruby",
        "stars": 80,
        "forks": 9,
        "isFork": false,
        "topics": ["octocat", "atom", "electron"],
        "homepage": "https://github.com",
        "updatedAt": "2011-01-26T19:14:43Z"
      }
    ],
    "total": 2,
    "hasMore": false
  }
}
```

#### 3.2.3 获取用户语言统计

```http
GET /api/v1/user/languages
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "name": "JavaScript",
        "bytes": 1234567,
        "percentage": 45.5,
        "repos": 5
      },
      {
        "name": "TypeScript",
        "bytes": 987654,
        "percentage": 32.2,
        "repos": 3
      },
      {
        "name": "Python",
        "bytes": 543210,
        "percentage": 18.5,
        "repos": 2
      },
      {
        "name": "Ruby",
        "bytes": 123456,
        "percentage": 3.8,
        "repos": 1
      }
    ]
  }
}
```

#### 3.2.4 获取用户统计数据

```http
GET /api/v1/user/stats
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "followers": 20,
    "following": 0,
    "publicRepos": 2,
    "totalCommits": 1234,
    "totalPullRequests": 56,
    "totalIssues": 23,
    "totalStarsReceived": 80,
    "totalStarsGiven": 150,
    "contributionGraph": {
      "total": 1234,
      "lastYear": 567,
      "longestStreak": 42,
      "currentStreak": 7
    }
  }
}
```

---

### 3.3 简介生成相关

#### 3.3.1 生成个人简介

```http
POST /api/v1/bio/generate
```

**请求头**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**请求体**
```json
{
  "userInfo": {
    "username": "octocat",
    "displayName": "Monalisa Octocat",
    "email": "octocat@github.com",
    "bio": "There once was...",
    "location": "San Francisco",
    "company": "GitHub"
  },
  "skills": {
    "languages": [
      {
        "name": "JavaScript",
        "level": "expert"
      },
      {
        "name": "Python",
        "level": "advanced"
      }
    ],
    "frameworks": [
      {
        "name": "React",
        "language": "JavaScript",
        "level": "advanced"
      }
    ],
    "tools": [
      {
        "name": "Git",
        "category": "version-control"
      }
    ]
  },
  "projects": [
    {
      "name": "Hello-World",
      "description": "This your first repo!",
      "stars": 80
    }
  ],
  "config": {
    "language": "en",
    "style": "professional",
    "length": "medium",
    "includeStats": true,
    "includeSkills": true,
    "includeProjects": true
  }
}
```

**字段说明**
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| userInfo | object | 是 | 用户基本信息 |
| skills | object | 否 | 技能信息 |
| projects | array | 否 | 项目列表 |
| config | object | 是 | 生成配置 |

**config 字段说明**
| 字段 | 类型 | 可选值 | 说明 |
|------|------|--------|------|
| language | string | zh, en, bilingual | 语言偏好 |
| style | string | professional, casual, humorous, minimal | 风格偏好 |
| length | string | short, medium, long | 长度偏好 |
| includeStats | boolean | true, false | 是否包含统计 |
| includeSkills | boolean | true, false | 是否包含技能 |
| includeProjects | boolean | true, false | 是否包含项目 |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "bio": "# Monalisa Octocat\n\nI'm a passionate software engineer at GitHub, specializing in full-stack development with a focus on JavaScript and TypeScript. I love building tools that make developers' lives easier.\n\n- 💼 Working at GitHub\n- 📍 Based in San Francisco\n- 🚀 20 followers | 2 public repos\n\n## Stats\n\n![GitHub Stats](https://github-readme-stats.vercel.app/api?username=octocat&show_icons=true)\n\n## Skills\n\n- JavaScript (Expert)\n- Python (Advanced)\n- React (Advanced)\n- Git\n\n## Projects\n\n- **Hello-World** - This your first repo! ⭐ 80",
    "wordCount": 85,
    "characterCount": 520
  },
  "meta": {
    "timestamp": "2024-01-29T10:30:00Z",
    "requestId": "req_bio_123456789"
  }
}
```

#### 3.3.2 重新生成简介

```http
POST /api/v1/bio/regenerate
```

**请求体**（同生成简介）

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "bio": "# Monalisa Octocat\n\nAnother version of bio...",
    "wordCount": 78,
    "characterCount": 480
  }
}
```

#### 3.3.3 获取简介模板列表

```http
GET /api/v1/bio/templates
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| style | string | - | 筛选风格 |
| language | string | - | 筛选语言 |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_professional_en_short",
        "name": "Professional Short",
        "style": "professional",
        "language": "en",
        "length": "short",
        "preview": "A concise professional bio highlighting key skills and experience..."
      },
      {
        "id": "tpl_casual_zh_medium",
        "name": "Casual Medium (中文)",
        "style": "casual",
        "language": "zh",
        "length": "medium",
        "preview": "一个轻松的个人简介模板..."
      }
    ]
  }
}
```

---

### 3.4 图像生成相关

#### 3.4.1 生成头像

```http
POST /api/v1/image/generate-avatar
```

**请求头**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**请求体**
```json
{
  "config": {
    "style": "realistic",
    "gender": "neutral",
    "ageGroup": "adult",
    "accessories": ["glasses"],
    "clothing": "tshirt",
    "expression": "smile",
    "backgroundColor": "#4A90E2",
    "size": "400x400"
  },
  "userInfo": {
    "username": "octocat",
    "displayName": "Monalisa Octocat",
    "company": "GitHub"
  }
}
```

**config 字段说明**
| 字段 | 类型 | 可选值 | 说明 |
|------|------|--------|------|
| style | string | realistic, cartoon, pixel, illustration, minimal | 头像风格 |
| gender | string | male, female, neutral, undefined | 性别 |
| ageGroup | string | young, adult, mature | 年龄感 |
| accessories | array | glasses, headphones, hat, none | 配饰 |
| clothing | string | tshirt, shirt, hoodie, formal | 服装 |
| expression | string | smile, friendly, serious, thinking | 表情 |
| backgroundColor | string | Hex 颜色代码 | 背景色 |
| size | string | - | 尺寸 |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/images/generated/abc123.png",
    "thumbnailUrl": "https://cdn.example.com/images/generated/abc123_thumb.png",
    "imageId": "img_abc123",
    "width": 400,
    "height": 400,
    "format": "png",
    "sizeBytes": 51200
  },
  "meta": {
    "timestamp": "2024-01-29T10:30:00Z",
    "requestId": "req_img_123456789"
  }
}
```

**响应示例 (202 Accepted)**
```json
{
  "success": true,
  "data": {
    "jobId": "job_xyz789",
    "status": "processing",
    "estimatedTime": 10
  },
  "meta": {
    "message": "Image generation is in progress"
  }
}
```

#### 3.4.2 生成插图

```http
POST /api/v1/image/generate-illustration
```

**请求体**
```json
{
  "config": {
    "scene": "coding",
    "elements": ["computer", "keyboard", "coffee"],
    "style": "flat",
    "size": "800x600"
  }
}
```

**config 字段说明**
| 字段 | 类型 | 可选值 | 说明 |
|------|------|--------|------|
| scene | string | coding, thinking, collaborating, learning | 场景 |
| elements | array | computer, keyboard, coffee, books, code_screen | 元素 |
| style | string | flat, gradient, outline, 3d | 风格 |
| size | string | - | 尺寸 |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/images/illust_def456.png",
    "imageId": "illust_def456",
    "width": 800,
    "height": 600,
    "format": "png"
  }
}
```

#### 3.4.3 获取可用风格列表

```http
GET /api/v1/image/styles
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | - | avatar 或 illustration |

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "avatarStyles": [
      {
        "id": "realistic",
        "name": "写实风格",
        "description": "逼真的人像风格，适合专业形象",
        "preview": "https://cdn.example.com/previews/realistic.jpg"
      },
      {
        "id": "cartoon",
        "name": "卡通风格",
        "description": "可爱卡通形象，适合个性展示",
        "preview": "https://cdn.example.com/previews/cartoon.jpg"
      }
    ],
    "illustrationStyles": [
      {
        "id": "flat",
        "name": "扁平化",
        "description": "简洁扁平设计，适合现代 UI"
      },
      {
        "id": "gradient",
        "name": "渐变",
        "description": "渐变色填充，富有层次感"
      }
    ]
  }
}
```

---

### 3.5 README 生成相关

#### 3.5.1 生成 README

```http
POST /api/v1/readme/generate
```

**请求头**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**请求体**
```json
{
  "userInfo": {
    "username": "octocat",
    "displayName": "Monalisa Octocat"
  },
  "bio": "# Monalisa Octocat\n\nI'm a passionate software engineer...",
  "avatarUrl": "https://cdn.example.com/images/generated/abc123.png",
  "skills": ["JavaScript", "TypeScript", "React", "Python"],
  "projects": [
    {
      "name": "Hello-World",
      "description": "This your first repo!",
      "url": "https://github.com/octocat/Hello-World",
      "stars": 80
    }
  ],
  "config": {
    "sections": [
      {
        "type": "header",
        "visible": true,
        "order": 1
      },
      {
        "type": "about",
        "visible": true,
        "order": 2
      },
      {
        "type": "skills",
        "visible": true,
        "order": 3
      },
      {
        "type": "projects",
        "visible": true,
        "order": 4
      },
      {
        "type": "contact",
        "visible": true,
        "order": 5
      },
      {
        "type": "footer",
        "visible": true,
        "order": 6
      }
    ],
    "theme": "light",
    "showStats": true,
    "showVisitors": true
  }
}
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "readme": "# Monalisa Octocat\n\n<img src=\"https://cdn.example.com/images/generated/abc123.png\" width=\"200\" />\n\n## About Me\n\nI'm a passionate software engineer at GitHub, specializing in full-stack development with a focus on JavaScript and TypeScript. I love building tools that make developers' lives easier.\n\n## Skills\n\nJavaScript | TypeScript | React | Python\n\n## Projects\n\n- **[Hello-World](https://github.com/octocat/Hello-World)** - This your first repo! ⭐ 80\n\n## Contact\n\n- 📧 Email: octocat@github.com\n- 💼 LinkedIn: https://linkedin.com/in/octocat\n\n---\n*Generated with GitHub Profile Enhancer*",
    "wordCount": 120,
    "lineCount": 25
  }
}
```

#### 3.5.2 预览 README

```http
POST /api/v1/readme/preview
```

**请求体**（同生成 README）

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "htmlPreview": "<h1>Monalisa Octocat</h1>...",
    "markdown": "# Monalisa Octocat\n\n..."
  }
}
```

#### 3.5.3 获取 README 模板列表

```http
GET /api/v1/readme/templates
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_modern",
        "name": "Modern",
        "description": "现代简洁风格",
        "preview": "https://cdn.example.com/previews/readme_modern.png"
      },
      {
        "id": "tpl_classic",
        "name": "Classic",
        "description": "经典风格",
        "preview": "https://cdn.example.com/previews/readme_classic.png"
      }
    ]
  }
}
```

---

### 3.6 同步功能相关

#### 3.6.1 同步个人资料到 GitHub

```http
POST /api/v1/sync/profile
```

**请求头**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**请求体**
```json
{
  "bio": "I'm a passionate software engineer at GitHub...",
  "location": "San Francisco",
  "blog": "https://github.com/blog",
  "company": "GitHub",
  "twitterUsername": "monatheoctocat"
}
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "synced": true,
    "updatedFields": ["bio", "location", "blog", "company", "twitterUsername"],
    "profileUrl": "https://github.com/octocat"
  }
}
```

#### 3.6.2 同步 README 到 GitHub

```http
POST /api/v1/sync/readme
```

**请求体**
```json
{
  "owner": "octocat",
  "repo": "octocat",
  "content": "# Monalisa Octocat\n\n...",
  "commitMessage": "Update profile README",
  "branch": "main"
}
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "synced": true,
    "commit": {
      "sha": "7638417db6d59f3c431d3e1f261cc637155684cd",
      "url": "https://github.com/octocat/octocat/commit/7638417db6d59f3c431d3e1f261cc637155684cd"
    },
    "readmeUrl": "https://github.com/octocat/octocat/blob/main/README.md"
  }
}
```

#### 3.6.3 创建 Pull Request

```http
POST /api/v1/sync/pull-request
```

**请求体**
```json
{
  "owner": "octocat",
  "repo": "octocat",
  "title": "Update profile README",
  "body": "Updated profile README with new bio and image",
  "head": "update-profile-readme",
  "base": "main",
  "content": "# Monalisa Octocat\n\n..."
}
```

**响应示例 (201 Created)**
```json
{
  "success": true,
  "data": {
    "pr": {
      "number": 123,
      "url": "https://github.com/octocat/octocat/pull/123",
      "htmlUrl": "https://github.com/octocat/octocat/pull/123",
      "title": "Update profile README"
    }
  }
}
```

---

### 3.7 导出功能相关

#### 3.7.1 导出为本地文件

```http
POST /api/v1/export/local
```

**请求体**
```json
{
  "filename": "README.md",
  "content": "# Monalisa Octocat\n\n...",
  "format": "markdown"
}
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.example.com/export/README.md?token=abc123",
    "expiresAt": "2024-01-29T11:30:00Z"
  }
}
```

#### 3.7.2 下载文件

```http
GET /api/v1/export/download?token={token}
```

**查询参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| token | string | 是 | 下载令牌 |

**响应示例 (200 OK)**
```
Content-Type: text/markdown
Content-Disposition: attachment; filename="README.md"

# Monalisa Octocat
...
```

---

### 3.8 工具接口

#### 3.8.1 健康检查

```http
GET /api/v1/health
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "up",
      "redis": "up",
      "github": "up",
      "openai": "up"
    },
    "version": "1.0.0",
    "timestamp": "2024-01-29T10:30:00Z"
  }
}
```

#### 3.8.2 版本信息

```http
GET /api/v1/version
```

**响应示例 (200 OK)**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildDate": "2024-01-29T00:00:00Z",
    "gitCommit": "abc123def456",
    "apiVersion": "v1"
  }
}
```

---

## 四、OpenAI API

### 4.1 文本生成 (Chat Completions)

```http
POST https://api.openai.com/v1/chat/completions
```

**请求头**
```http
Authorization: Bearer {sk_xxxxx}
Content-Type: application/json
```

**请求体（简介生成示例）**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的个人简介撰写助手，擅长根据用户信息生成专业、简洁的个人简介。"
    },
    {
      "role": "user",
      "content": "请根据以下信息生成一个个人简介：\n\n用户名：octocat\n姓名：Monalisa Octocat\n公司：GitHub\n所在地：旧金山\n主要技能：JavaScript, TypeScript, React, Python\n代表项目：Hello-World (80 stars)\n\n要求：\n- 风格：专业\n- 语言：英文\n- 长度：中等 (5-8 行)\n- 包含统计信息占位符\n\n返回格式为纯文本，不要包含任何解释性文字。"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**响应示例 (200 OK)**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699012345,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm Monalisa Octocat, a passionate software engineer at GitHub specializing in full-stack development with JavaScript and TypeScript. Based in San Francisco, I love building tools that make developers' lives easier.\n\n![GitHub Stats](https://github-readme-stats.vercel.app/api?username=octocat&show_icons=true)\n\nMy expertise includes React, Python, and modern web technologies. I'm committed to creating elegant solutions and contributing to open-source projects."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 120,
    "total_tokens": 270
  }
}
```

### 4.2 图像生成 (DALL-E)

```http
POST https://api.openai.com/v1/images/generations
```

**请求头**
```http
Authorization: Bearer {sk_xxxxx}
Content-Type: application/json
```

**请求体（头像生成示例）**
```json
{
  "model": "dall-e-3",
  "prompt": "A professional software engineer avatar, gender neutral, adult, wearing glasses and a t-shirt, friendly smile expression, solid blue background (#4A90E2), realistic portrait style, high quality, 400x400 pixels",
  "n": 1,
  "size": "1024x1024",
  "response_format": "url"
}
```

**响应示例 (200 OK)**
```json
{
  "created": 1699012345,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxx/user-xxx/img-xxx.png"
    }
  ]
}
```

---

## 五、错误响应格式

### 5.1 标准错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息",
    "details": {
      "field": "具体字段错误信息"
    }
  },
  "meta": {
    "timestamp": "2024-01-29T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### 5.2 错误代码列表

| 错误代码 | HTTP 状态码 | 说明 |
|----------|------------|------|
| VALIDATION_FAILED | 400 | 请求参数验证失败 |
| INVALID_REQUEST | 400 | 无效的请求 |
| UNAUTHORIZED | 401 | 未授权，缺少 Token |
| INVALID_TOKEN | 401 | Token 无效或已过期 |
| TOKEN_EXPIRED | 401 | Token 已过期 |
| FORBIDDEN | 403 | 无权限访问 |
| NOT_FOUND | 404 | 资源不存在 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| EXTERNAL_API_ERROR | 502 | 外部 API 错误 |
| GITHUB_API_ERROR | 502 | GitHub API 错误 |
| OPENAI_API_ERROR | 502 | OpenAI API 错误 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库错误 |

### 5.3 GitHub API 错误代码

| HTTP 状态码 | 说明 | 解决方案 |
|------------|------|----------|
| 401 | 认证失败 | 检查 Token 是否正确 |
| 403 | 权限不足或限流 | 检查 Token 权限，或等待限流解除 |
| 404 | 资源不存在 | 检查 URL 和参数 |
| 422 | 请求参数错误 | 检查请求体格式 |
| 500 | GitHub 服务器错误 | 稍后重试 |

---

## 六、API 版本控制

### 6.1 版本策略

- 采用 URL 路径版本控制：`/api/v1/...`
- 主版本变更（如 v1 → v2）表示不兼容的 API 变更
- 次版本变更（如 v1.0 → v1.1）表示向后兼容的功能增强

### 6.2 版本生命周期

| 版本 | 状态 | 发布日期 | 废弃日期 | 停止服务日期 |
|------|------|----------|----------|--------------|
| v1 | 当前版本 | 2024-01-29 | - | - |

### 6.3 版本弃用通知

当 API 版本即将废弃时，将在响应头中包含弃用通知：

```http
X-API-Deprecation: v1 will be deprecated on 2025-01-29
X-API-Sunset: 2025-07-29
```

---

*文档版本：1.0*
*最后更新：2026-01-29*
