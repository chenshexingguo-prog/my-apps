# 添加新软件指南

> 本文档说明如何在个人应用平台中添加新软件

---

## 一、软件模板

复制以下模板创建新软件：

```javascript
// js/apps/app-yourapp.js

// 引入软件基类
import AppBase from './app-base.js';

class YourApp extends AppBase {
    constructor(container) {
        super(container);
        this.name = '你的应用';
        this.version = '1.0.0';
        this.description = '应用简介';
    }

    // 应用初始化
    init() {
        // TODO: 初始化应用
    }

    // 启动应用
    start() {
        // TODO: 启动逻辑
    }

    // 暂停应用
    pause() {
        // TODO: 暂停逻辑
    }

    // 继续应用
    resume() {
        // TODO: 继续逻辑
    }

    // 关闭应用
    end() {
        // TODO: 关闭逻辑
        this.saveData();
    }

    // 获取数据
    getSaveData() {
        return {
            // TODO: 返回保存的数据
        };
    }

    // 加载数据
    loadSaveData(data) {
        // TODO: 加载数据
    }

    // 销毁应用
    destroy() {
        // TODO: 清理资源
        super.destroy();
    }
}

export default YourApp;
```

---

## 二、注册软件

在 `js/core/app.js` 中注册软件：

```javascript
// 导入软件
import YourApp from '../apps/app-yourapp.js';

// 在软件列表中注册
const APPS = [
    {
        id: 'yourapp',
        name: '你的应用',
        icon: '📱',
        description: '应用简介',
        class: YourApp
    },
    // ... 其他软件
];
```

---

## 三、添加软件步骤

### 步骤1：创建软件文件

```
js/apps/app-yourapp.js
```

### 步骤2：继承软件基类

```javascript
import AppBase from './app-base.js';

class YourApp extends AppBase {
    // 实现应用逻辑
}

export default YourApp;
```

### 步骤3：在app.js中注册

```javascript
import YourApp from './app-yourapp.js';

const APPS = [
    // 添加到软件列表
];
```

### 步骤4：更新平台显示

软件将自动出现在"应用"Tab中

---

## 四、软件与游戏的区别

| 特性 | 软件 | 游戏 |
|------|------|------|
| 目的 | 完成任务/提高效率 | 娱乐 |
| 分数 | 通常无 | 通常有 |
| 结束 | 手动关闭 | 达到条件结束 |
| 存档 | 可选 | 通常需要 |
| 排行榜 | 无 | 可选 |

---

## 五、示例：添加计算器

### 5.1 创建文件

```javascript
// js/apps/app-calculator.js

import AppBase from './app-base.js';

class AppCalculator extends AppBase {
    constructor(container) {
        super(container);
        this.name = '计算器';
        this.icon = '🧮';
        this.description = '简单计算器';
    }

    init() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.shouldResetDisplay = false;
    }

    start() {
        // 渲染计算器UI
        this.render();
    }

    // 数字输入
    inputDigit(digit) {
        if (this.shouldResetDisplay) {
            this.currentValue = digit;
            this.shouldResetDisplay = false;
        } else {
            this.currentValue = this.currentValue === '0' 
                ? digit 
                : this.currentValue + digit;
        }
        this.updateDisplay();
    }

    // 操作符
    setOperator(op) {
        if (this.previousValue !== null) {
            this.calculate();
        }
        this.operator = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
    }

    // 计算
    calculate() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        
        switch (this.operator) {
            case '+':
                this.currentValue = String(prev + current);
                break;
            case '-':
                this.currentValue = String(prev - current);
                break;
            case '*':
                this.currentValue = String(prev * current);
                break;
            case '/':
                this.currentValue = prev / current;
                break;
        }
        
        this.operator = null;
        this.previousValue = null;
    }

    // ... 其他方法
}

export default AppCalculator;
```

### 5.2 注册软件

```javascript
// js/core/app.js
import AppCalculator from '../apps/app-calculator.js';

const APPS = [
    {
        id: 'calculator',
        name: '计算器',
        icon: '🧮',
        description: '简单计算器',
        class: AppCalculator
    }
];
```

---

## 六、软件基类接口

| 方法 | 必须实现 | 说明 |
|------|---------|------|
| init() | ✅ | 初始化应用 |
| start() | ✅ | 启动应用 |
| pause() | ❌ | 暂停（可选） |
| resume() | ❌ | 继续（可选） |
| end() | ✅ | 关闭应用 |
| getSaveData() | ❌ | 获取数据（可选） |
| loadSaveData() | ❌ | 加载数据（可选） |
| destroy() | ✅ | 销毁应用 |

---

## 七、排座系统接入示例

```javascript
// js/apps/app-seatArrange.js

import AppBase from './app-base.js';

class AppSeatArrange extends AppBase {
    constructor(container) {
        super(container);
        this.name = '排座系统';
        this.icon = '🪑';
        this.description = '学生座位安排工具';
    }

    init() {
        // 加载排座系统配置
        this.students = [];
        this.seats = [];
    }

    start() {
        // 显示排座界面
        this.render();
        // 加载学生数据
        this.loadStudents();
    }

    loadStudents() {
        // 从 localStorage 加载学生数据
        const saved = localStorage.getItem('seat_arrange_students');
        if (saved) {
            this.students = JSON.parse(saved);
        }
    }

    // ... 其他排座功能
}

export default AppSeatArrange;
```

---

## 八、注意事项

1. **数据持久化** - 重要数据要保存到 localStorage
2. **清理资源** - 应用关闭时清理定时器、事件监听
3. **响应式设计** - 适配手机屏幕
4. **触摸友好** - 按钮足够大，间距合理
5. **错误处理** - 异常输入要有提示

---

## 九、调试技巧

```javascript
// 在应用中添加调试日志
console.log('[AppName] MethodName called', data);

// 查看应用数据
console.log(localStorage.getItem('app_yourapp_data'));
```

---

*最后更新：2026-05-21*