

### Basic Movement
- **Horizontal Movement**: Arrow keys control left/right movement
- **Walking Speed**: not slow, not fast.

- **Normal Jump**: Space its a jump.
- **Boost  Jump**: shift to active boost then jump with that momentum. a jump that is enabled from a normal boost. its more powerfull than a normal Jump
- **Charge  Jump**: hold shift, afther the boost timer reaches zero it will change to charge mode to be ready for a jump. a jump that is enabled from the charge boost state. it a powerfull jump that jumps stragiht up. from the angle oppsite from the character is touching.

## Boost System (Core Feature)

### Boost Activation
- **Trigger**: Press Shift key
- **Duration**: 400ms boost window
- **Speed Multiplier**: 2x movement speed


## Charge Boost System

### Charge Boost Activation
- **Trigger**: Hold Shift after boost timer expires
- **Charge Rate**: 100% charge in 600ms
- **Speed**: 0.8x normal speed while charging

### Charge Jump
- **Power**: 500 + (chargeLevel × 2) velocity units
- **Direction**: Straight up (no horizontal movement)
- **Consumption**: Uses entire charge when jumping


### Ground Slide
- **Trigger**: Boost + Direction + Down (while grounded)
- **Speed**: 300 
- **Duration**: 1000ms 
- **Visual**: Character shrinks to half height


### Size System
- **Normal**: 1.0x width, 2.0x height (tall character)
- **Slide**: 1.0x width, 1.0x height (crouched)
- **Body Collision**: Adjusts collision box to match visual size


## State Management

### Key State Variables
- `isBoosted`: Active boost mode
- `isChargeBoosting`: Charging boost
- `isGroundSliding`: Currently Ground Sliding
- `isBoostJumping`: Boost jump in progress
- `isChargeJumping`: Charge jump in progress
- `isGrounded`: On solid ground

### State Transitions
- **Boost → Charge Boost**: When Shift held after boost expires
- **Charge Boost → Normal**: When Shift released
- **Any State → Normal**: When landing on ground
- **Boost → Consumed**: After using a boost action

### Basic Controls
- **Arrows**: Move left and right.
- **Space**: Jump
- **Shift**: Boost (speed boost + enhanced actions)
- **Hold Shift**: Charge Boost (slow + charge jump)
- **Boost + Direction + Down**: Ground Slide

### Advanced Combinations
- **Boost + Jump**: Boosted jump with horizontal momentum
- **Boost + Down + Direction**: Ground slide

