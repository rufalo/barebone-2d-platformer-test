class LevelEditor {
    constructor() {
        this.canvas = document.getElementById('tileCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Multi-cell grid configuration
        this.gridCols = 3;        // Number of cells horizontally
        this.gridRows = 3;        // Number of cells vertically
        this.cellWidth = 16;      // Tiles per cell width
        this.cellHeight = 10;     // Tiles per cell height
        this.tileSize = 32;       // Pixels per tile
        
        // Total dimensions
        this.totalWidth = this.gridCols * this.cellWidth;   // 48 tiles
        this.totalHeight = this.gridRows * this.cellHeight;  // 30 tiles
        
        // Multi-cell tile data - 2D array (0 = empty, 1 = filled)
        this.tileData = [];
        
        // Drawing state
        this.currentTool = 'toggle';
        this.isDrawing = false;
        this.lastDrawnTile = null;
        
        // Visual settings
        this.showBorders = true;
        this.borderColor = '#0066CC';
        
        // Initialize
        this.initializeTileData();
        this.setupEventListeners();
        this.setupUI();
        this.updateCanvasSize();
    }
    
    initializeTileData() {
        this.tileData = [];
        for (let y = 0; y < this.totalHeight; y++) {
            this.tileData[y] = [];
            for (let x = 0; x < this.totalWidth; x++) {
                this.tileData[y][x] = 0; // 0 = empty, 1 = filled
            }
        }
    }
    
    updateCanvasSize() {
        this.totalWidth = this.gridCols * this.cellWidth;
        this.totalHeight = this.gridRows * this.cellHeight;
        
        this.canvas.width = this.totalWidth * this.tileSize;
        this.canvas.height = this.totalHeight * this.tileSize;
        
        // Update UI info
        document.getElementById('gridSize').textContent = `${this.gridCols}x${this.gridRows}`;
        document.getElementById('cellSize').textContent = `${this.cellWidth}x${this.cellHeight}`;
        document.getElementById('totalSize').textContent = `${this.totalWidth}x${this.totalHeight}`;
        document.getElementById('tileSize').textContent = `${this.tileSize}x${this.tileSize}`;
        
        this.render();
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    setupUI() {
        // Grid dimension controls
        const gridColsSlider = document.getElementById('gridCols');
        const gridRowsSlider = document.getElementById('gridRows');
        const cellWidthSlider = document.getElementById('cellWidth');
        const cellHeightSlider = document.getElementById('cellHeight');
        const tileSizeSlider = document.getElementById('tilePixelSize');
        
        gridColsSlider.addEventListener('input', (e) => {
            this.gridCols = parseInt(e.target.value);
            document.getElementById('gridColsValue').textContent = this.gridCols;
            this.initializeTileData();
            this.updateCanvasSize();
        });
        
        gridRowsSlider.addEventListener('input', (e) => {
            this.gridRows = parseInt(e.target.value);
            document.getElementById('gridRowsValue').textContent = this.gridRows;
            this.initializeTileData();
            this.updateCanvasSize();
        });
        
        cellWidthSlider.addEventListener('input', (e) => {
            this.cellWidth = parseInt(e.target.value);
            document.getElementById('cellWidthValue').textContent = this.cellWidth;
            this.initializeTileData();
            this.updateCanvasSize();
        });
        
        cellHeightSlider.addEventListener('input', (e) => {
            this.cellHeight = parseInt(e.target.value);
            document.getElementById('cellHeightValue').textContent = this.cellHeight;
            this.initializeTileData();
            this.updateCanvasSize();
        });
        
        tileSizeSlider.addEventListener('input', (e) => {
            this.tileSize = parseInt(e.target.value);
            document.getElementById('tileSizeValue').textContent = this.tileSize;
            this.updateCanvasSize();
        });
        
        // Tool buttons
        document.getElementById('toggleTool').addEventListener('click', () => this.setTool('toggle'));
        document.getElementById('drawTool').addEventListener('click', () => this.setTool('draw'));
        document.getElementById('eraseTool').addEventListener('click', () => this.setTool('erase'));
        
        // Grid action buttons
        document.getElementById('clearGrid').addEventListener('click', () => this.clearGrid());
        document.getElementById('fillGrid').addEventListener('click', () => this.fillGrid());
        
        // Border controls
        document.getElementById('showBorders').addEventListener('change', (e) => {
            this.showBorders = e.target.checked;
            this.render();
        });
        
        document.getElementById('borderColor').addEventListener('change', (e) => {
            this.borderColor = e.target.value;
            this.render();
        });
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        // Update button states
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + 'Tool').classList.add('active');
        
        // Update cursor
        switch(tool) {
            case 'toggle':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'draw':
                this.canvas.style.cursor = 'cell';
                break;
            case 'erase':
                this.canvas.style.cursor = 'not-allowed';
                break;
        }
    }
    
    getTileFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        // Bounds check
        if (tileX < 0 || tileX >= this.totalWidth || tileY < 0 || tileY >= this.totalHeight) {
            return null;
        }
        
        return { x: tileX, y: tileY };
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.isDrawing = true;
        this.lastDrawnTile = null;
        this.handleTileInteraction(e);
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        this.handleTileInteraction(e);
    }
    
    handleMouseUp(e) {
        this.isDrawing = false;
        this.lastDrawnTile = null;
    }
    
    handleTileInteraction(e) {
        const tile = this.getTileFromMouse(e);
        if (!tile) return;
        
        // Prevent drawing on the same tile multiple times during drag
        if (this.lastDrawnTile && 
            this.lastDrawnTile.x === tile.x && 
            this.lastDrawnTile.y === tile.y) {
            return;
        }
        
        this.lastDrawnTile = tile;
        
        switch (this.currentTool) {
            case 'toggle':
                this.tileData[tile.y][tile.x] = this.tileData[tile.y][tile.x] === 0 ? 1 : 0;
                break;
            case 'draw':
                this.tileData[tile.y][tile.x] = 1;
                break;
            case 'erase':
                this.tileData[tile.y][tile.x] = 0;
                break;
        }
        
        this.renderTile(tile.x, tile.y);
        
        // Redraw cell borders if needed
        if (this.showBorders) {
            this.drawCellBorders();
        }
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseDown(mouseEvent);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseMove(mouseEvent);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all tiles
        for (let y = 0; y < this.totalHeight; y++) {
            for (let x = 0; x < this.totalWidth; x++) {
                this.renderTile(x, y);
            }
        }
        
        // Draw tile grid lines
        this.drawGrid();
        
        // Draw cell borders if enabled
        if (this.showBorders) {
            this.drawCellBorders();
        }
    }
    
    renderTile(x, y) {
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;
        
        // Fill tile
        this.ctx.fillStyle = this.tileData[y][x] === 1 ? '#000000' : '#ffffff';
        this.ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);
        
        // Redraw grid lines for this tile
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, this.tileSize, this.tileSize);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.totalWidth; x++) {
            const pixelX = x * this.tileSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.totalHeight; y++) {
            const pixelY = y * this.tileSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(this.canvas.width, pixelY);
            this.ctx.stroke();
        }
    }
    
    drawCellBorders() {
        this.ctx.strokeStyle = this.borderColor;
        this.ctx.lineWidth = 3;
        
        // Draw cell boundaries
        for (let cellY = 0; cellY <= this.gridRows; cellY++) {
            for (let cellX = 0; cellX <= this.gridCols; cellX++) {
                const pixelX = cellX * this.cellWidth * this.tileSize;
                const pixelY = cellY * this.cellHeight * this.tileSize;
                
                // Vertical lines
                if (cellX <= this.gridCols) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(pixelX, 0);
                    this.ctx.lineTo(pixelX, this.canvas.height);
                    this.ctx.stroke();
                }
                
                // Horizontal lines
                if (cellY <= this.gridRows) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, pixelY);
                    this.ctx.lineTo(this.canvas.width, pixelY);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    clearGrid() {
        for (let y = 0; y < this.totalHeight; y++) {
            for (let x = 0; x < this.totalWidth; x++) {
                this.tileData[y][x] = 0;
            }
        }
        this.render();
    }
    
    fillGrid() {
        for (let y = 0; y < this.totalHeight; y++) {
            for (let x = 0; x < this.totalWidth; x++) {
                this.tileData[y][x] = 1;
            }
        }
        this.render();
    }
    
}

// Initialize the editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.levelEditor = new LevelEditor();
});