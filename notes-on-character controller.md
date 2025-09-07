# Character Controller Design Notes

## Core Movement Philosophy
- **Target Feel**: Fluid and smooth movement inspired by Super Meat Boy and Mega Man X
- **Base Speed**: Average movement speed with boost options for enhanced actions
- **Chainable System**: Boost actions should flow into each other seamlessly

## Boost System Design

### Core Boost Mechanics
- **Activation**: Press boost key to set boost flag (500ms timer or less)
- **Boost Actions**: Jump, dash, and ground slide get velocity boost when boost is active
- **Chainable Combos**: 
  - Boost-dash → Boost-jump
  - Boost-dash → Boost-slide  
  - Boost-slide → Boost-jump

### Implementation Status
✅ **Currently Implemented**: The boost system is already working in your v2 movement system with:
- Tap-to-boost activation
- Air momentum extension when jumping during boost
- Boost-integrated dash with chaining
- Ground slide with boost integration

## Dash System Design

### Activation Options (Need Decision)
1. **Single Key**: Press dash key to dash in facing direction
2. **Directional Keys**: Separate left/right dash buttons
3. **Double-Tap**: Double-click left/right movement keys

### Dash Variants
- **Horizontal Dash**: Standard left/right dash
- **Upward Dash**: Vertical dash with attack properties
- **Downward Dash**: Downward slam with different properties
- **Dodge Integration**: Dash could serve as dodge mechanic

### Dash vs Ground Slide Relationship
- **Option A**: Separate systems with different activation
- **Option B**: Unified system where down+dash = ground slide
- **Current Implementation**: ✅ Separate systems working well

## Jump System

### Current Status
✅ **Working Well**: Basic jump mechanics are solid

### Double Jump Options
1. **Traditional Double Jump**: Standard second jump in air
2. **Upward Dash**: Replace double jump with upward dash attack
3. **Boost-Enhanced Jump**: Use boost system for air mobility

### Implementation Status
✅ **Currently Implemented**: Double jump is working and can be toggled in debug menu

## Wall Interaction System

### Core Philosophy
- **Fluid Wall Physics**: Preserve momentum from pre-wall-impact movement
- **Super Meat Boy Style**: Convert horizontal velocity to vertical when hitting walls
- **No Velocity Zero-Out**: Maintain movement energy through wall contact

### Wall Jump Types

#### Type 1: Wall Peak Jump (High Arc)
- **Trigger**: Player hitting wall with upward velocity
- **Result**: High arc jump with both upward and wall-kick momentum
- **Use Case**: Climbing up walls

#### Type 2: Wall Slide Jump (Low Arc, Long Distance)  
- **Trigger**: Player sliding down wall
- **Input Options**:
  - Press into wall = Low arc, long horizontal distance
  - Press into wall + up = High arc, medium distance
- **Result**: Distance-focused wall kick

### Boost Integration
- **Momentum Preservation**: Boost energy carries through wall interactions
- **Enhanced Wall Kicks**: Boost state enhances wall jump power
- **Chain Potential**: Wall kicks can extend boost chains

### Implementation Status
✅ **Currently Implemented**: Advanced wall sliding and wall kick system with:
- Context-sensitive wall jumps (wall peak vs wall slide)
- Momentum conversion from horizontal to vertical
- Boost integration for wall running
- Natural wall kick mechanics

## Combat System Design

### Weapon System: Auto-Charging Gun

#### Core Concept
- **Automatic Charging**: Gun charges automatically without holding button
- **Charge Depletion**: Shooting depletes charge, smaller bullets at low charge
- **Movement Integration**: Player moves around waiting for charge to build
- **Boost Enhancement**: Boost movements could provide extra charge

#### Charge Mechanics
- **Full Charge**: Large, powerful shots
- **Partial Charge**: Medium shots
- **Low Charge**: Small, rapid shots
- **Boost Bonus**: Cool boost movements add extra charge

### Melee Combat Considerations

#### Options
1. **No Melee**: Focus purely on gun combat
2. **Hybrid System**: Both gun and melee (like some Mega Man X games)
3. **Gun-As-Melee**: Charge shots act as close-range attacks

#### Recommendation
- **Start with gun-only**: Keep combat simple and focused
- **Gun can serve as melee**: Short-range blasts for close combat
- **Add melee later**: If gun system feels complete, consider adding saber

### Special Attack: Downward Blast
- **Mechanic**: Shoot downward for upward momentum boost
- **Use Case**: Recovery, extended jumps, combo extensions
- **Integration**: Could be part of the charge system

## Implementation Priority

### Phase 1: Combat System (Next Focus)
1. **Auto-charging gun system**
2. **Charge-based bullet sizes**
3. **Boost-enhanced charging**
4. **Downward blast mechanic**

### Phase 2: Dash Refinement
1. **Decide on dash activation method**
2. **Implement directional dash variants**
3. **Integrate dodge mechanics**

### Phase 3: Advanced Features
1. **Enhanced wall interaction physics**
2. **Melee combat system (if desired)**
3. **Advanced combo systems**

## Current System Status

### ✅ Fully Implemented
- Boost system with chaining
- Wall sliding and wall kicks
- Ground slide mechanics
- Double jump system
- Debug menu for testing

### 🔄 Partially Implemented
- Dash system (basic version working, needs refinement)
- Wall interaction (advanced system working, could be enhanced)

### ❌ Not Yet Implemented
- Auto-charging gun system
- Combat mechanics
- Downward blast attack
- Advanced dash variants

## Next Steps

1. **Implement auto-charging gun system** as the next major feature
2. **Test and refine existing boost chains** to ensure smooth flow
3. **Decide on dash activation method** and implement consistently
4. **Add downward blast mechanic** for enhanced mobility
5. **Consider melee combat** after gun system is complete