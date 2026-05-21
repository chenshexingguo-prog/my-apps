/**
 * 游戏基类 - 所有游戏的父类
 * 提供通用的游戏生命周期管理
 */

class GameBase {
    constructor(container) {
        this.container = container;
        this.gameId = '';
        this.name = '';
        this.icon = '🎮';
        this.description = '';
        this.isRunning = false;
        this.score = 0;
    }

    /**
     * 初始化游戏
     * 子类需要重写此方法
     */
    init() {
        throw new Error('子类必须实现 init() 方法');
    }

    /**
     * 开始游戏
     * 子类需要重写此方法
     */
    start() {
        throw new Error('子类必须实现 start() 方法');
    }

    /**
     * 暂停游戏
     * 可选重写
     */
    pause() {
        // 默认实现：什么也不做
    }

    /**
     * 继续游戏
     * 可选重写
     */
    resume() {
        // 默认实现：什么也不做
    }

    /**
     * 结束游戏
     * 子类需要重写此方法
     */
    end() {
        this.saveData();
        this.isRunning = false;
    }

    /**
     * 获取存档数据
     * 子类需要重写此方法
     */
    getSaveData() {
        return {
            score: this.score,
            timestamp: Date.now()
        };
    }

    /**
     * 加载存档
     * 子类需要重写此方法
     */
    loadSaveData(data) {
        if (data && data.score) {
            this.score = data.score;
        }
    }

    /**
     * 保存数据到localStorage
     */
    saveData() {
        const saveKey = `game_${this.gameId}_save`;
        const data = this.getSaveData();
        try {
            localStorage.setItem(saveKey, JSON.stringify(data));
        } catch (e) {
            console.error(`[${this.name}] 保存失败:`, e);
        }
    }

    /**
     * 从localStorage加载数据
     */
    loadData() {
        const saveKey = `game_${this.gameId}_save`;
        try {
            const data = localStorage.getItem(saveKey);
            if (data) {
                this.loadSaveData(JSON.parse(data));
            }
        } catch (e) {
            console.error(`[${this.name}] 加载失败:`, e);
        }
    }

    /**
     * 清除存档
     */
    clearData() {
        const saveKey = `game_${this.gameId}_save`;
        localStorage.removeItem(saveKey);
    }

    /**
     * 销毁游戏
     * 子类需要重写此方法
     */
    destroy() {
        this.container.innerHTML = '';
        this.isRunning = false;
    }

    /**
     * 显示提示
     */
    showToast(message) {
        window.app?.showToast?.(message);
    }

    /**
     * 渲染到容器
     */
    render() {
        if (!this.container) {
            console.error('[GameBase] 容器不存在');
            return;
        }
        this.container.innerHTML = '';
        this.init();
    }
}

// 导出
window.GameBase = GameBase;