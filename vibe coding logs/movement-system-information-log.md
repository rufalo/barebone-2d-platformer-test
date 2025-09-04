# Movement System Information Log

## Project Overview

This log documents the complete movement system architecture and common development challenges for the 2D platformer character test. The system has evolved through multiple iterations to support advanced mechanics like versioned abilities, boost integration, and complex platform interactions.

## Core Movement Systems

### Movement System v1 - Traditional Movement
**Architecture**: Simple hold-based mechanics
- **Sprint**: Hold Shift + direction for 320 speed continuous movement
- **Dash**: Double-tap direction for 600 speed, 300ms duration, 1000ms cooldown
- **Visual Feedback**: Yellow tint for sprint, red tint for dash
- **Use Case**: Classic platformer feel with familiar controls

### Movement System v2 - Boost-Integrated Movement  
**Architecture**: Tap-based mechanics with shared boost state
- **Sprint**: Tap Shift + direction for 400 speed, 350ms duration burst
- **Ground Dash**: Double-tap direction for 500 speed + activates boost state (purple visual)
- **Air Dash**: Tap Shift in air for 400 speed directional dash (cyan visual)
- **Boost Integration**: Jump during boost extends timer by 300ms (configurable)
- **Visual Feedback**: Green boost, purple ground dash, cyan air dash/boost extension
- **Use Case**: Mega Man-style momentum chaining and aerial mobility

## Core Movement Properties

### Basic Movement
- **Movement Speed**: 50-300 (default: 200)
- **Jump Velocity**: 200-700 (default: 400)
- **Coyote Time**: 50-300ms (default: 150ms) - grace period for jumping after leaving platform
- **Jump Buffer**: 50-300ms (default: 150ms) - early jump input registration

### Advanced Movement Features
- **Double Jump**: Toggle-enabled second jump in mid-air
- **Crouch**: S/Down arrow - gray tint, reduced hitbox (28x20), offset adjustment
- **Wall Interactions**: Not implemented (planned for future)

## Versioned Ability System

### Architecture Evolution
**Problem**: Need to support multiple implementations of abilities for experimentation
**Solution**: Unified movement system packages instead of independent ability versions

### Data Structure
```javascript
movementSystems: {
    v1: {
        name: "Traditional Movement",
        description: "Hold to sprint + traditional dash",
        dash: { speed: 600, duration: 300, cooldown: 1000 },
        sprint: { speed: 320 }
    },
    v2: {
        name: "Boost-Integrated Movement", 
        description: "Tap to boost + integrated dash with air dash",
        dash: { speed: 500, duration: 200, cooldown: 800, boostDuration: 300, airDashSpeed: 400, airDashDuration: 150 },
        sprint: { speed: 400, duration: 350, jumpWindow: 200, airMomentumDuration: 300 }
    }
}
```

### Key Benefits
- **Guaranteed Consistency**: Sprint and dash versions always match
- **Clean Logic**: Single version check (`movementSystem === 'v2'`) instead of dual checks
- **Extensible**: Easy to add v3, v4 systems without touching existing code
- **Intuitive UI**: Single selector for complete movement packages

## Platform System

### Static Platforms
- **Creation**: `Level.addPlatform(x, y)` - 100x20 green rectangles
- **Physics**: Static physics bodies, immovable collision surfaces
- **Collision**: Standard Phaser physics collision with player

### Moving Platforms
- **Creation**: `Level.addMovingPlatform(startX, startY, endX, endY, speed)`
- **Physics Challenge**: Dynamic bodies fall due to gravity, static bodies lose collision when moved
- **Solution**: Dynamic physics group with `allowGravity: false, immovable: true`
- **Movement**: Manual position updates (`platform.x += deltaX`) instead of velocity
- **Player Carrying**: Bounds-based detection with proper vertical tolerance (±5 to +10 pixels)
- **Visual**: Bright orange (#FF4500) for clear distinction from static platforms

### Moving Platform Implementation Challenges
1. **Gravity Compensation**: `setGravityY(-1200)` doesn't work, must use `allowGravity: false`
2. **Physics Groups**: Must configure at group level AND individual sprite level
3. **Player Carrying**: Built-in physics "ride" behavior unreliable, manual bounds detection required
4. **Collision Precision**: Too liberal = affects player on other platforms, too strict = no movement

## Common Development Challenges

### 1. Version System Evolution
**Challenge**: Independent version flags (`dashVersion`, `sprintVersion`) created inconsistent pairings
**Root Cause**: v2 systems designed as integrated packages, not independent features
**Solution**: Unified movement system packages with single version selector
**Key Learning**: Data structure should reflect logical relationships, not just feature boundaries

### 2. Debug Menu Focus Interference  
**Challenge**: Clicking debug elements stole keyboard focus from game
**Root Cause**: Browser focus management interfering with game controls
**Solution**: Auto-blur after interactions (`element.blur()`) and CSS focus management
**Key Learning**: UI panels must not interfere with gameplay controls in games

### 3. Boost State Management
**Challenge**: Creating consistent momentum-chaining mechanics across different abilities  
**Root Cause**: Different abilities (sprint, dash) needed to share boost state for jump extensions
**Solution**: Unified boost state (`isBoosting`, `boostTimer`, `boostDirection`) used by all v2 abilities
**Key Learning**: Shared state systems enable complex mechanic interactions

### 4. Moving Platform Collision Detection
**Challenge**: Player moved with platform when standing on other platforms nearby
**Root Cause**: Collision check only verified `touching.down` globally, not specific to platform
**Solution**: Three-condition bounds check: isGrounded + horizontalOverlap + isAbovePlatform  
**Key Learning**: Physics overlap checks can be too strict; bounds-based detection with tolerances works better

### 5. Visual Feedback Systems
**Challenge**: Users needed clear indication of different movement states and versions
**Root Cause**: Multiple movement modes required distinct visual communication
**Solution**: Color-coded tint system with logical progression
- **Red**: Traditional dash (v1)
- **Yellow**: Traditional sprint (v1) 
- **Green**: Boost state (v2)
- **Purple**: Ground dash with boost (v2)
- **Cyan**: Air dash and boost extensions (v2)
**Key Learning**: Consistent visual language helps users understand complex systems

### 6. Configuration Range Management
**Challenge**: Different ability versions needed different min/max tuning ranges
**Root Cause**: v1 and v2 have fundamentally different mechanics requiring different value ranges
**Solution**: Version-specific ranges in ability configuration with automatic UI adaptation
**Key Learning**: Configuration systems must adapt to different mechanic requirements

### 7. Persistence Complexity
**Challenge**: Saving/loading version data and individual property customizations
**Root Cause**: Need to preserve both version selection and customized values per version
**Solution**: Deep merge of saved data with defaults, preserving user customizations while adding new properties
**Key Learning**: Persistence systems need graceful handling of schema evolution

## Current Architecture Strengths

### Code Organization
- **Single Responsibility**: Each class handles distinct game element (Player, Level, Target)
- **Version Abstraction**: Movement systems cleanly separated through helper methods
- **Configuration Driven**: All properties tunable through debug interface
- **Extensible**: New movement systems can be added without modifying existing code

### Debug System
- **Real-time Tuning**: All properties adjustable during gameplay
- **Version-Aware UI**: Controls automatically show/hide based on system capabilities
- **Persistence**: Settings survive browser refresh through localStorage
- **Focus Management**: Never interferes with gameplay controls
- **Mobile Responsive**: Debug panel repositions for small screens

### Movement Feel
- **Responsive Controls**: Coyote time and jump buffering for forgiving input
- **Visual Feedback**: Clear color coding for all movement states  
- **Configurable Balance**: All timing/speed values tunable for optimal feel
- **Advanced Mechanics**: Momentum chaining and aerial mobility options

## Performance Considerations

### Efficient Collision Detection
- **Static Platforms**: Standard Phaser physics groups (efficient)
- **Moving Platforms**: Manual bounds checking only when platform moves (minimal overhead)
- **Version Checks**: Cached config references instead of deep property access

### Memory Management
- **Object Reuse**: Platform objects persist and update rather than recreation
- **Event Cleanup**: Proper removal of event listeners (not currently needed but considered)
- **State Minimization**: Only essential state tracked (isBoosting, timers, directions)

## Future Extensibility

### Planned Systems
- **Enhanced Crouch/Slide**: Momentum-based sliding with friction mechanics
- **Platform Trigger Zones**: More precise collision detection with separate physics/trigger bodies
- **Wall Mechanics**: Wall jump, wall slide, wall climb abilities
- **Movement System v3**: Potential new experimental mechanics

### Architecture Support
- **Movement System Framework**: Adding v3 requires only new system definition
- **Debug System**: Automatically adapts to new properties and systems
- **Visual Feedback**: Color system can extend with new tints
- **Persistence**: Handles schema evolution gracefully

## Key Development Principles Learned

1. **System-Level Design**: Group related features into coherent packages rather than treating as independent
2. **Configuration-Driven Development**: Make all values tunable early - it enables rapid iteration
3. **Visual Feedback First**: Clear visual communication prevents user confusion in complex systems  
4. **Bounds-Based Physics**: Sometimes manual bounds detection works better than built-in physics
5. **Focus Management**: UI must never interfere with core interaction patterns
6. **Graceful Schema Evolution**: Persistence systems must handle property additions/changes smoothly
7. **Iterative Refinement**: Start liberal, go strict, find balance - iteration reveals optimal solutions
8. **Documentation During Development**: Complex systems require detailed problem-solving logs

## Testing Methodology

### Manual Testing Approach
- **Version Switching**: Verify all mechanics work correctly when switching movement systems
- **Edge Case Testing**: Player on multiple platforms, rapid input combinations
- **Persistence Testing**: Verify settings survive browser refresh and schema changes
- **Mobile Testing**: Debug panel functionality on touch devices
- **Performance Testing**: Monitor frame rate during complex movement combinations

### Common Test Scenarios
- **Boost Chaining**: Sprint → Jump → Extension → Land → Repeat
- **Air Dash Combinations**: Ground dash → Air dash → Platform landing
- **Moving Platform Edge Cases**: Jump while platform changes direction
- **Debug UI**: All controls function without breaking game input
- **Version Consistency**: All mechanics work correctly in both v1 and v2

This comprehensive log serves as both historical documentation and future reference for continued development of the movement system.