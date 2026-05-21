/**
 * 用户认证模块
 * 处理登录、记住密码等功能
 */

class Auth {
    constructor() {
        // 固定账号
        this.fixedUsername = 'chenshe';
        this.fixedPassword = '54Song@@';
        
        this.currentUser = null;
        this.REMEMBER_KEY = 'saved_user';
    }

    /**
     * 初始化 - 自动登录
     */
    init() {
        return this.autoLogin();
    }

    /**
     * 登录
     */
    login(username, password, remember = true) {
        // 验证固定账号
        if (username === this.fixedUsername && password === this.fixedPassword) {
            this.currentUser = {
                username: username
            };
            
            // 记住密码
            if (remember) {
                localStorage.setItem(this.REMEMBER_KEY, JSON.stringify({
                    username: username
                }));
            } else {
                localStorage.removeItem(this.REMEMBER_KEY);
            }
            
            return { success: true };
        }
        
        return { success: false, error: '用户名或密码错误' };
    }

    /**
     * 自动登录
     */
    autoLogin() {
        try {
            const saved = localStorage.getItem(this.REMEMBER_KEY);
            if (saved) {
                const user = JSON.parse(saved);
                if (user.username === this.fixedUsername) {
                    this.currentUser = user;
                    return { success: true, auto: true };
                }
            }
        } catch (e) {
            console.error('[Auth] 自动登录失败:', e);
        }
        
        return { success: false };
    }

    /**
     * 登出
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.REMEMBER_KEY);
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// 导出
window.Auth = Auth;