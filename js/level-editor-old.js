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
        
        // Library browser state
        this.selectedGridName = null;
        
        // Initialize
        this.initializeTileData();
        this.setupEventListeners();
        this.setupUI();
        this.render();
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
        document.getElementById('testGrid').addEventListener('click', () => this.testGrid());
        
        // Border controls
        document.getElementById('showBorders').addEventListener('change', (e) => {
            this.showBorders = e.target.checked;
            this.render();
        });
        
        document.getElementById('borderColor').addEventListener('change', (e) => {
            this.borderColor = e.target.value;
            this.render();
        });
        
        // Grid library buttons
        document.getElementById('saveGrid').addEventListener('click', () => this.saveGrid());
        document.getElementById('showLibrary').addEventListener('click', () => this.showLibraryBrowser());
        document.getElementById('savedGrids').addEventListener('change', (e) => this.selectSavedGrid(e));
        
        // Library browser events
        document.getElementById('closeLibrary').addEventListener('click', () => this.hideLibraryBrowser());
        document.getElementById('deleteSelected').addEventListener('click', () => this.deleteSelectedCell());
        document.getElementById('duplicateSelected').addEventListener('click', () => this.duplicateSelectedCell());
        
        // Modal background click to close
        document.getElementById('libraryModal').addEventListener('click', (e) => {
            if (e.target.id === 'libraryModal') {
                this.hideLibraryBrowser();
            }
        });
        
        // Export/Import buttons
        document.getElementById('exportGrid').addEventListener('click', () => this.exportGrid());
        document.getElementById('importGrid').addEventListener('change', (e) => this.importGrid(e));
        
        // Load saved data
        this.loadGridsList();
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
    
    testGrid() {
        // For now, just log the grid data - will integrate with game later
        console.log('Testing multi-cell grid:', {
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            totalWidth: this.totalWidth,
            totalHeight: this.totalHeight,
            tileSize: this.tileSize,
            data: this.tileData
        });
        alert('Grid data logged to console. Integration with game coming in next phase!');
    }
    
    saveGrid() {
        const gridName = document.getElementById('gridName').value.trim();
        if (!gridName) {
            alert('Please enter a grid name');
            return;
        }
        
        const gridData = {
            name: gridName,
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            totalWidth: this.totalWidth,
            totalHeight: this.totalHeight,
            tileSize: this.tileSize,
            tileData: JSON.parse(JSON.stringify(this.tileData)), // Deep copy
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedGrids = JSON.parse(localStorage.getItem('levelEditorGrids') || '{}');
        savedGrids[gridName] = gridData;
        localStorage.setItem('levelEditorGrids', JSON.stringify(savedGrids));
        
        // Update UI
        this.loadGridsList();
        document.getElementById('gridName').value = '';
        
        console.log('Grid saved:', gridName);
    }
    
    selectSavedGrid(e) {
        // Auto-load when selecting from dropdown
        if (e.target.value) {
            this.loadGrid();
        }
    }
    
    loadGrid() {
        const selectedGrid = document.getElementById('savedGrids').value;
        if (!selectedGrid) {
            alert('Please select a grid to load');
            return;
        }
        
        const savedGrids = JSON.parse(localStorage.getItem('levelEditorGrids') || '{}');
        const gridData = savedGrids[selectedGrid];
        
        if (!gridData) {
            alert('Grid not found');
            return;
        }
        
        // Load grid data
        this.gridCols = gridData.gridCols || 3;
        this.gridRows = gridData.gridRows || 3;
        this.cellWidth = gridData.cellWidth || 16;
        this.cellHeight = gridData.cellHeight || 10;
        this.tileSize = gridData.tileSize || 32;
        this.totalWidth = gridData.totalWidth || (this.gridCols * this.cellWidth);
        this.totalHeight = gridData.totalHeight || (this.gridRows * this.cellHeight);
        this.tileData = gridData.tileData;
        
        // Update UI controls
        document.getElementById('gridCols').value = this.gridCols;
        document.getElementById('gridRows').value = this.gridRows;
        document.getElementById('cellWidth').value = this.cellWidth;
        document.getElementById('cellHeight').value = this.cellHeight;
        document.getElementById('tilePixelSize').value = this.tileSize;
        document.getElementById('gridColsValue').textContent = this.gridCols;
        document.getElementById('gridRowsValue').textContent = this.gridRows;
        document.getElementById('cellWidthValue').textContent = this.cellWidth;
        document.getElementById('cellHeightValue').textContent = this.cellHeight;
        document.getElementById('tileSizeValue').textContent = this.tileSize;
        
        // Update canvas and render
        this.updateCanvasSize();
        
        console.log('Grid loaded:', selectedGrid);
    }
    
    loadGridsList() {
        const savedGrids = JSON.parse(localStorage.getItem('levelEditorGrids') || '{}');
        const select = document.getElementById('savedGrids');
        
        // Clear existing options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add saved grids
        Object.keys(savedGrids).sort().forEach(gridName => {
            const gridData = savedGrids[gridName];
            const option = document.createElement('option');
            option.value = gridName;
            option.textContent = `${gridName} (${gridData.gridCols || 3}x${gridData.gridRows || 3})`;
            select.appendChild(option);
        });
    }
    
    exportGrid() {
        const gridName = prompt('Enter name for export:') || 'unnamed_grid';
        const gridData = {
            name: gridName,
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            totalWidth: this.totalWidth,
            totalHeight: this.totalHeight,
            tileSize: this.tileSize,
            tileData: this.tileData,
            timestamp: new Date().toISOString(),
            version: '2.0',
            type: 'multi-cell-grid'
        };
        
        const dataStr = JSON.stringify(gridData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${gridName}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }
    
    importGrid(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const gridData = JSON.parse(event.target.result);
                
                // Validate grid data structure
                if (!gridData.tileData) {
                    throw new Error('Invalid grid data format - missing tileData');
                }
                
                // Load the grid
                this.gridCols = gridData.gridCols || 3;
                this.gridRows = gridData.gridRows || 3;
                this.cellWidth = gridData.cellWidth || 16;
                this.cellHeight = gridData.cellHeight || 10;
                this.tileSize = gridData.tileSize || 32;
                this.totalWidth = gridData.totalWidth || (this.gridCols * this.cellWidth);
                this.totalHeight = gridData.totalHeight || (this.gridRows * this.cellHeight);
                this.tileData = gridData.tileData;
                
                // Update UI
                document.getElementById('gridCols').value = this.gridCols;
                document.getElementById('gridRows').value = this.gridRows;
                document.getElementById('cellWidth').value = this.cellWidth;
                document.getElementById('cellHeight').value = this.cellHeight;
                document.getElementById('tilePixelSize').value = this.tileSize;
                document.getElementById('gridColsValue').textContent = this.gridCols;
                document.getElementById('gridRowsValue').textContent = this.gridRows;
                document.getElementById('cellWidthValue').textContent = this.cellWidth;
                document.getElementById('cellHeightValue').textContent = this.cellHeight;
                document.getElementById('tileSizeValue').textContent = this.tileSize;
                
                this.updateCanvasSize();
                
                console.log('Grid imported:', gridData.name);
                
            } catch (error) {
                alert('Error importing grid: ' + error.message);
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = '';
    }
    
    // Library Browser Methods (simplified - will keep old cell library browser for now)
    showLibraryBrowser() {
        
        this.currentView = viewName;
        
        // Update view buttons
        document.querySelectorAll('.view-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(viewName + 'ViewBtn').classList.add('active');
        
        // Show/hide view content
        document.getElementById('cellView').style.display = viewName === 'cell' ? 'block' : 'none';
        document.getElementById('worldView').style.display = viewName === 'world' ? 'block' : 'none';
        
        // Show/hide controls
        document.getElementById('cellControls').style.display = viewName === 'cell' ? 'block' : 'none';
        document.getElementById('worldControls').style.display = viewName === 'world' ? 'block' : 'none';
        
        // Render appropriate canvas
        if (viewName === 'world') {
            this.renderWorldGrid();
        } else {
            this.render();
        }
    }
    
    // World Grid Methods
    handleWorldClick(e) {
        const rect = this.worldCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridX = Math.floor(x / this.worldCellSize);
        const gridY = Math.floor(y / this.worldCellSize);
        
        // Bounds check
        if (gridX < 0 || gridX >= this.worldGridSize || gridY < 0 || gridY >= this.worldGridSize) {
            return;
        }
        
        // If we have a library cell selected, place it
        if (this.selectedLibraryCell) {
            this.worldGrid[gridY][gridX] = this.selectedLibraryCell;
            this.renderWorldGrid();
            this.selectedLibraryCell = null;
            this.updateQuickLibrarySelection();
        } else {
            // Select this world cell
            this.selectedWorldPos = { x: gridX, y: gridY };
            this.updateSelectedWorldCell();
            this.renderWorldGrid();
        }
    }
    
    renderWorldGrid() {
        // Clear canvas
        this.worldCtx.clearRect(0, 0, this.worldCanvas.width, this.worldCanvas.height);
        
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        
        // Render world cells
        for (let y = 0; y < this.worldGridSize; y++) {
            for (let x = 0; x < this.worldGridSize; x++) {
                const pixelX = x * this.worldCellSize;
                const pixelY = y * this.worldCellSize;
                
                // Draw cell background
                this.worldCtx.fillStyle = '#ffffff';
                this.worldCtx.fillRect(pixelX, pixelY, this.worldCellSize, this.worldCellSize);
                
                // Draw cell content if exists
                const cellName = this.worldGrid[y][x];
                if (cellName && savedCells[cellName]) {
                    this.renderCellToWorldCanvas(pixelX, pixelY, this.worldCellSize, savedCells[cellName]);
                }
                
                // Highlight selected cell
                if (this.selectedWorldPos && this.selectedWorldPos.x === x && this.selectedWorldPos.y === y) {
                    this.worldCtx.strokeStyle = '#FF9800';
                    this.worldCtx.lineWidth = 3;
                    this.worldCtx.strokeRect(pixelX, pixelY, this.worldCellSize, this.worldCellSize);
                }
            }
        }
        
        // Draw world grid
        this.drawWorldGrid();
    }
    
    renderCellToWorldCanvas(pixelX, pixelY, size, cellData) {
        const tileWidth = size / cellData.width;
        const tileHeight = size / cellData.height;
        
        // Render tiles
        for (let y = 0; y < cellData.height; y++) {
            for (let x = 0; x < cellData.width; x++) {
                const tileValue = cellData.tileData[y][x];
                if (tileValue === 1) {
                    this.worldCtx.fillStyle = '#000000';
                    this.worldCtx.fillRect(
                        pixelX + x * tileWidth, 
                        pixelY + y * tileHeight, 
                        tileWidth, 
                        tileHeight
                    );
                }
            }
        }
    }
    
    drawWorldGrid() {
        this.worldCtx.strokeStyle = '#cccccc';
        this.worldCtx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.worldGridSize; x++) {
            const pixelX = x * this.worldCellSize;
            this.worldCtx.beginPath();
            this.worldCtx.moveTo(pixelX, 0);
            this.worldCtx.lineTo(pixelX, this.worldCanvas.height);
            this.worldCtx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.worldGridSize; y++) {
            const pixelY = y * this.worldCellSize;
            this.worldCtx.beginPath();
            this.worldCtx.moveTo(0, pixelY);
            this.worldCtx.lineTo(this.worldCanvas.width, pixelY);
            this.worldCtx.stroke();
        }
    }
    
    updateSelectedWorldCell() {
        const info = document.getElementById('selectedWorldCell');
        const removeBtn = document.getElementById('removeWorldCell');
        
        if (this.selectedWorldPos) {
            const cellName = this.worldGrid[this.selectedWorldPos.y][this.selectedWorldPos.x];
            if (cellName) {
                info.textContent = `Selected: ${cellName} at (${this.selectedWorldPos.x},${this.selectedWorldPos.y})`;
                removeBtn.disabled = false;
            } else {
                info.textContent = `Selected: Empty cell at (${this.selectedWorldPos.x},${this.selectedWorldPos.y})`;
                removeBtn.disabled = true;
            }
        } else {
            info.textContent = 'Selected: None';
            removeBtn.disabled = true;
        }
    }
    
    clearWorld() {
        if (!confirm('Are you sure you want to clear the entire world grid?')) {
            return;
        }
        
        this.initializeWorldGrid();
        this.selectedWorldPos = null;
        this.updateSelectedWorldCell();
        this.renderWorldGrid();
    }
    
    removeWorldCell() {
        if (!this.selectedWorldPos) return;
        
        this.worldGrid[this.selectedWorldPos.y][this.selectedWorldPos.x] = null;
        this.updateSelectedWorldCell();
        this.renderWorldGrid();
    }
    
    refreshQuickLibrary() {
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        const quickLibrary = document.getElementById('quickLibrary');
        
        // Clear existing
        quickLibrary.innerHTML = '';
        
        if (Object.keys(savedCells).length === 0) {
            quickLibrary.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px; font-size: 12px;">No cells available<br>Create cells in Cell Editor first</div>';
            return;
        }
        
        // Create quick access thumbnails
        Object.entries(savedCells).forEach(([cellName, cellData]) => {
            const quickCell = this.createQuickCell(cellName, cellData);
            quickLibrary.appendChild(quickCell);
        });
    }
    
    createQuickCell(cellName, cellData) {
        const quickCell = document.createElement('div');
        quickCell.className = 'quick-cell';
        quickCell.dataset.cellName = cellName;
        
        // Create mini thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        
        this.renderCellToCanvas(canvas, cellData);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'quick-cell-name';
        nameDiv.textContent = cellName;
        
        quickCell.appendChild(canvas);
        quickCell.appendChild(nameDiv);
        
        quickCell.addEventListener('click', () => {
            this.selectedLibraryCell = cellName;
            this.updateQuickLibrarySelection();
        });
        
        return quickCell;
    }
    
    updateQuickLibrarySelection() {
        document.querySelectorAll('.quick-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        if (this.selectedLibraryCell) {
            const selectedCell = document.querySelector(`[data-cell-name="${this.selectedLibraryCell}"]`);
            if (selectedCell && selectedCell.classList.contains('quick-cell')) {
                selectedCell.classList.add('selected');
            }
        }
    }
    
    saveWorld() {
        const worldName = document.getElementById('worldName').value.trim();
        if (!worldName) {
            alert('Please enter a world name');
            return;
        }
        
        const worldData = {
            name: worldName,
            size: this.worldGridSize,
            grid: JSON.parse(JSON.stringify(this.worldGrid)), // Deep copy
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedWorlds = JSON.parse(localStorage.getItem('levelEditorWorlds') || '{}');
        savedWorlds[worldName] = worldData;
        localStorage.setItem('levelEditorWorlds', JSON.stringify(savedWorlds));
        
        // Update UI
        this.loadWorldsList();
        document.getElementById('worldName').value = '';
        
        console.log('World saved:', worldName);
    }
    
    loadWorld() {
        const selectedWorld = document.getElementById('savedWorlds').value;
        if (!selectedWorld) {
            alert('Please select a world to load');
            return;
        }
        
        const savedWorlds = JSON.parse(localStorage.getItem('levelEditorWorlds') || '{}');
        const worldData = savedWorlds[selectedWorld];
        
        if (!worldData) {
            alert('World not found');
            return;
        }
        
        // Load world data
        this.worldGrid = worldData.grid;
        this.selectedWorldPos = null;
        
        // Update UI and render
        this.updateSelectedWorldCell();
        this.renderWorldGrid();
        
        console.log('World loaded:', selectedWorld);
    }
    
    loadWorldsList() {
        const savedWorlds = JSON.parse(localStorage.getItem('levelEditorWorlds') || '{}');
        const select = document.getElementById('savedWorlds');
        
        // Clear existing options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add saved worlds
        Object.keys(savedWorlds).sort().forEach(worldName => {
            const option = document.createElement('option');
            option.value = worldName;
            option.textContent = worldName;
            select.appendChild(option);
        });
    }
    
    testWorld() {
        alert('World testing will integrate with the main game in a future update!');
    }
    
    generateLevel() {
        const levelData = {
            worldGrid: this.worldGrid,
            cellLibrary: JSON.parse(localStorage.getItem('levelEditorCells') || '{}')
        };
        
        console.log('Generated level data:', levelData);
        alert('Level data generated and logged to console!');
    }
    
    // Library Browser Methods
    showLibraryBrowser() {
        this.renderLibraryGrid();
        document.getElementById('libraryModal').style.display = 'block';
    }
    
    hideLibraryBrowser() {
        document.getElementById('libraryModal').style.display = 'none';
        this.selectedCellName = null;
        this.updateLibraryButtons();
    }
    
    renderLibraryGrid() {
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        const gridContainer = document.getElementById('libraryGrid');
        
        // Clear existing thumbnails
        gridContainer.innerHTML = '';
        
        if (Object.keys(savedCells).length === 0) {
            gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">No saved cells. Create and save some cells to see them here!</div>';
            return;
        }
        
        // Create thumbnails for each cell
        Object.entries(savedCells).forEach(([cellName, cellData]) => {
            const thumbnail = this.createCellThumbnail(cellName, cellData);
            gridContainer.appendChild(thumbnail);
        });
    }
    
    createCellThumbnail(cellName, cellData) {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'cell-thumbnail';
        thumbnailDiv.dataset.cellName = cellName;
        
        // Create thumbnail canvas
        const canvas = document.createElement('canvas');
        const maxThumbnailSize = 120;
        const aspectRatio = cellData.width / cellData.height;
        
        if (aspectRatio > 1) {
            // Wider than tall
            canvas.width = maxThumbnailSize;
            canvas.height = maxThumbnailSize / aspectRatio;
        } else {
            // Taller than wide (or square)
            canvas.width = maxThumbnailSize * aspectRatio;
            canvas.height = maxThumbnailSize;
        }
        
        // Render cell to thumbnail
        this.renderCellToCanvas(canvas, cellData);
        
        // Create info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'cell-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'cell-name';
        nameDiv.textContent = cellName;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'cell-details';
        detailsDiv.textContent = `${cellData.width}×${cellData.height} tiles`;
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(detailsDiv);
        
        // Add timestamp if available
        if (cellData.timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'cell-details';
            timeDiv.textContent = new Date(cellData.timestamp).toLocaleDateString();
            infoDiv.appendChild(timeDiv);
        }
        
        thumbnailDiv.appendChild(canvas);
        thumbnailDiv.appendChild(infoDiv);
        
        // Add event listeners
        thumbnailDiv.addEventListener('click', () => this.selectCellThumbnail(cellName));
        thumbnailDiv.addEventListener('dblclick', () => this.loadCellFromThumbnail(cellName));
        
        return thumbnailDiv;
    }
    
    renderCellToCanvas(canvas, cellData) {
        const ctx = canvas.getContext('2d');
        const tileWidth = canvas.width / cellData.width;
        const tileHeight = canvas.height / cellData.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render tiles
        for (let y = 0; y < cellData.height; y++) {
            for (let x = 0; x < cellData.width; x++) {
                const tileValue = cellData.tileData[y][x];
                ctx.fillStyle = tileValue === 1 ? '#000000' : '#ffffff';
                ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            }
        }
        
        // Draw border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw subtle grid for empty thumbnails
        if (this.isCellEmpty(cellData)) {
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 0.5;
            for (let x = 1; x < cellData.width; x++) {
                ctx.beginPath();
                ctx.moveTo(x * tileWidth, 0);
                ctx.lineTo(x * tileWidth, canvas.height);
                ctx.stroke();
            }
            for (let y = 1; y < cellData.height; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * tileHeight);
                ctx.lineTo(canvas.width, y * tileHeight);
                ctx.stroke();
            }
        }
    }
    
    isCellEmpty(cellData) {
        for (let y = 0; y < cellData.height; y++) {
            for (let x = 0; x < cellData.width; x++) {
                if (cellData.tileData[y][x] === 1) {
                    return false;
                }
            }
        }
        return true;
    }
    
    selectCellThumbnail(cellName) {
        // Remove previous selection
        document.querySelectorAll('.cell-thumbnail').forEach(thumb => {
            thumb.classList.remove('selected');
        });
        
        // Select current thumbnail
        const thumbnail = document.querySelector(`[data-cell-name="${cellName}"]`);
        if (thumbnail) {
            thumbnail.classList.add('selected');
            this.selectedCellName = cellName;
        }
        
        this.updateLibraryButtons();
    }
    
    loadCellFromThumbnail(cellName) {
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        const cellData = savedCells[cellName];
        
        if (!cellData) {
            alert('Cell not found');
            return;
        }
        
        // Load the cell data
        this.cellWidth = cellData.width;
        this.cellHeight = cellData.height;
        this.tileSize = cellData.tileSize || 32;
        this.tileData = cellData.tileData;
        
        // Update UI controls
        document.getElementById('cellWidth').value = this.cellWidth;
        document.getElementById('cellHeight').value = this.cellHeight;
        document.getElementById('tilePixelSize').value = this.tileSize;
        document.getElementById('cellWidthValue').textContent = this.cellWidth;
        document.getElementById('cellHeightValue').textContent = this.cellHeight;
        document.getElementById('tileSizeValue').textContent = this.tileSize;
        
        // Update canvas and render
        this.updateCanvasSize();
        
        // Close library browser
        this.hideLibraryBrowser();
        
        console.log('Cell loaded from thumbnail:', cellName);
    }
    
    updateLibraryButtons() {
        const deleteBtn = document.getElementById('deleteSelected');
        const duplicateBtn = document.getElementById('duplicateSelected');
        
        const hasSelection = this.selectedCellName !== null;
        deleteBtn.disabled = !hasSelection;
        duplicateBtn.disabled = !hasSelection;
    }
    
    deleteSelectedCell() {
        if (!this.selectedCellName) return;
        
        if (!confirm(`Are you sure you want to delete the cell "${this.selectedCellName}"?`)) {
            return;
        }
        
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        delete savedCells[this.selectedCellName];
        localStorage.setItem('levelEditorCells', JSON.stringify(savedCells));
        
        // Update UI
        this.loadCellsList();
        this.renderLibraryGrid();
        this.selectedCellName = null;
        this.updateLibraryButtons();
        
        console.log('Cell deleted:', this.selectedCellName);
    }
    
    duplicateSelectedCell() {
        if (!this.selectedCellName) return;
        
        const newName = prompt(`Enter name for duplicate of "${this.selectedCellName}":`, `${this.selectedCellName}_copy`);
        if (!newName || newName.trim() === '') return;
        
        const savedCells = JSON.parse(localStorage.getItem('levelEditorCells') || '{}');
        const originalCell = savedCells[this.selectedCellName];
        
        if (!originalCell) {
            alert('Original cell not found');
            return;
        }
        
        // Create duplicate with new name and timestamp
        const duplicateCell = {
            ...originalCell,
            name: newName.trim(),
            timestamp: new Date().toISOString()
        };
        
        savedCells[newName.trim()] = duplicateCell;
        localStorage.setItem('levelEditorCells', JSON.stringify(savedCells));
        
        // Update UI
        this.loadCellsList();
        this.renderLibraryGrid();
        
        console.log('Cell duplicated:', this.selectedCellName, '→', newName.trim());
    }
}

// Initialize the editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.levelEditor = new LevelEditor();
});