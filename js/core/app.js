/**
 * 个人应用平台 v2.0 - 主应用逻辑
 */

class App {
    constructor() {
        this.auth = new Auth();
        this.storage = new Storage();
        this.currentView = 'login';
        this.currentGame = null;
        
        // 游戏列表
        this.games = [
            {
                id: '2048',
                name: '2048',
                icon: '🧩',
                description: '经典滑块合并',
                class: Game2048
            },
            {
                id: 'guess',
                name: '猜数字',
                icon: '🔢',
                description: '1-100猜数字',
                class: GameGuess
            },
            {
                id: 'minesweeper',
                name: '扫雷',
                icon: '💣',
                description: '自定义难度',
                class: GameMinesweeper
            }
        ];
        
        // 软件列表（预留）
        this.apps = [
            {
                id: 'placeholder',
                name: '更多应用中',
                icon: '📱',
                description: '敬请期待',
                comingSoon: true
            }
        ];
    }

    /**
     * 初始化应用
     */
    async init() {
        // 检查登录状态
        const loginResult = this.auth.init();
        
        if (loginResult.success) {
            this.showHome();
        } else {
            this.showLogin();
        }
        
        // 注册Service Worker
        this.registerServiceWorker();
    }

    /**
     * 显示登录页面
     */
    showLogin() {
        this.currentView = 'login';
        
        document.getElementById('loginView').classList.add('active');
        document.getElementById('homeView').classList.remove('active');
        document.getElementById('gameContainer').classList.remove('active');
        
        // 自动填充账号
        const usernameInput = document.getElementById('usernameInput');
        usernameInput.value = this.auth.fixedUsername;
        
        // 绑定登录事件
        this.bindLoginEvents();
    }

    /**
     * 绑定登录事件
     */
    bindLoginEvents() {
        const loginBtn = document.getElementById('loginBtn');
        const passwordInput = document.getElementById('passwordInput');
        const rememberCheckbox = document.getElementById('rememberCheckbox');
        
        loginBtn.onclick = () => this.handleLogin();
        passwordInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.handleLogin();
        };
        
        // 自动记住密码
        rememberCheckbox.checked = true;
    }

    /**
     * 处理登录
     */
    handleLogin() {
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const remember = document.getElementById('rememberCheckbox').checked;
        
        const result = this.auth.login(username, password, remember);
        
        if (result.success) {
            this.showHome();
        } else {
            const errorEl = document.getElementById('loginError');
            errorEl.textContent = result.error || '登录失败';
            errorEl.classList.add('show');
        }
    }

    /**
     * 显示主页
     */
    showHome() {
        this.currentView = 'home';
        
        document.getElementById('loginView').classList.remove('active');
        document.getElementById('homeView').classList.add('active');
        
        this.renderAppList('all');
        this.bindHomeEvents();
    }

    /**
     * 渲染应用列表
     */
    renderAppList(tab = 'all') {
        const content = document.getElementById('appList');
        let items = [];
        
        // 根据Tab筛选
        if (tab === 'all') {
            items = [...this.games, ...this.apps];
        } else if (tab === 'games') {
            items = this.games;
        } else if (tab === 'apps') {
            items = this.apps;
        }
        
        // 渲染
        content.innerHTML = items.map(item => `
            <div class="app-card" data-id="${item.id}" ${item.comingSoon ? 'data-soon="true"' : ''}>
                <div class="app-icon">${item.icon}</div>
                <div class="app-name">${item.name}</div>
                <div class="app-desc">${item.description}</div>
            </div>
        `).join('');
        
        // 绑定点击事件
        content.querySelectorAll('.app-card').forEach(card => {
            card.onclick = () => {
                const id = card.dataset.id;
                const isComingSoon = card.dataset.soon === 'true';
                
                if (isComingSoon) {
                    this.showToast('敬请期待');
                } else {
                    this.openApp(id);
                }
            };
        });
    }

    /**
     * 绑定主页事件
     */
    bindHomeEvents() {
        // Tab切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                // 更新Tab状态
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 切换内容
                const tab = btn.dataset.tab;
                this.renderAppList(tab);
            };
        });
    }

    /**
     * 打开应用
     */
    openApp(appId) {
        // 记录最近使用
        this.storage.addRecentApp(appId);
        
        // 查找应用
        const game = this.games.find(g => g.id === appId);
        
        if (game) {
            this.openGame(game);
        }
    }

    /**
     * 打开游戏
     */
    openGame(game) {
        this.currentView = 'game';
        this.currentGame = game;
        
        const container = document.getElementById('gameContent');
        
        // 显示游戏容器
        document.getElementById('gameContainer').classList.add('active');
        document.getElementById('homeView').classList.remove('active');
        
        // 设置游戏标题
        document.getElementById('gameTitle').textContent = game.name;
        
        // 创建游戏实例
        const gameInstance = new game.class(container);
        gameInstance.start();
        
        // 保存游戏引用
        this.currentGameInstance = gameInstance;
        
        // 绑定返回按钮
        document.getElementById('gameBack').onclick = () => this.closeGame();
    }

    /**
     * 关闭游戏
     */
    closeGame() {
        if (this.currentGameInstance) {
            this.currentGameInstance.end();
            this.currentGameInstance.destroy();
            this.currentGameInstance = null;
        }
        
        this.currentView = 'home';
        this.currentGame = null;
        
        document.getElementById('gameContainer').classList.remove('active');
        document.getElementById('homeView').classList.add('active');
    }

    /**
     * 显示Toast提示
     */
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    /**
     * 注册Service Worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => {
                    console.log('[App] SW注册成功:', reg.scope);
                })
                .catch(err => {
                    console.error('[App] SW注册失败:', err);
                });
        }
    }
}

// 创建全局app实例
window.app = new App();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});