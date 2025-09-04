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
- Dash ability (X key)
- Sprint (Hold Shift)
- Crouch (S/Down Arrow)
- Shooting (Z key)
- Coyote time and jump buffering for responsive controls

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
│   ├── player.js          # Character controller
│   ├── level.js           # Platform and level management  
│   └── target.js          # Shooting targets
├── assets/
│   ├── sprites/           # Future sprite assets
│   └── sounds/            # Future audio assets
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