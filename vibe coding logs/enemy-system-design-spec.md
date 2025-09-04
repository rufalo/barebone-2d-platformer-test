# Enemy System Design Specification

## Overview
Implementation of 4 distinct enemy types for the platformer game, each with unique behaviors, movement patterns, and attack mechanics.

## Enemy Types

### 1. Chaser Enemy (Ground-Based Follower)
**Behavior:** Relentless pursuit melee enemy
- **Movement:** Ground-based physics (affected by gravity, collides with platforms)
- **AI Pattern:** Direct movement towards player position
- **Attack Method:** Contact damage (damages player on touch)
- **Range:** No range limit - always pursues player
- **Special Properties:**
  - Follows player across platforms (jumping/pathfinding)
  - Constant movement speed regardless of distance
  - "Hugs" the player (tries to stay in contact)

**Implementation Details:**
- Physics body: Dynamic (like player)
- Collision: Platforms, world bounds
- Damage trigger: Overlap detection with player
- Visual: Aggressive color (red/orange)

### 2. Ranger Enemy (Ground-Based Shooter)
**Behavior:** Tactical ranged enemy with follow/shoot states
- **Movement:** Ground-based physics (affected by gravity, collides with platforms)
- **AI Pattern:** 
  - **Follow Mode:** Moves towards player when out of shooting range
  - **Shoot Mode:** Stops moving and shoots projectiles at player when in range
- **Attack Method:** Projectile shooting (straight-line bullets towards player)
- **Range:** Defined shooting range (e.g., 300 pixels)
- **Special Properties:**
  - State-based AI (following vs shooting)
  - Continuous shooting while player is in range
  - Projectiles use same physics as player bullets

**Implementation Details:**
- Physics body: Dynamic (like player)
- Collision: Platforms, world bounds
- Shooting range: Configurable distance check
- Projectile creation: Similar to player bullet system
- Visual: Military/tactical color (dark green/brown)

### 3. Turret Enemy (Stationary Targeted Shooter)
**Behavior:** Fixed-position precision shooter
- **Movement:** No movement (stationary)
- **AI Pattern:** Rotates to face player and shoots directly at player position
- **Attack Method:** Targeted projectile shooting (aims at player's current position)
- **Range:** Unlimited (shoots across entire level)
- **Special Properties:**
  - Calculates angle to player for precise aiming
  - Projectiles travel in straight line toward player's position at time of firing
  - No movement or collision with platforms needed

**Implementation Details:**
- Physics body: Static or kinematic
- No platform collision needed
- Angle calculation: `Math.atan2(player.y - turret.y, player.x - turret.x)`
- Projectile velocity: Calculated based on angle and speed
- Visual: Mechanical/industrial (gray/black with rotation indicator)

### 4. Dive Bomber Enemy (Flying Attacker)
**Behavior:** Aerial patrol with dive attack pattern
- **Movement:** Flying (no gravity, no platform collision)
- **AI Pattern:**
  - **Patrol Mode:** Moves left/right in upper region with vertical bobbing
  - **Dive Mode:** When player in range, dives straight down at player
  - **Return Mode:** After dive, returns to upper patrol area
- **Attack Method:** Contact damage during dive attack
- **Range:** Configurable detection range for dive trigger
- **Special Properties:**
  - No physics constraints (flies freely)
  - Smooth bobbing motion during patrol
  - Fast dive speed, slower return/patrol speed

**Implementation Details:**
- Physics body: Kinematic or manual position control
- No gravity effects
- No platform collision
- State machine: Patrol → Dive → Return → Patrol
- Movement: Manual position updates or tweens
- Visual: Flying creature (blue/purple with wing-like animation)

## System Architecture

### Base Enemy Class
```javascript
class Enemy {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.sprite = null; // Created by subclasses
        this.type = type;
        this.health = 1; // Default health
        this.damage = 1; // Damage dealt to player
        this.speed = 100; // Movement speed
        this.isActive = true;
    }
    
    update() {
        // Override in subclasses
    }
    
    takeDamage(amount = 1) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        // Particle effects, sound, cleanup
        this.sprite.destroy();
        this.isActive = false;
    }
}
```

### Enemy Manager
```javascript
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.enemyProjectiles = scene.physics.add.group();
    }
    
    spawnEnemy(type, x, y) {
        // Factory pattern for enemy creation
    }
    
    update() {
        // Update all active enemies
    }
    
    setupCollisions(player, bullets) {
        // Set up all enemy-related collisions
    }
}
```

## Visual Design

### Color Coding System
- **Chaser:** Red/Orange (aggressive, danger)
- **Ranger:** Dark Green/Brown (military, tactical)  
- **Turret:** Gray/Black (mechanical, industrial)
- **Dive Bomber:** Blue/Purple (aerial, mystical)

### Size Guidelines
- **Chaser:** Similar to player size (32x32)
- **Ranger:** Slightly larger than player (32x40)
- **Turret:** Compact but visible (24x24)
- **Dive Bomber:** Medium flying size (28x20)

## Collision System

### Damage Collision
- **Player vs Enemy Contact:** Player takes damage
- **Player Bullets vs Enemies:** Enemies take damage/destroyed
- **Enemy Bullets vs Player:** Player takes damage
- **Enemy Bullets vs Platforms:** Bullets destroyed

### Physics Collision
- **Ground Enemies:** Collide with platforms and world bounds
- **Flying Enemies:** No platform collision, world bounds only
- **Projectiles:** Platform collision (destruction), no enemy collision

## Balancing Parameters

### Movement Speeds
- **Chaser:** 120 pixels/second (faster than player walk, slower than sprint)
- **Ranger:** 100 pixels/second (moderate pursuit speed)
- **Turret:** 0 (stationary)
- **Dive Bomber:** 80 patrol, 300 dive speed

### Health Values
- **All Enemies:** 1 health (one-shot by player bullets)
- **Future Enhancement:** Variable health for difficulty scaling

### Damage Values
- **All Enemies:** 1 damage to player
- **Future Enhancement:** Different damage amounts per enemy type

### Range Values
- **Chaser:** Unlimited pursuit range
- **Ranger:** 300 pixel shooting range
- **Turret:** Unlimited shooting range
- **Dive Bomber:** 200 pixel dive trigger range

## Implementation Priority
1. **Enemy Base Class** - Foundation for all enemy types
2. **Chaser Enemy** - Simplest AI (just follow player)
3. **Turret Enemy** - Stationary shooting mechanics
4. **Ranger Enemy** - Complex state-based AI
5. **Dive Bomber Enemy** - Flying physics and state machine

## Integration Points

### Game Scene Integration
- Add enemy spawning in `GameScene.create()`
- Add enemy updates in `GameScene.update()`
- Set up collision detection for all enemy interactions

### Player Integration  
- Add player health/damage system
- Add visual feedback for taking damage
- Potential player invincibility frames after damage

### Level Integration
- Define enemy spawn points in `Level.createLevel()`
- Consider enemy placement relative to platforms and player spawn

## Future Enhancements
- **AI Improvements:** Pathfinding, predictive aiming, group behaviors
- **Visual Effects:** Death animations, muzzle flashes, trail effects  
- **Audio:** Enemy sounds, shooting sounds, damage sounds
- **Difficulty Scaling:** Health, damage, speed, and count variations
- **Special Abilities:** Enemy-specific powers, environmental interactions