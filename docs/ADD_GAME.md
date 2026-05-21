# 添加新游戏指南

> 本文档说明如何在个人应用平台中添加新游戏

---

## 一、游戏模板

复制以下模板创建新游戏：

```javascript
// js/games/game-newgame.js

// 引入游戏基类
import GameBase from './game-base.js';

class GameNewGame extends GameBase {
    constructor(container) {
        super(container);
        this.name = '新游戏名称';
        this.version = '1.0.0';
        this.description = '游戏简介';
    }

    // 游戏初始化
    init() {
        // TODO: 初始化游戏
    }

    // 开始游戏
    start() {
        // TODO: 开始游戏逻辑
    }

    // 暂停游戏
    pause() {
        // TODO: 暂停逻辑
    }

    // 继续游戏
    resume() {
        // TODO: 继续逻辑
    }

    // 结束游戏
    end() {
        // TODO: 结束逻辑
        this.saveData(); // 保存存档
    }

    // 获取存档数据
    getSaveData() {
        return {
            // TODO: 返回存档数据
        };
    }

    // 加载存档
    loadSaveData(data) {
        // TODO: 加载存档
    }

    // 销毁游戏
    destroy() {
        // TODO: 清理游戏资源
        super.destroy();
    }
}

// 导出游戏类
export default GameNewGame;
```

---

## 二、注册游戏

在 `js/core/app.js` 中注册游戏：

```javascript
// 导入游戏
import GameNewGame from '../games/game-newgame.js';

// 在游戏列表中注册
const GAMES = [
    {
        id: 'newgame',
        name: '新游戏',
        icon: '🎮',
        description: '游戏简介',
        class: GameNewGame
    },
    // ... 其他游戏
];
```

---

## 三、添加游戏步骤

### 步骤1：创建游戏文件

```
js/games/game-yourgame.js
```

### 步骤2：继承游戏基类

```javascript
import GameBase from './game-base.js';

class YourGame extends GameBase {
    // 实现游戏逻辑
}

export default YourGame;
```

### 步骤3：在app.js中注册

```javascript
import YourGame from './game-yourgame.js';

const GAMES = [
    // 添加到游戏列表
];
```

### 步骤4：更新index.html

在游戏列表HTML中添加新游戏卡片（如果使用静态HTML）

---

## 四、游戏基类接口说明

| 方法 | 必须实现 | 说明 |
|------|---------|------|
| init() | ✅ | 初始化游戏 |
| start() | ✅ | 开始游戏 |
| pause() | ❌ | 暂停（可选） |
| resume() | ❌ | 继续（可选） |
| end() | ✅ | 结束游戏 |
| getSaveData() | ✅ | 获取存档 |
| loadSaveData() | ✅ | 加载存档 |
| destroy() | ✅ | 销毁游戏 |

---

## 五、示例：添加俄罗斯方块

### 5.1 创建文件

```javascript
// js/games/game-tetris.js

import GameBase from './game-base.js';

class GameTetris extends GameBase {
    constructor(container) {
        super(container);
        this.name = '俄罗斯方块';
        this.icon = '🧱';
        this.description = '经典下落消除游戏';
        
        // 游戏配置
        this.boardWidth = 10;
        this.boardHeight = 20;
    }

    init() {
        // 初始化游戏板
        this.board = Array(this.boardHeight).fill().map(() => 
            Array(this.boardWidth).fill(0)
        );
    }

    start() {
        // 生成第一个方块
        this.spawnBlock();
    }

    // ... 其他方法
}

export default GameTetris;
```

### 5.2 注册游戏

```javascript
// js/core/app.js
import GameTetris from '../games/game-tetris.js';

const GAMES = [
    // ... 其他游戏
    {
        id: 'tetris',
        name: '俄罗斯方块',
        icon: '🧱',
        description: '经典下落消除游戏',
        class: GameTetris
    }
];
```

---

## 六、存档系统

### 6.1 自动存档

游戏结束时自动调用 `this.saveData()` 保存到 localStorage

### 6.2 存档格式

```javascript
{
    gameId: 'yourgame',
    timestamp: 1716192000000,
    data: {
        // 游戏特定数据
        score: 1000,
        level: 5,
        // ...
    }
}
```

### 6.3 手动存档

```javascript
// 在需要时手动保存
this.saveData({
    customKey: 'customValue'
});
```

---

## 七、注意事项

1. **保持游戏独立** - 每个游戏应该能独立运行
2. **清理资源** - 游戏退出时务必清理定时器、事件监听等
3. **保存进度** - 每次结束都要保存玩家进度
4. **适配屏幕** - 使用相对单位适配不同屏幕
5. **触摸支持** - 移动端必须支持触摸操作

---

## 八、调试技巧

```javascript
// 在游戏中添加调试日志
console.log('[GameName] MethodName called', data);

// 使用 localStorage 查看存档
console.log(localStorage.getItem('game_yourgame_save'));
```

---

*最后更新：2026-05-21*