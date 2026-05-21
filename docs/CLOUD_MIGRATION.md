# 云端迁移指南

> 本文档说明如何将本地PWA应用升级为云端同步版本

---

## 一、迁移概述

### 当前状态（Phase 1）
- 纯本地 localStorage 存储
- 无需服务器
- 单设备使用

### 目标状态（Phase 2）
- 云端数据库存储
- 跨设备同步（手机+电脑）
- 用户认证系统

---

## 二、迁移步骤

### 步骤1：准备服务器

**推荐配置**：
- CPU: 2核+
- 内存: 4GB+
- 硬盘: 50GB+
- 系统: Ubuntu 20.04+

**推荐服务**：
- Node.js 18+
- PostgreSQL 14+
- Nginx

### 步骤2：创建数据库

```sql
-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建存档表
CREATE TABLE saves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    app_type VARCHAR(20) NOT NULL, -- 'game' or 'app'
    app_id VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 步骤3：实现API接口

#### 认证接口

```javascript
// POST /api/auth/login
{
    username: 'chenshe',
    password: '54Song@@'
}

// 响应
{
    success: true,
    token: 'jwt_token_here',
    user: { id: 1, username: 'chenshe' }
}
```

#### 同步接口

```javascript
// GET /api/sync/pull
Headers: { Authorization: 'Bearer <token>' }

// 响应
{
    games: {
        '2048': { score: 1000, lastPlayed: '...' },
        'guess': { bestScore: 5, history: [...] }
    },
    apps: {
        'calculator': { ... }
    }
}

// POST /api/sync/push
{
    games: { ... },
    apps: { ... }
}
```

### 步骤4：修改前端存储模块

修改 `js/core/storage.js`：

```javascript
// 原来的 localStorage 模式
class Storage {
    constructor() {
        this.isCloud = false;
    }
    
    async init() {
        // 检查是否有云端配置
        const cloudConfig = localStorage.getItem('cloud_config');
        if (cloudConfig) {
            this.cloudEndpoint = JSON.parse(cloudConfig).endpoint;
            this.isCloud = true;
        }
    }
    
    async save(key, data) {
        if (this.isCloud) {
            // 云端同步
            return this.cloudSave(key, data);
        } else {
            // 本地存储
            localStorage.setItem(key, JSON.stringify(data));
        }
    }
    
    async load(key) {
        if (this.isCloud) {
            return this.cloudLoad(key);
        } else {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
    }
    
    // 云端保存
    async cloudSave(key, data) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/sync/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ key, data })
        });
        return response.json();
    }
}
```

### 步骤5：实现登录保持

```javascript
// js/core/auth.js

class Auth {
    constructor() {
        this.currentUser = null;
    }
    
    async login(username, password) {
        // 固定账号验证
        if (username === 'chenshe' && password === '54Song@@') {
            // 本地模式：直接登录
            this.currentUser = { username: 'chenshe' };
            localStorage.setItem('saved_user', JSON.stringify({
                username: 'chenshe'
            }));
            return { success: true };
        }
        
        // 云端模式：请求API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth_token', data.token);
            this.currentUser = data.user;
            return { success: true };
        }
        
        return { success: false, error: '登录失败' };
    }
    
    // 自动登录
    async autoLogin() {
        // 尝试本地账号
        const savedUser = localStorage.getItem('saved_user');
        if (savedUser) {
            const { username } = JSON.parse(savedUser);
            return this.login(username, localStorage.getItem('saved_password'));
        }
        
        // 尝试云端token
        const token = localStorage.getItem('auth_token');
        if (token) {
            return this.verifyToken(token);
        }
        
        return { success: false };
    }
}
```

---

## 三、数据迁移

### 本地数据导出

```javascript
// 导出所有本地数据
function exportLocalData() {
    const data = {
        games: {},
        apps: {}
    };
    
    // 遍历所有 localStorage 键
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('game_') || key.startsWith('app_')) {
            data[key.replace(/_/g, '.')] = localStorage.getItem(key);
        }
    }
    
    return data;
}
```

### 云端数据导入

```javascript
// 上传到云端
async function uploadToCloud(data) {
    const token = localStorage.getItem('auth_token');
    await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
}
```

---

## 四、跨平台同步

### 4.1 手机端（红米K80）
- 优先使用本地存储
- 有网络时自动同步到云端
- 离线时正常工作

### 4.2 电脑端（未来）
- 浏览器打开Web版本
- 登录同一账号
- 自动同步数据

### 4.3 同步策略

```
┌─────────────┐         ┌─────────────┐
│   手机端    │  ←→    │   云端      │  ←→    │   电脑端    │
│  (本地优先) │         │   (数据中枢) │         │   (Web版)   │
└─────────────┘         └─────────────┘         └─────────────┘
```

**同步规则**：
1. 每次启动时拉取最新数据
2. 每次修改后推送更新
3. 冲突时以最新时间戳为准

---

## 五、部署检查清单

- [ ] 服务器环境准备完毕
- [ ] 数据库创建完成
- [ ] 后端API部署完成
- [ ] 前端修改完成
- [ ] HTTPS证书配置
- [ ] 数据迁移完成
- [ ] 测试登录同步

---

## 六、预计工作量

| 阶段 | 内容 | 时间 |
|------|------|------|
| 服务器搭建 | 购买配置Ubuntu | 2小时 |
| 数据库设计 | PostgreSQL建表 | 1小时 |
| 后端开发 | Node.js API | 8小时 |
| 前端修改 | 存储模块重构 | 4小时 |
| 测试 | 全端测试 | 4小时 |
| **总计** | | **约19小时** |

---

## 七、推荐技术栈（未来）

| 用途 | 技术 | 说明 |
|------|------|------|
| 后端 | Node.js + Express | 轻量易上手 |
| 数据库 | PostgreSQL | 稳定可靠 |
| 认证 | JWT | 无状态认证 |
| 存储 | 阿里云OSS | 文件存储 |
| 域名 | 自定义域名 | 专业形象 |

---

*最后更新：2026-05-21*