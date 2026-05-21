/**
 * 存储管理模块
 * 封装localStorage操作
 */

class Storage {
    constructor() {
        this.PREFIX = 'pwa_demo_';
    }

    /**
     * 保存数据
     */
    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this.PREFIX + key, data);
            return true;
        } catch (e) {
            console.error('[Storage] 保存失败:', e);
            return false;
        }
    }

    /**
     * 获取数据
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('[Storage] 读取失败:', e);
            return defaultValue;
        }
    }

    /**
     * 删除数据
     */
    remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    }

    /**
     * 清除所有数据
     */
    clear() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
    }

    /**
     * 获取最近使用的应用
     */
    getRecentApps(limit = 3) {
        return this.get('recent_apps', []).slice(0, limit);
    }

    /**
     * 添加最近使用的应用
     */
    addRecentApp(appId) {
        let recent = this.get('recent_apps', []);
        
        // 移除已存在的
        recent = recent.filter(id => id !== appId);
        
        // 添加到开头
        recent.unshift(appId);
        
        // 限制数量
        recent = recent.slice(0, 5);
        
        this.set('recent_apps', recent);
    }

    /**
     * 获取收藏的应用
     */
    getFavorites() {
        return this.get('favorites', []);
    }

    /**
     * 切换收藏状态
     */
    toggleFavorite(appId) {
        let favorites = this.get('favorites', []);
        
        if (favorites.includes(appId)) {
            favorites = favorites.filter(id => id !== appId);
        } else {
            favorites.push(appId);
        }
        
        this.set('favorites', favorites);
        return favorites.includes(appId);
    }

    /**
     * 检查是否已收藏
     */
    isFavorite(appId) {
        const favorites = this.get('favorites', []);
        return favorites.includes(appId);
    }
}

// 导出
window.Storage = Storage;