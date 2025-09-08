# State Machine Character Controller

A data-driven, modular character controller system built with Phaser.js that separates state management from ability execution. This system makes it easy to add, modify, or remove character abilities while maintaining clean, readable code.

## 🎯 Key Features

- **Data-driven configuration**: All abilities, speeds, and durations are configurable in `playerConfig.js`
- **State machine architecture**: Clean separation between state transitions and ability execution
- **Modifiers system**: Easy upgrades, buffs, and temporary effects
- **Input buffering**: Responsive controls with jump buffering
- **Visual feedback**: Color-coded states for easy debugging
- **Extensible design**: Simple to add new abilities or modify existing ones

## 📁 Project Structure

```
state-machine-character-controller/
├── js/
│   ├── playerConfig.js      # All ability data and feature flags
│   ├── playerStates.js      # State enums (movement, action, boost, charge)
│   ├── fsm.js              # State machine infrastructure
│   ├── playerModel.js      # State management and modifiers
│   └── playerController.js # State transitions and ability execution
├── state-machine-test.html # Test scene
└── README.md              # This file
```

## 🎮 Controls

- **Movement**: Arrow Keys
- **Jump**: Spacebar
- **Boost/Charge**: Shift (hold for charge)
- **Ground Slide**: Boost + Direction + Down

## 🏗️ Architecture Overview

### 1. Configuration System (`playerConfig.js`)
All character abilities are defined as data:

```javascript
abilities: {
  move: { speed: { base: 160 } },
  boost: { speed: { base: 320 }, durationMs: { base: 400 } },
  jump: {
    normal: { vy: { base: -500 } },
    boost: { vy: { base: -550 }, vx: { base: 320 } },
    charge: { vy: { base: -800 } }
  }
}
```

### 2. State Management (`playerStates.js`)
Clear state definitions prevent invalid combinations:

```javascript
export const MovementState = Object.freeze({
  GROUNDED: "grounded",
  AIRBORNE: "airborne",
  SUBMERGED: "submerged"
});
```

### 3. State Machine Infrastructure (`fsm.js`)
Reusable components for state management:

- `TimedFlag`: Timer for durations and buffering
- `StateMachine`: State transitions with enter/exit callbacks

### 4. Player Model (`playerModel.js`)
Single source of truth for player state:

- Manages all state machines
- Tracks input state
- Handles modifiers system
- Provides helper methods

### 5. Controller (`playerController.js`)
Handles state transitions and ability execution:

- Separates "when/how long" from "what happens"
- Manages visual feedback
- Provides clean input API

## 🔧 Modifiers System

The modifiers system allows easy upgrades and buffs:

```javascript
// Add a speed boost
model.mods.add({
  key: "move.speed",
  op: "mul",
  value: 1.5,
  enabled: true
});

// Disable an ability
model.cfg.featureFlags.canSlide = false;
```

### Modifier Operations
- `"mul"`: Multiply base value
- `"add"`: Add to base value  
- `"set"`: Replace base value

## 🎨 Visual States

The system provides color-coded visual feedback:

- **Blue**: Normal state
- **Red**: Boost active
- **Yellow**: Charging
- **Orange**: Charge ready
- **Green**: Charge jump
- **Light Blue**: Ground slide

## 🚀 Adding New Abilities

### 1. Add to Configuration
```javascript
// In playerConfig.js
abilities: {
  dash: {
    speed: { base: 500 },
    durationMs: { base: 200 },
    cooldownMs: { base: 1000 }
  }
}
```

### 2. Add State
```javascript
// In playerStates.js
export const ActionState = Object.freeze({
  // ... existing states
  DASHING: "dashing"
});
```

### 3. Add Feature Flag
```javascript
// In playerConfig.js
featureFlags: {
  // ... existing flags
  canDash: true
}
```

### 4. Implement Logic
```javascript
// In playerController.js
_updateActionState(dt) {
  // Add dash logic
  if (canDash && dashPressed) {
    this._doDash();
  }
}

_doDash() {
  // Implement dash ability
}
```

## 🔄 State Flow

### Movement States
- `GROUNDED` ↔ `AIRBORNE` (based on physics)
- `SUBMERGED` (for future water mechanics)

### Action States
- `IDLE` ↔ `RUNNING` (based on input)
- `JUMPING` (when airborne)
- `BOOST_JUMPING` (boost + jump)
- `CHARGE_JUMPING` (charge + jump)
- `SLIDING` (boost + direction + down)

### Boost States
- `IDLE` → `ARMED` (shift pressed)
- `ARMED` → `ACTIVE` (when grounded)
- `ACTIVE` → `IDLE` (duration expires or action used)

### Charge States
- `IDLE` → `CHARGING` (hold shift after boost)
- `CHARGING` → `FULL` (600ms charge time)
- `FULL` → `IDLE` (jump used or shift released)

## 🧪 Testing

Open `state-machine-test.html` in a web browser to test the system. The debug display shows:

- Current states for all state machines
- Speed multiplier
- Player position and velocity
- Feature flag status
- Timer information

## 🔮 Future Enhancements

The system is designed to easily support:

- **Double Jump**: Add to ActionState and implement logic
- **Wall Running**: Add MovementState and physics detection
- **Dashing**: Add new ability with cooldown system
- **Water Mechanics**: Implement SUBMERGED movement state
- **Combat Abilities**: Add attack states and damage modifiers
- **Power-ups**: Use modifiers system for temporary effects

## 📚 Benefits Over Original System

1. **Maintainability**: Clear separation of concerns
2. **Extensibility**: Easy to add new abilities
3. **Debuggability**: Visual state feedback and clear state names
4. **Configurability**: All values in one place
5. **Testability**: Modular components are easy to test
6. **Performance**: Efficient state machine updates
7. **Documentation**: Self-documenting through clear structure

## 🤝 Integration

To integrate this system into your existing project:

1. Copy the `js/` folder to your project
2. Import the classes in your scene
3. Replace your existing character controller logic
4. Customize `playerConfig.js` for your needs

The system is designed to be a drop-in replacement that's more powerful and maintainable than the original imperative approach.
