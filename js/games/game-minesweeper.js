/**
 * 扫雷游戏
 * 支持自定义大小和炸弹数量
 */

class GameMinesweeper extends GameBase {
    constructor(container) {
        super(container);
        this.gameId = 'minesweeper';
        this.name = '扫雷';
        this.icon = '💣';
        this.description = '经典扫雷游戏';
        
        // 默认设置
        this.defaultRows = 9;
        this.defaultCols = 9;
        this.defaultBombs = 10;
        
        // 当前设置
        this.rows = this.defaultRows;
        this.cols = this.defaultCols;
        this.bombs = this.defaultBombs;
        
        // 游戏状态
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        
        this.loadData();
    }

    init() {
        this.resetGame(this.defaultRows, this.defaultCols, this.defaultBombs);
    }

    start() {
        this.render();
    }

    end() {
        this.stopTimer();
        this.saveData();
        this.isRunning = false;
    }

    /**
     * 重置游戏
     */
    resetGame(rows, cols, bombs) {
        this.rows = rows;
        this.cols = cols;
        this.bombs = bombs;
        
        // 验证炸弹数量
        if (this.bombs >= this.rows * this.cols) {
            this.bombs = Math.floor(this.rows * this.cols * 0.5);
        }
        
        // 初始化网格
        this.grid = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(0)
        );
        this.revealed = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(false)
        );
        this.flagged = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(false)
        );
        
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.stopTimer();
        
        this.render();
    }

    /**
     * 生成炸弹
     * 排除第一次点击的位置
     */
    generateBombs(excludeRow, excludeCol) {
        const totalCells = this.rows * this.cols;
        const bombPositions = new Set();
        
        // 计算排除区域（3x3）
        const excludeSet = new Set();
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = excludeRow + dr;
                const c = excludeCol + dc;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    excludeSet.add(`${r},${c}`);
                }
            }
        }
        
        // 生成炸弹位置
        while (bombPositions.size < this.bombs) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            const key = `${r},${c}`;
            
            if (!excludeSet.has(key) && !bombPositions.has(key)) {
                bombPositions.add(key);
            }
        }
        
        // 设置炸弹
        for (const pos of bombPositions) {
            const [r, c] = pos.split(',').map(Number);
            this.grid[r][c] = -1;
        }
        
        // 计算数字
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === -1) continue;
                
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                            if (this.grid[nr][nc] === -1) count++;
                        }
                    }
                }
                this.grid[r][c] = count;
            }
        }
    }

    /**
     * 渲染游戏
     */
    render() {
        // 计算格子大小
        const maxWidth = Math.min(320, window.innerWidth - 40);
        const cellSize = Math.max(28, Math.floor(maxWidth / this.cols) - 4);
        
        this.container.innerHTML = `
            <div class="minesweeper">
                <div class="mine-header">
                    <div class="mine-info">
                        <span class="mine-icon">💣</span>
                        <span id="mineBombCount">${this.bombs}</span>
                    </div>
                    <div class="mine-info">
                        <span id="mineTimer">${this.timer}</span>
                        <span class="mine-icon">⏱</span>
                    </div>
                </div>
                
                <div class="mine-settings" id="mineSettings">
                    <div class="setting-row">
                        <label>行数: <span id="rowsValue">${this.rows}</span></label>
                        <input type="range" id="rowsSlider" min="5" max="16" value="${this.rows}">
                    </div>
                    <div class="setting-row">
                        <label>列数: <span id="colsValue">${this.cols}</span></label>
                        <input type="range" id="colsSlider" min="5" max="16" value="${this.cols}">
                    </div>
                    <div class="setting-row">
                        <label>炸弹: <span id="bombsValue">${this.bombs}</span></label>
                        <input type="range" id="bombsSlider" min="5" max="99" value="${this.bombs}">
                    </div>
                    <button class="start-btn" id="startBtn">开始游戏</button>
                </div>
                
                <div class="mine-grid-container" id="gridContainer" style="display: none;">
                    <div class="mine-grid" id="mineGrid" style="grid-template-columns: repeat(${this.cols}, ${cellSize}px);"></div>
                </div>
                
                <div class="mine-controls">
                    <button class="new-game-btn" id="newGameBtn">新游戏</button>
                    <button class="settings-btn" id="settingsBtn">设置</button>
                </div>
                
                <div class="game-overlay" id="gameOverlay" style="display: none;">
                    <h2 id="overlayTitle">游戏结束</h2>
                    <p id="overlayMessage"></p>
                    <button id="overlayBtn">再来一局</button>
                </div>
            </div>
        `;
        
        this.updateGridDisplay(cellSize);
        this.bindEvents();
        
        if (!this.firstClick && !this.gameOver && !this.gameWon) {
            document.getElementById('mineSettings').style.display = 'none';
            document.getElementById('gridContainer').style.display = 'block';
        }
    }

    /**
     * 更新格子显示
     */
    updateGridDisplay(cellSize) {
        const gridEl = document.getElementById('mineGrid');
        if (!gridEl) return;
        
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${cellSize * 0.5}px`;
                
                this.updateCell(cell, r, c);
                
                gridEl.appendChild(cell);
            }
        }
    }

    /**
     * 更新单个格子
     */
    updateCell(cell, row, col) {
        if (this.flagged[row][col]) {
            cell.textContent = '🚩';
            cell.className = 'mine-cell flagged';
        } else if (this.revealed[row][col]) {
            cell.className = 'mine-cell revealed';
            
            if (this.grid[row][col] === -1) {
                cell.textContent = '💣';
                cell.className = 'mine-cell bomb';
            } else if (this.grid[row][col] > 0) {
                cell.textContent = this.grid[row][col];
                cell.className = `mine-cell number-${this.grid[row][col]}`;
            } else {
                cell.textContent = '';
            }
        } else {
            cell.textContent = '';
            cell.className = 'mine-cell';
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 设置滑块
        const rowsSlider = document.getElementById('rowsSlider');
        const colsSlider = document.getElementById('colsSlider');
        const bombsSlider = document.getElementById('bombsSlider');
        
        rowsSlider.oninput = () => {
            document.getElementById('rowsValue').textContent = rowsSlider.value;
        };
        colsSlider.oninput = () => {
            document.getElementById('colsValue').textContent = colsSlider.value;
        };
        bombsSlider.oninput = () => {
            document.getElementById('bombsValue').textContent = bombsSlider.value;
        };
        
        // 开始按钮
        document.getElementById('startBtn').onclick = () => {
            const rows = parseInt(rowsSlider.value);
            const cols = parseInt(colsSlider.value);
            let bombs = parseInt(bombsSlider.value);
            
            // 限制炸弹数量
            const maxBombs = Math.floor(rows * cols * 0.6);
            if (bombs > maxBombs) bombs = maxBombs;
            
            this.resetGame(rows, cols, bombs);
        };
        
        // 格子点击
        const gridEl = document.getElementById('mineGrid');
        if (gridEl) {
            gridEl.onclick = (e) => {
                const cell = e.target.closest('.mine-cell');
                if (!cell || cell.classList.contains('revealed')) return;
                
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                this.handleClick(row, col);
            };
            
            // 长按标记
            let pressTimer;
            gridEl.oncontextmenu = (e) => {
                e.preventDefault();
                const cell = e.target.closest('.mine-cell');
                if (!cell || cell.classList.contains('revealed')) return;
                
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                this.toggleFlag(row, col);
            };
        }
        
        // 新游戏按钮
        document.getElementById('newGameBtn').onclick = () => {
            document.getElementById('mineSettings').style.display = 'flex';
            document.getElementById('gridContainer').style.display = 'none';
        };
        
        // 设置按钮
        document.getElementById('settingsBtn').onclick = () => {
            document.getElementById('mineSettings').style.display = 'flex';
            document.getElementById('gridContainer').style.display = 'none';
        };
        
        // 弹窗按钮
        document.getElementById('overlayBtn').onclick = () => {
            document.getElementById('gameOverlay').style.display = 'none';
            document.getElementById('mineSettings').style.display = 'flex';
            document.getElementById('gridContainer').style.display = 'none';
        };
    }

    /**
     * 处理点击
     */
    handleClick(row, col) {
        if (this.gameOver || this.gameWon || this.flagged[row][col]) return;
        
        // 第一次点击生成炸弹
        if (this.firstClick) {
            this.generateBombs(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        // 显示格子
        this.reveal(row, col);
        
        // 检查胜利
        if (this.checkWin()) {
            this.gameWon = true;
            this.stopTimer();
            this.showOverlay('🎉 恭喜胜利！', `用时 ${this.timer} 秒`);
        }
    }

    /**
     * 递归显示空格
     */
    reveal(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
        if (this.revealed[row][col] || this.flagged[row][col]) return;
        
        this.revealed[row][col] = true;
        
        if (this.grid[row][col] === -1) {
            // 踩到炸弹
            this.gameOver = true;
            this.stopTimer();
            this.revealAllBombs();
            this.showOverlay('💥 游戏结束', '踩到了炸弹！');
            return;
        }
        
        if (this.grid[row][col] === 0) {
            // 空格子，递归显示周围
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this.reveal(row + dr, col + dc);
                }
            }
        }
        
        this.updateGridDisplay();
    }

    /**
     * 切换标记
     */
    toggleFlag(row, col) {
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        
        const cellSize = 30;
        this.updateGridDisplay();
    }

    /**
     * 显示所有炸弹
     */
    revealAllBombs() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === -1) {
                    this.revealed[r][c] = true;
                }
            }
        }
        this.updateGridDisplay();
    }

    /**
     * 检查胜利
     */
    checkWin() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] !== -1 && !this.revealed[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 显示弹窗
     */
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('gameOverlay').style.display = 'flex';
    }

    /**
     * 开始计时器
     */
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            const timerEl = document.getElementById('mineTimer');
            if (timerEl) timerEl.textContent = this.timer;
        }, 1000);
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getSaveData() {
        return {
            rows: this.rows,
            cols: this.cols,
            bombs: this.bombs,
            timer: this.timer,
            timestamp: Date.now()
        };
    }

    loadSaveData(data) {
        if (data && data.rows && data.cols && data.bombs) {
            this.defaultRows = data.rows;
            this.defaultCols = data.cols;
            this.defaultBombs = data.bombs;
        }
    }

    destroy() {
        this.stopTimer();
        super.destroy();
    }
}

// 导出
window.GameMinesweeper = GameMinesweeper;