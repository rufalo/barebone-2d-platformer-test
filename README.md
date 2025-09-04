# Basic Platformer Character Test

A 2D platformer character test built with HTML5 and Phaser 3, focusing on character movement mechanics, platforms, shooting, and enemy AI systems.

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

## 🚀 Running the Game

Simply open `index.html` in a web browser. No build process required - runs directly in browser.

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Game styling and UI
├── js/
│   ├── game.js            # Main game setup and scene
│   ├── player.js          # Character controller
│   ├── level.js           # Platform and level management  
│   └── target.js          # Shooting targets
├── assets/                 # Future sprite and sound assets
├── vibe coding logs/       # Development logs and design docs
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

## 🚧 Future Enhancements

- Replace placeholder graphics with actual sprites
- Add sound effects and music
- Implement complete enemy system
- Add particle effects and animations
- Create multiple levels
- Add game states (menu, game over, etc.)

## 🐛 Known Issues

All major physics and collision issues have been resolved. See development logs for detailed problem-solving documentation.

## 🤝 Contributing

This is a learning project documenting the development process. The detailed logs in `vibe coding logs/` provide insight into the problem-solving approach used during development.

---

*Built with ❤️ using Phaser 3*