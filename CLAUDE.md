# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A basic 2D platformer character test built with HTML5 and Phaser 3. Focuses on character movement mechanics, platforms, and basic shooting mechanics for testing gameplay elements.

## Technology Stack

- **Framework**: Phaser 3.70.0 (loaded via CDN)
- **Languages**: HTML5, JavaScript (ES6 classes), CSS3
- **Physics**: Arcade Physics (built into Phaser)
- **Sprites**: Procedurally generated colored rectangles (placeholder graphics)

## Running the Game

Open `index.html` in a web browser. No build process required - runs directly in browser.

## Project Architecture

### Core Classes

- **GameScene** (`js/game.js`): Main game scene, handles setup, collisions, and game loop
- **Player** (`js/player.js`): Character controller with all movement mechanics
- **Level** (`js/level.js`): Platform creation and level management
- **Target** (`js/target.js`): Shooting targets with health and particle effects

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

## File Structure

```
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Game styling and UI
├── js/
│   ├── game.js            # Main game setup and scene
│   ├── player.js          # Character controller with versioned abilities
│   ├── level.js           # Platform and level management  
│   ├── target.js          # Shooting targets
│   └── debug.js           # Debug menu controller and persistence
├── assets/
│   ├── sprites/           # Future sprite assets
│   └── sounds/            # Future audio assets
├── vibe coding logs/      # Debug and implementation logs
│   ├── debug-menu-implementation-log.md
│   ├── ability-versioning-debug-log.md
│   └── [other debugging logs...]
└── .claude/               # Claude Code configuration
```

## Game Controls

- **Movement**: Arrow Keys or WASD
- **Jump**: Space, W, or Up Arrow  
- **Sprint**: Hold Shift while moving
- **Dash**: X key
- **Crouch**: S or Down Arrow (reduces speed, changes hitbox)
- **Shoot**: Z key

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