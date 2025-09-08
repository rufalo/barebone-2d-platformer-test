# State Machine Development Test

⚠️ **NOT USABLE** - This project is currently not functional and should not be used.

A dedicated project for testing and developing state machine systems for game development.

## Overview

This project provides a visual testing environment for state machine implementations, featuring:

- **Interactive State Machine Framework** - Complete state machine system with transitions
- **Visual State Diagram** - Real-time visualization of current and previous states
- **Debug Logging** - Comprehensive logging system for state changes
- **Manual Controls** - Buttons to manually trigger state changes
- **Automatic Transitions** - Condition-based automatic state transitions
- **Character Movement** - Simple character that responds to different states

## Features

### State Machine Framework
- **State Management** - Add, remove, and manage states
- **Transition System** - Define conditions for automatic state changes
- **State Lifecycle** - `onEnter()`, `onUpdate()`, `onExit()` callbacks
- **State Timer** - Track how long the character has been in current state
- **Previous State Tracking** - Keep track of state history

### Visual Debugging
- **Real-time State Display** - Shows current and previous states
- **State Diagram** - Visual representation of state relationships
- **Debug Log** - Timestamped log of all state changes and events
- **State Timer** - Shows duration in current state

### Example States
- **Idle** - Default resting state
- **Walking** - Basic movement state
- **Running** - Fast movement state (requires Shift key)
- **Jumping** - Upward movement state
- **Falling** - Downward movement state
- **Attacking** - Action state (X key)

### Controls
- **Arrow Keys** - Move left/right
- **Shift** - Run (while moving)
- **Space** - Jump
- **X** - Attack
- **State Buttons** - Manually trigger state changes

## Usage

1. **Open `state-machine-test.html`** in a web browser
2. **Use keyboard controls** to trigger automatic state transitions
3. **Use manual buttons** to test specific state changes
4. **Watch the debug log** for detailed state change information
5. **Observe the state diagram** for visual feedback

## State Machine API

### Adding States
```javascript
stateMachine.addState('stateName', stateObject);
```

### Adding Transitions
```javascript
stateMachine.addTransition('fromState', 'toState', conditionFunction);
```

### State Object Structure
```javascript
class MyState {
    onEnter() {
        // Called when entering this state
    }
    
    onUpdate(delta) {
        // Called every frame while in this state
    }
    
    onExit() {
        // Called when leaving this state
    }
}
```

## Development Notes

This project is designed for:
- **Learning state machine concepts**
- **Testing state machine implementations**
- **Debugging state transition logic**
- **Prototyping game state systems**
- **Visualizing state flow**

Perfect for understanding how state machines work before implementing them in larger game projects!
