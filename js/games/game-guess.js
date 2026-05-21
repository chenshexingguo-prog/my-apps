/**
 * 猜数字游戏
 */

class GameGuess extends GameBase {
    constructor(container) {
        super(container);
        this.gameId = 'guess';
        this.name = '猜数字';
        this.icon = '🔢';
        this.description = '1-100猜数字';
        
        this.secretNumber = 0;
        this.guessHistory = [];
        this.guessCount = 0;
        this.bestScore = 0;
        this.minRange = 1;
        this.maxRange = 100;
        
        this.loadData();
        this.loadBestScore();
    }

    init() {
        this.secretNumber = Math.floor(Math.random() * 100) + 1;
        this.guessHistory = [];
        this.guessCount = 0;
        this.minRange = 1;
        this.maxRange = 100;
        
        this.render();
        this.bindEvents();
    }

    start() {
        this.render();
    }

    end() {
        this.saveData();
        this.saveBestScore();
        this.isRunning = false;
    }

    getSaveData() {
        return {
            guessCount: this.guessCount,
            guessHistory: this.guessHistory,
            timestamp: Date.now()
        };
    }

    loadSaveData(data) {
        // 不自动加载，保持每次都是新游戏
    }

    loadBestScore() {
        const best = localStorage.getItem('game_guess_best');
        this.bestScore = best ? parseInt(best) : 0;
    }

    saveBestScore() {
        if (this.guessCount > 0 && this.bestScore === 0 || this.guessCount < this.bestScore) {
            this.bestScore = this.guessCount;
            localStorage.setItem('game_guess_best', this.bestScore);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-guess">
                <div class="title">猜数字</div>
                <div class="subtitle">我在 ${this.minRange} - ${this.maxRange} 之间选了一个数字</div>
                
                <div class="input-area">
                    <input type="number" id="guessInput" placeholder="${this.minRange}-${this.maxRange}" 
                           min="${this.minRange}" max="${this.maxRange}">
                    <button class="guess-btn">猜</button>
                </div>
                
                <div class="history">
                    <div class="history-title">猜测历史</div>
                    <div id="historyList">
                        ${this.guessHistory.length === 0 ? '<p style="color: var(--text-secondary)">还没有猜测</p>' : ''}
                        ${this.guessHistory.map(g => `
                            <div class="history-item ${g.hint}">
                                <span>${g.number}</span>
                                <span>${g.hint === 'correct' ? '✓ 正确!' : g.hint === 'big' ? '↓ 太大了' : '↑ 太小了'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">${this.guessCount}</div>
                        <div class="stat-label">猜测次数</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.bestScore || '-'}</div>
                        <div class="stat-label">最佳记录</div>
                    </div>
                </div>
                
                <button class="new-game">重新开始</button>
            </div>
        `;
    }

    bindEvents() {
        const input = this.container.querySelector('#guessInput');
        const btn = this.container.querySelector('.guess-btn');
        const newGameBtn = this.container.querySelector('.new-game');
        
        btn.onclick = () => this.makeGuess();
        
        input.onkeypress = (e) => {
            if (e.key === 'Enter') this.makeGuess();
        };
        
        newGameBtn.onclick = () => this.reset();
        
        // 自动聚焦
        setTimeout(() => input.focus(), 100);
    }

    makeGuess() {
        const input = this.container.querySelector('#guessInput');
        const guess = parseInt(input.value);
        
        if (isNaN(guess) || guess < this.minRange || guess > this.maxRange) {
            this.showToast(`请输入 ${this.minRange}-${this.maxRange} 之间的数字`);
            return;
        }
        
        this.guessCount++;
        
        let hint;
        if (guess === this.secretNumber) {
            hint = 'correct';
            this.showToast(`🎉 恭喜你猜对了！用了 ${this.guessCount} 次`);
            this.saveBestScore();
        } else if (guess > this.secretNumber) {
            hint = 'big';
            this.showToast('太大了');
            if (guess < this.maxRange) this.maxRange = guess;
        } else {
            hint = 'small';
            this.showToast('太小了');
            if (guess > this.minRange) this.minRange = guess;
        }
        
        this.guessHistory.push({ number: guess, hint });
        
        input.value = '';
        this.render();
        this.bindEvents();
        
        if (hint === 'correct') {
            setTimeout(() => this.reset(), 2000);
        }
    }

    reset() {
        this.init();
    }

    showToast(message) {
        window.app?.showToast?.(message);
    }

    destroy() {
        super.destroy();
    }
}

// 导出
window.GameGuess = GameGuess;