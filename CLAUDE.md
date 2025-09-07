# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 2D platformer character test built with HTML5 and Phaser 3, featuring character movement mechanics and a comprehensive hierarchical level editor system. The project has two main components:

1. **Platformer Game**: Character controller with advanced movement mechanics, shooting, and debug systems
2. **Level Editor**: Hierarchical grid-based level editor for rapid level creation and modular world building

## Technology Stack

- **Framework**: Phaser 3.70.0 (loaded via CDN)
- **Languages**: HTML5, JavaScript (ES6 classes), CSS3
- **Physics**: Arcade Physics (built into Phaser)
- **Sprites**: Procedurally generated colored rectangles (placeholder graphics)

## Running the Project

- **Main Game**: Open `index.html` in a web browser for the platformer game
- **Level Editor**: Open `level-editor.html` in a web browser for the level editor

No build process required - runs directly in browser.

## Project Architecture

### Game Classes

- **GameScene** (`js/game.js`): Main game scene, handles setup, collisions, and game loop
- **Player** (`js/player.js`): Character controller with all movement mechanics
- **Level** (`js/level.js`): Platform creation and level management
- **Target** (`js/target.js`): Shooting targets with health and particle effects

### Level Editor Classes

- **LevelEditor** (`js/level-editor.js`): Main hierarchical level editor controller with complete room blockout system

### Key Features Implemented

**Player Movement**:
- Left/Right movement with WASD or Arrow Keys
- Jumping with Space/W/Up Arrow
- Double jump mechanics
- Dash ability (X key) - versioned system with v1/v2 variants
- Sprint (Hold Shift) - versioned system with v1/v2 variants
- Crouch (S/Down Arrow) - visual feedback with tint, reduced hitbox
- Shooting (Z key)
- Coyote time and jump buffering for responsive controls

**Debug Menu System**:
- Real-time property adjustment via left sidebar
- Ability toggles (double jump, dash, sprint enable/disable)
- Version switching between v1/v2 implementations
- Property sliders with dynamic ranges based on selected version
- localStorage persistence (settings survive browser refresh)
- Mobile-responsive design (debug panel moves below game on small screens)

**Level Elements**:
- Static platforms
- Moving platforms (example included)
- Ground collision
- Multi-tier level design

**Shooting System**:
- Bullet physics
- Target destruction with health system
- Particle effects on hit
- Screen shake feedback

## Level Editor System (Room Blockout Mode)

### Overview
Complete hierarchical grid-based level editor implementing the first phase of a multi-scale editing system. Designed for rapid level prototyping with modular, reusable components.

### Grid Architecture
- **Room Grid**: 9x9 grid of cells (configurable)
- **Cell Size**: 8x5 tiles per cell (160x160 pixels at 32px tiles)  
- **Total Resolution**: 72x45 tiles (2304x1440 pixels)
- **Coordinate System**: Proper world coordinate transformations for zoom/pan

### Core Drawing System
- **Inverted Logic**: Cells start completely filled, drawing creates empty space
- **Tile States**: 0 = empty space, 1 = solid/filled, 2 = connection tiles
- **Star Pattern Brushes**: 
  - Size 1: 1 tile
  - Size 2: 5 tiles (plus/cross pattern)  
  - Size 3: 9 tiles (3x3 square)
  - Size 4: 13 tiles (3x3 + extensions)
  - Size 5: 25 tiles (5x5 square)
- **Brush Controls**: Slider + Ctrl+Scroll wheel for size adjustment
- **Brush Preview**: Real-time orange overlay showing affected tiles

### Drawing Modes
- **Blockout Mode**: Primary tool for carving empty spaces (left-click = empty, right-click = fill)
- **Room Connection Tile Mode**: Place yellow connection tiles on cell edges
- **Select Cell Mode**: Select, move, swap, and manipulate individual cells
- **Clone Mode**: Duplicate cell content to other positions

### Visual System
- **Active/Inactive Cells**: 
  - Active cells (modified): White background, visible content
  - Inactive cells (default): Light gray background, hidden content
- **Color Scheme**:
  - Grid lines: Dark gray (#999999)
  - Cell borders: Light blue (#4d9fff)  
  - Active cell background: White (#ffffff)
  - Inactive cell background: Light gray (#e8e8e8)
- **Zoom & Pan**: Mouse wheel zoom (0.1x-5.0x), middle-click pan, WASD/arrow keys
- **Visual Feedback**: Selected cell highlighting with orange borders and corner markers

### Cell Library System
- **Visual Shelf**: Horizontal thumbnail gallery below canvas
- **Drag-to-Save**: Drag selected cells to canvas drop zone (green area rendered on canvas)
- **Drag-to-Load**: Drag thumbnails from shelf to canvas to place cells
- **Cell Previews**: Mini canvas thumbnails showing actual cell content
- **Persistence**: localStorage-based storage survives browser refresh
- **Auto-Naming**: Timestamp-based cell names (cell-YYYY-MM-DD-HH-MM-SS)
- **Management**: Hover delete buttons, cell organization

### Room Management
- **Save/Load Rooms**: Complete room state with all cells and metadata
- **JSON Storage**: Human-readable room data format
- **Room Library**: Timestamped room storage with simple load interface

### Technical Implementation
- **Canvas Rendering**: HTML5 Canvas 2D with layered rendering system
- **Coordinate Systems**: Canvas → World → Tile → Cell coordinate transformations
- **Efficient Rendering**: Viewport culling, only renders visible elements
- **Data Structure**: Simple 2D arrays for tile data, Set for active cell tracking
- **Event System**: Mouse/keyboard interaction with proper drag handling
- **Memory Management**: Proper cleanup of canvas contexts and event listeners

## File Structure

```
├── index.html              # Main platformer game
├── level-editor.html       # Level editor interface
├── css/
│   └── style.css           # Game styling and UI
├── js/
│   ├── game.js            # Main game setup and scene
│   ├── player.js          # Character controller with versioned abilities
│   ├── level.js           # Platform and level management  
│   ├── target.js          # Shooting targets
│   ├── debug.js           # Debug menu controller and persistence
│   └── level-editor.js    # Complete hierarchical level editor system
├── assets/
│   ├── sprites/           # Future sprite assets
│   └── sounds/            # Future audio assets
├── vibe coding logs/      # Debug and implementation logs
│   ├── debug-menu-implementation-log.md
│   ├── ability-versioning-debug-log.md
│   └── [other debugging logs...]
├── nextsteps.md           # Long-term development roadmap
├── level-editor-progress.md # Current level editor status and next steps
└── .claude/               # Claude Code configuration
```

## Game Controls

- **Movement**: Arrow Keys or WASD
- **Jump**: Space, W, or Up Arrow  
- **Sprint**: Hold Shift while moving
- **Dash**: X key
- **Crouch**: S or Down Arrow (reduces speed, changes hitbox)
- **Shoot**: Z key

## Level Editor Controls

### Navigation
- **Pan**: WASD/Arrow Keys or Middle Mouse Button + Drag
- **Zoom**: Mouse Wheel (0.1x - 5.0x)
- **Brush Size**: Ctrl + Scroll Wheel or Slider (1-5)

### Drawing
- **Draw/Carve**: Left Click (creates empty space)
- **Fill**: Right Click (creates solid space)
- **Brush Preview**: Hover to see affected tiles

### Modes
- **Blockout Mode**: Primary drawing tool
- **Room Connection Tile**: Place yellow connection tiles
- **Select Cell Mode**: Click cell to select, click selected cell to drag
- **Clone Mode**: Duplicate cell content

### Cell Operations
- **Save Cell**: Drag selected cell to green drop zone
- **Load Cell**: Drag thumbnail from shelf to canvas
- **Delete Cell**: Hover thumbnail → click red × button
- **Cell Management**: Clear Cell, Fill Cell buttons when cell selected

## Extending the Game

**Adding Real Sprites**:
1. Place image files in `assets/sprites/`
2. Load them in `GameScene.preload()`
3. Replace procedural graphics with sprite references

**Adding New Platforms**:
- Use `Level.addPlatform(x, y)` for static platforms
- Use `Level.addMovingPlatform(startX, startY, endX, endY, speed)` for moving ones

**Adding New Mechanics**:
- Player abilities: Extend `Player.handleInput()` 
- Level elements: Add to `Level.createLevel()`
- Enemies: Create new class similar to `Target`

## Extending the Level Editor

**Adding New Drawing Tools**:
- Extend `getBrushTiles()` method for new brush patterns
- Add new drawing modes in `setMode()` method
- Create new UI buttons and event listeners in `setupUI()`

**Adding New Cell Operations**:
- Extend cell manipulation methods (`clearSelectedCell()`, `fillSelectedCell()`)
- Add new cell library operations in cell shelf system
- Create new thumbnail rendering options in `renderCellPreview()`

**Expanding Grid System**:
- Modify grid dimensions in constructor (currently 9x9 cells, 8x5 tiles per cell)
- Adjust rendering system for different scales
- Update coordinate transformation calculations

## Level Editor Development Roadmap

**Current Status**: Room Blockout Mode (Phase 1) - Complete ✅
- Hierarchical grid system with cell-based editing
- Complete drawing tools with star pattern brushes
- Visual cell library with drag-and-drop functionality
- Room save/load system with localStorage persistence

**Next Phase**: Detailed Room Editor (Phase 2)  
- 16x10 tile resolution per cell for detailed editing
- Seamless zoom from room level to tile level
- Tile-level refinement tools and precise drawing
- Integration with existing room blockout system

**Future Phases**: World Editor (Phase 3)
- Multi-room world composition system
- World map navigation and room connections  
- Complete level generation for game integration
- Advanced tools and workflow optimization

**Reference Files**:
- `nextsteps.md`: Comprehensive development roadmap and technical architecture
- `level-editor-progress.md`: Current implementation status and immediate next steps

## Debug Menu Usage

**Accessing Debug Controls**:
- Debug panel appears on left side of screen (desktop) or below game (mobile)
- All changes save automatically to localStorage
- Settings persist across browser sessions

**Version System**:
- Dash v1: Original implementation (600 speed, 300ms duration, 1000ms cooldown)
- Dash v2: Experimental implementation (500 speed, 200ms duration, 800ms cooldown)
- Sprint v1: Original implementation (320 speed)
- Sprint v2: Experimental implementation (280 speed)

**Property Ranges**:
- Movement Speed: 50-300
- Jump Velocity: 200-700
- Coyote Time: 50-300ms
- Jump Buffer: 50-300ms
- Dash/Sprint properties have version-specific ranges

## Development Workflow - Debugging Logs

**When creating debug logs, follow the established format in `vibe coding logs/`:**

1. **Problem Description**: Clear statement of what needs to be solved
2. **Attempted Solutions**: Chronological list with code examples
3. **Result Indicators**: Use ❌ for failures, ✅ for successes  
4. **Problem/Discovery Notes**: Explain why things failed or what was learned
5. **Final Working Solution**: Clearly marked complete implementation
6. **Key Learnings**: Summary of important insights for future work

**Log File Naming**:
- `[feature-name]-implementation-log.md` for development processes
- `[system-name]-debug-log.md` for troubleshooting specific issues
- Focus on the problem-solving journey, not just final documentation

This format helps track the actual development process and reasoning behind implementation decisions.