# Phaser Collision Detection Best Practices Log

## Problem Description
Wall jump system completely failing due to unreliable collision detection methods in Phaser 3. Despite proper physics setup, `physics.overlap()` and `physics.world.overlap()` were not detecting collisions consistently.

## Key Discovery
**`physics.overlap()` methods are unreliable in this Phaser setup** - they are too strict and don't work consistently for collision detection. This same issue was previously encountered and solved in the moving platform implementation.

## Reference Evidence
From **moving-platform-debug-log.md** (Attempts 13-14):
- **Attempt 13**: `physics.world.overlap()` was "too strict" - player collided but detection failed
- **Attempt 14**: Bounds-based detection worked perfectly with proper tolerances
- **Key Quote**: "Physics overlap checks can be too strict - `physics.world.overlap()` didn't work reliably for this use case"

## ❌ Unreliable Methods (AVOID)

### Physics Overlap Methods
```javascript
// DON'T USE - Too strict and unreliable
this.scene.physics.overlap(this.sprite, wall)
this.scene.physics.world.overlap(playerBody, wallBody)

// These methods consistently fail despite proper collision setup
if (this.scene.physics.overlap(player, platform)) {
    // This condition rarely triggers even when visually colliding
}
```

### Trigger Zone Approaches  
```javascript
// DON'T USE - Fragile and maintenance-heavy
// Separate trigger sprites with manual positioning
const trigger = this.scene.physics.add.sprite(x + offset, y, 'trigger');
// Problems: positioning errors, conflicts between triggers, disconnected from physics
```

## ✅ Reliable Methods (USE THESE)

### 1. Bounds-Based Detection
```javascript
// USE - Reliable and precise
const playerBounds = this.sprite.getBounds();
const wallBounds = wall.getBounds();

// Check for bounds overlap
const horizontalOverlap = playerBounds.right > wallBounds.left && 
                        playerBounds.left < wallBounds.right;
const verticalOverlap = playerBounds.bottom > wallBounds.top && 
                      playerBounds.top < wallBounds.bottom;

if (horizontalOverlap && verticalOverlap) {
    // Reliable collision detection
}
```

### 2. Physics Body Touching + Bounds Confirmation
```javascript
// USE - Combine physics touching with bounds verification
const touchingLeft = this.sprite.body.touching.left;
const touchingRight = this.sprite.body.touching.right;

if (touchingLeft || touchingRight) {
    // Use bounds-based detection to identify specific object
    const playerBounds = this.sprite.getBounds();
    for (let wall of this.scene.level.walls) {
        const wallBounds = wall.getBounds();
        if (boundsOverlap(playerBounds, wallBounds)) {
            // Reliable specific collision detected
        }
    }
}
```

### 3. Proper Tolerances for Moving Objects
```javascript
// USE - Add tolerances for moving platform detection
const isAbovePlatform = playerBounds.bottom >= platformBounds.top - 5 && 
                       playerBounds.bottom <= platformBounds.top + 10;

// ±5 to +10 pixel tolerance accounts for physics engine precision issues
```

## Implementation Pattern

### Wall Detection System
```javascript
checkWallSliding() {
    const wasWallSliding = this.isWallSliding;
    let shouldWallSlide = false;
    let detectedWallSide = null;
    
    // Step 1: Use physics system for initial contact detection
    if (!this.isGrounded && this.sprite.body.velocity.y > 50) {
        const touchingLeft = this.sprite.body.touching.left;
        const touchingRight = this.sprite.body.touching.right;
        
        if (touchingLeft || touchingRight) {
            // Step 2: Use bounds-based detection for specific object identification
            const playerBounds = this.sprite.getBounds();
            
            for (let wall of this.scene.level.walls) {
                const wallBounds = wall.getBounds();
                
                const horizontalOverlap = playerBounds.right > wallBounds.left && 
                                        playerBounds.left < wallBounds.right;
                const verticalOverlap = playerBounds.bottom > wallBounds.top && 
                                      playerBounds.top < wallBounds.bottom;
                
                if (horizontalOverlap && verticalOverlap) {
                    // Step 3: Determine relationship based on positions
                    detectedWallSide = this.sprite.x < wall.x ? 'right' : 'left';
                    shouldWallSlide = true;
                    break;
                }
            }
        }
    }
    
    // Step 4: Handle state changes
    if (shouldWallSlide && !wasWallSliding) {
        this.startWallSlide(detectedWallSide);
    } else if (!shouldWallSlide && wasWallSliding) {
        this.stopWallSlide();
    }
}
```

## Why This Works Better

### Physics Overlap Issues
1. **Too Strict**: Physics overlap requires perfect alignment that rarely occurs in dynamic gameplay
2. **Timing Problems**: Physics updates happen at different intervals than game logic
3. **Precision Issues**: Floating-point physics calculations cause micro-gaps

### Bounds-Based Advantages  
1. **Pixel-Perfect**: `getBounds()` returns exact pixel boundaries
2. **Consistent**: Works regardless of physics update timing
3. **Flexible**: Easy to add tolerances for edge cases
4. **Debuggable**: Clear mathematical conditions that can be logged

## Real-World Evidence

### Moving Platform Success
- **Problem**: Player wouldn't move with platform using `physics.overlap()`
- **Solution**: Bounds-based detection with ±5-10 pixel tolerance
- **Result**: Perfect platform riding behavior

### Wall Jump Success  
- **Problem**: Wall jumping completely broken with `physics.overlap()`
- **Solution**: Physics touching + bounds confirmation
- **Result**: Reliable wall detection on both left and right walls

## Best Practice Guidelines

### DO:
- ✅ Use `getBounds()` for precise collision detection
- ✅ Combine physics `body.touching` with bounds verification  
- ✅ Add appropriate tolerances for moving objects
- ✅ Use position comparison for relationship determination
- ✅ Test with bounds-based detection first

### DON'T:
- ❌ Rely solely on `physics.overlap()` methods
- ❌ Create separate trigger zones unless absolutely necessary
- ❌ Assume physics overlap timing matches game logic timing
- ❌ Use pixel-perfect collision without tolerances
- ❌ Debug collision issues without logging bounds data

## Debug Logging Template
```javascript
// Always log bounds data when debugging collision issues
console.log(`Player bounds: ${playerBounds.left.toFixed(0)}-${playerBounds.right.toFixed(0)}, ${playerBounds.top.toFixed(0)}-${playerBounds.bottom.toFixed(0)}`);
console.log(`Wall bounds: ${wallBounds.left.toFixed(0)}-${wallBounds.right.toFixed(0)}, ${wallBounds.top.toFixed(0)}-${wallBounds.bottom.toFixed(0)}`);
console.log(`Overlap: H=${horizontalOverlap}, V=${verticalOverlap}`);
```

## Key Takeaway
**When collision detection fails in Phaser 3, switch from `physics.overlap()` to bounds-based detection with `getBounds()`.** This pattern has solved multiple critical collision issues in this project and should be the first approach tried for any collision detection problems.