# 个人应用平台 v2.0

> 你的个人软件和游戏中心

---

## 📱 功能特点

- 🎮 **游戏中心**: 2048、猜数字，更多游戏陆续上线
- 📱 **软件平台**: 预留应用接口，支持扩展
- 💾 **本地存储**: 所有数据保存在本地
- 🔐 **账号系统**: 记住密码，一键登录
- 📲 **PWA支持**: 可安装到主屏幕，像原生APP
- ☁️ **云端预留**: 当前本地，未来可升级云同步

---

## 🚀 快速开始

### 方式一：本地打开
```bash
# 直接用浏览器打开 index.html
# 注意：需要启动HTTP服务才能使用Service Worker
```

### 方式二：HTTP服务
```bash
cd apps/pwa-demo-v2
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 方式三：安装到手机
1. 用手机浏览器打开部署地址
2. 点击右上角菜单 → "添加到主屏幕"
3. 即可像原生APP一样使用

---

## 📁 项目结构

```
pwa-demo-v2/
├── index.html              # 主入口
├── manifest.json           # PWA配置
├── service-worker.js       # 离线缓存
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── core/
│   │   ├── app.js         # 主应用逻辑
│   │   ├── auth.js        # 用户认证
│   │   └── storage.js      # 存储管理
│   ├── games/
│   │   ├── game-base.js   # 游戏基类
│   │   ├── game-2048.js   # 2048游戏
│   │   └── game-guess.js  # 猜数字游戏
│   └── apps/
│       └── placeholder.js # 应用占位
└── docs/
    ├── ADD_GAME.md         # 添加游戏指南
    ├── ADD_APP.md          # 添加软件指南
    └── CLOUD_MIGRATION.md  # 云端迁移指南
```

---

## 🎮 游戏列表

| 游戏 | 说明 | 状态 |
|------|------|------|
| 2048 | 经典滑块合并游戏 | ✅ |
| 猜数字 | 1-100猜数字 | ✅ |
| 俄罗斯方块 | 敬请期待 | 🔜 |
| 贪吃蛇 | 敬请期待 | 🔜 |

---

## 🔧 添加新游戏

详见 [docs/ADD_GAME.md](docs/ADD_GAME.md)

---

## 🔧 添加新软件

详见 [docs/ADD_APP.md](docs/ADD_APP.md)

---

## ☁️ 云端升级

详见 [docs/CLOUD_MIGRATION.md](docs/CLOUD_MIGRATION.md)

---

## 👤 账号信息

- 用户名: `chenshe`
- 密码: `54Song@@`
- 状态: 不可修改

---

## 📋 开发者说明

### 技术栈
- HTML5 + CSS3 + JavaScript (ES6+)
- PWA (Service Worker + Web App Manifest)
- localStorage 本地存储

### 适配设备
- 红米K80 (1080×2400)
- 其他Android/iOS设备

### 代码规范
- 模块化开发
- ES6 Class 继承
- 统一导出 window 对象

---

*最后更新: 2026-05-21*