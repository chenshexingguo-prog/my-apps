/**
 * 2048游戏
 */

class Game2048 extends GameBase {
    constructor(container) {
        super(container);
        this.gameId = '2048';
        this.name = '2048';
        this.icon = '🧩';
        this.description = '经典滑块合并游戏';
        
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.isGameOver = false;
        
        this.loadData();
        this.loadBestScore();
    }

    init() {
        // 初始化网格
        this.grid = Array(this.size).fill(null).map(() => 
            Array(this.size).fill(0)
        );
        this.score = 0;
        this.isGameOver = false;
        
        // 添加初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderGrid();
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
            grid: this.grid,
            score: this.score,
            timestamp: Date.now()
        };
    }

    loadSaveData(data) {
        if (data && data.grid) {
            this.grid = data.grid;
            this.score = data.score || 0;
        }
    }

    loadBestScore() {
        const best = localStorage.getItem('game_2048_best');
        this.bestScore = best ? parseInt(best) : 0;
    }

    saveBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('game_2048_best', this.bestScore);
        }
    }

    renderGrid() {
        this.container.innerHTML = `
            <div class="game-2048">
                <div class="score-bar">
                    <div class="score">
                        <div class="score-label">当前</div>
                        <div class="score-value">${this.score}</div>
                    </div>
                    <div class="score">
                        <div class="score-label">最高</div>
                        <div class="score-value">${this.bestScore}</div>
                    </div>
                </div>
                <div class="grid" id="grid2048"></div>
                <div class="controls">
                    <button class="new-game">新游戏</button>
                </div>
            </div>
            <div class="game-overlay" id="gameOverOverlay">
                <h2>游戏结束</h2>
                <p>得分: ${this.score}</p>
                <button class="restart-btn">再来一局</button>
            </div>
        `;
        
        const gridEl = this.container.querySelector('#grid2048');
        gridEl.style.display = 'grid';
        gridEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        gridEl.style.gap = '8px';
        
        this.updateGridDisplay();
        
        // 绑定新游戏按钮
        this.container.querySelector('.new-game').onclick = () => this.init();
        this.container.querySelector('.restart-btn').onclick = () => {
            this.hideOverlay();
            this.init();
        };
    }

    updateGridDisplay() {
        const gridEl = this.container.querySelector('#grid2048');
        if (!gridEl) return;
        
        gridEl.innerHTML = '';
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const value = this.grid[r][c];
                cell.textContent = value || '';
                cell.dataset.value = value || '';
                gridEl.appendChild(cell);
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    bindEvents() {
        let startX, startY;
        const gridEl = this.container.querySelector('#grid2048');
        
        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        
        const handleTouchEnd = (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const dx = endX - startX;
            const dy = endY - startY;
            
            const minSwipe = 30;
            
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
                if (dx > 0) this.move('right');
                else this.move('left');
            } else if (Math.abs(dy) > minSwipe) {
                if (dy > 0) this.move('down');
                else this.move('up');
            }
            
            startX = null;
            startY = null;
        };
        
        gridEl.addEventListener('touchstart', handleTouchStart, { passive: true });
        gridEl.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // 键盘支持
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning && !this.isGameOver) {
                switch(e.key) {
                    case 'ArrowRight': this.move('right'); break;
                    case 'ArrowLeft': this.move('left'); break;
                    case 'ArrowUp': this.move('up'); break;
                    case 'ArrowDown': this.move('down'); break;
                }
            }
        });
    }

    move(direction) {
        if (this.isGameOver) return;
        
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateGridDisplay();
            
            if (this.isGameOverCheck()) {
                this.isGameOver = true;
                this.showOverlay();
                this.saveBestScore();
            }
            
            this.saveData();
        }
    }

    moveLeft() {
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(v => v !== 0);
            const merged = this.merge(row);
            const newRow = this.padRow(merged);
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) {
                this.grid[r] = newRow;
                return true;
            }
        }
        return false;
    }

    moveRight() {
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(v => v !== 0).reverse();
            const merged = this.merge(row);
            const newRow = this.padRow(merged).reverse();
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) {
                this.grid[r] = newRow;
                return true;
            }
        }
        return false;
    }

    moveUp() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== 0) col.push(this.grid[r][c]);
            }
            const merged = this.merge(col);
            const newCol = this.padCol(merged);
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== newCol[r]) {
                    moved = true;
                    this.grid[r][c] = newCol[r];
                }
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = this.size - 1; r >= 0; r--) {
                if (this.grid[r][c] !== 0) col.push(this.grid[r][c]);
            }
            const merged = this.merge(col);
            const newCol = this.padCol(merged).reverse();
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== newCol[r]) {
                    moved = true;
                    this.grid[r][c] = newCol[r];
                }
            }
        }
        return moved;
    }

    merge(row) {
        const result = [];
        let i = 0;
        
        while (i < row.length) {
            if (i + 1 < row.length && row[i] === row[i + 1]) {
                const merged = row[i] * 2;
                result.push(merged);
                this.score += merged;
                i += 2;
            } else {
                result.push(row[i]);
                i++;
            }
        }
        
        return result;
    }

    padRow(row) {
        while (row.length < this.size) row.push(0);
        return row;
    }

    padCol(col) {
        while (col.length < this.size) col.unshift(0);
        return col;
    }

    isGameOverCheck() {
        // 检查是否有空格
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return false;
            }
        }
        
        // 检查是否有可以合并的相邻格子
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c];
                if (c < this.size - 1 && this.grid[r][c + 1] === val) return false;
                if (r < this.size - 1 && this.grid[r + 1][c] === val) return false;
            }
        }
        
        return true;
    }

    showOverlay() {
        const overlay = this.container.querySelector('#gameOverOverlay');
        if (overlay) {
            overlay.classList.add('show');
            overlay.querySelector('p').textContent = `得分: ${this.score}`;
        }
    }

    hideOverlay() {
        const overlay = this.container.querySelector('#gameOverOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    destroy() {
        super.destroy();
    }
}

// 导出
window.Game2048 = Game2048;