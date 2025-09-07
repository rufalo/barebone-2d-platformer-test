# 2D Platformer Game & Level Editor

A comprehensive 2D platformer project built with HTML5 and Phaser 3, featuring advanced character mechanics and a complete hierarchical level editor system for rapid level creation.

## 🎮 **[PLAY THE GAME HERE](https://rufalo.github.io/barebone-2d-platformer-test/)**

*Click the link above to play the game directly in your browser - no downloads required!*

## 🎮 Game Features

### Player Mechanics
- **Movement**: WASD or Arrow Keys for left/right movement
- **Jumping**: Space, W, or Up Arrow with double jump capability
- **Sprint**: Hold Shift while moving for increased speed
- **Dash**: X key for quick horizontal movement with cooldown
- **Crouch**: S or Down Arrow (reduces speed, changes hitbox)
- **Shooting**: Z key for projectile attacks
- **Advanced Movement**: Coyote time and jump buffering for responsive controls

### Level Elements
- Static platforms with collision detection
- Moving platforms that carry the player
- Multi-tier level design
- Floating reset orbs that restore dash and double jump abilities

### Combat System
- Bullet physics with proper trajectory
- Target destruction with health system
- Particle effects on hit
- Screen shake feedback

## 🛠 Technology Stack

- **Framework**: Phaser 3.70.0 (loaded via CDN)
- **Languages**: HTML5, JavaScript (ES6 classes), CSS3
- **Physics**: Arcade Physics (built into Phaser)
- **Graphics**: Procedurally generated colored rectangles (placeholder graphics)

## 🚀 Running the Project

- **Main Game**: Open `index.html` in a web browser
- **Level Editor**: Open `level-editor.html` in a web browser

No build process required - runs directly in browser.

## 📁 Project Structure

```
├── index.html              # Main platformer game
├── level-editor.html       # Hierarchical level editor
├── css/
│   └── style.css           # Game styling and UI
├── js/
│   ├── game.js            # Main game setup and scene
│   ├── player.js          # Character controller with state machine
│   ├── level.js           # Platform and level management  
│   ├── target.js          # Shooting targets
│   ├── debug.js           # Debug menu system
│   └── level-editor.js    # Complete level editor system (1500+ lines)
├── assets/                 # Future sprite and sound assets
├── vibe coding logs/       # Development logs and design docs
├── nextsteps.md           # Development roadmap and technical architecture
├── level-editor-progress.md # Current level editor status
├── CLAUDE.md              # Development guidance and project overview
└── README.md              # This file
```

## 🎯 Game Controls

| Action | Keys |
|--------|------|
| Move | Arrow Keys or WASD |
| Jump | Space, W, or Up Arrow |
| Sprint | Hold Shift while moving |
| Dash | X key |
| Crouch | S or Down Arrow |
| Shoot | Z key |

## 🏗️ Level Editor System

### **Room Blockout Mode** - Complete Hierarchical Grid Editor

The level editor implements a sophisticated multi-scale editing system designed for rapid level creation with modular, reusable components.

#### Key Features
- **9x9 Cell Grid**: Room composed of 81 cells (8x5 tiles each)
- **Inverted Drawing**: Cells start filled, drawing creates walkable space
- **Star Pattern Brushes**: 5 brush sizes with unique patterns (1x1, plus, 3x3, extended, 5x5)
- **Real-time Preview**: Orange overlay shows exact tiles affected by brush
- **Visual Cell Library**: Drag-and-drop system with thumbnail previews

#### Drawing System
- **Blockout Mode**: Carve empty spaces (left-click = empty, right-click = fill)
- **Connection Tiles**: Place yellow connection markers on cell edges
- **Cell Management**: Select, move, swap, clear, and fill individual cells
- **Brush Control**: Size 1-5 via slider or Ctrl+Scroll wheel

#### Visual Design
- **Active/Inactive Cells**: White background for modified cells, gray for defaults  
- **Zoom & Pan**: Mouse wheel zoom (0.1x-5.0x), middle-click or WASD pan
- **Smart Grid**: Darker grid lines visible on all cell types
- **Cell Borders**: Light blue borders distinguish cell boundaries

#### Cell Library
- **Save System**: Drag selected cells to green canvas drop zone
- **Load System**: Drag thumbnails from shelf to canvas
- **Persistence**: Auto-saved to localStorage with timestamps
- **Management**: Hover delete, visual previews, organized shelf

### Level Editor Controls

| Action | Controls |
|--------|----------|
| **Navigation** | |
| Pan | WASD, Arrow Keys, or Middle Mouse + Drag |
| Zoom | Mouse Wheel |
| Brush Size | Ctrl + Scroll Wheel or Slider |
| **Drawing** | |
| Carve/Draw | Left Click |
| Fill | Right Click |
| **Modes** | |
| Blockout Mode | Primary drawing tool |
| Connection Tile | Place yellow connectors |  
| Select Cell | Click cell to select |
| Clone Mode | Duplicate cells |
| **Cell Operations** | |
| Save Cell | Drag selected cell to green drop zone |
| Load Cell | Drag thumbnail to canvas |
| Delete Cell | Hover thumbnail → click × |

## 🔧 Development Features

### Advanced Physics
- Custom moving platform system with player carrying
- Gravity-free projectiles with proper velocity
- Ability reset system (ground-based and entity-based)

### Planned Enemy System
- **Chaser**: Ground-based melee enemy that pursues player
- **Ranger**: Ground-based shooter with tactical AI
- **Turret**: Stationary precision shooter
- **Dive Bomber**: Flying enemy with patrol/dive behavior

## 📝 Development Logs

The `vibe coding logs/` directory contains detailed documentation of development challenges and solutions:

- `moving-platform-debug-log.md` - Complete troubleshooting log for moving platform implementation
- `bullet-physics-debug-log.md` - Physics timing issues and solutions for projectile system
- `enemy-system-design-spec.md` - Comprehensive design specification for enemy AI system

## 🎨 Visual Design

- **Player**: Blue rectangle (4A90E2)
- **Platforms**: Brown rectangles with variety (8B4513)
- **Targets**: Red rectangles (FF6B6B)
- **Bullets**: Yellow rectangles (FFD93D)
- **Ground**: Green rectangles (6BCF7F)
- **Reset Orbs**: Purple rectangles (9B59B6)
- **Moving Platforms**: Purple rectangles (9932CC)

## 🚧 Development Roadmap

### ✅ Completed (Phase 1)
- **Complete Character Controller**: Advanced movement with state machine
- **Debug Menu System**: Real-time property adjustment with persistence  
- **Room Blockout Mode**: Full hierarchical level editor with cell library
- **Visual Cell System**: Drag-and-drop interface with canvas-rendered drop zones
- **Brush System**: Star pattern brushes with real-time preview

### 🔄 Next Phase: Detailed Room Editor
- **16x10 Tile Resolution**: Each cell becomes detailed tile editor
- **Seamless Zoom**: Click cell in room mode → edit detailed tiles  
- **Tile-Level Tools**: Precise drawing and refinement tools
- **Dual-Scale Workflow**: Rough blockout → detailed polish

### 🔮 Future Phases: World Editor  
- **Multi-Room System**: Compose worlds from saved rooms
- **World Map Interface**: Visual room connection system
- **Level Generation**: Export game-ready level data
- **Complete Integration**: Level editor → playable game levels

### 🎨 Visual & Audio Enhancements
- Replace placeholder graphics with actual sprites
- Add sound effects and music  
- Implement complete enemy system
- Add particle effects and animations
- Create game states (menu, game over, etc.)

## 🐛 Known Issues

All major physics and collision issues have been resolved. See development logs for detailed problem-solving documentation.

## 📚 Documentation

### Development Guides
- **`CLAUDE.md`**: Comprehensive project overview and development guidance
- **`nextsteps.md`**: Long-term technical roadmap and architecture
- **`level-editor-progress.md`**: Current implementation status and next steps

### Development Logs
The `vibe coding logs/` directory contains detailed problem-solving documentation:
- `moving-platform-debug-log.md` - Complete troubleshooting for platform system
- `bullet-physics-debug-log.md` - Physics timing solutions for projectiles  
- `enemy-system-design-spec.md` - Comprehensive enemy AI design
- Additional implementation and debugging logs

## 🤝 Contributing

This is a learning project showcasing both game development and level editor architecture. The extensive documentation provides insight into the development process and technical decisions.

---

*Built with ❤️ using Phaser 3*