/**
 * 软件基类 - 所有软件的父类
 */

class AppBase {
    constructor(container) {
        this.container = container;
        this.appId = '';
        this.name = '';
        this.icon = '📱';
        this.description = '';
        this.isRunning = false;
    }

    init() {
        throw new Error('子类必须实现 init() 方法');
    }

    start() {
        throw new Error('子类必须实现 start() 方法');
    }

    pause() {}

    resume() {}

    end() {
        this.saveData();
        this.isRunning = false;
    }

    getSaveData() {
        return {};
    }

    loadSaveData(data) {}

    saveData() {
        const saveKey = `app_${this.appId}_save`;
        const data = this.getSaveData();
        try {
            localStorage.setItem(saveKey, JSON.stringify(data));
        } catch (e) {
            console.error(`[${this.name}] 保存失败:`, e);
        }
    }

    loadData() {
        const saveKey = `app_${this.appId}_save`;
        try {
            const data = localStorage.getItem(saveKey);
            if (data) {
                this.loadSaveData(JSON.parse(data));
            }
        } catch (e) {
            console.error(`[${this.name}] 加载失败:`, e);
        }
    }

    destroy() {
        this.container.innerHTML = '';
        this.isRunning = false;
    }

    showToast(message) {
        window.app?.showToast?.(message);
    }
}

window.AppBase = AppBase;