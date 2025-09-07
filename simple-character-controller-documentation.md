# Simple Character Controller - State System Documentation

## 🎯 **State System Overview**

The simple character controller uses a **state-driven approach** where the character's current state determines both behavior and visual feedback.

### **Core State Variables:**
```javascript
this.isGrounded = false;        // Is the character touching the ground?
this.isBoosted = false;         // Is boost active (500ms timer)?
this.isDashing = false;         // Is the character currently dashing?
this.isBoostJumping = false;    // Was the last jump a boosted jump?
this.showingJumpEffect = false; // Is a temporary jump effect showing?
```

## 🔄 **State Flow & Transitions**

### **1. Ground Detection**
```javascript
checkGrounded() {
    this.isGrounded = this.sprite.body.touching.down;
    
    if (this.isGrounded) {
        this.canDoubleJump = true;
        this.isBoostJumping = false; // Reset boost jumping when landing
    }
}
```
- **Every frame** → Checks if character is touching ground
- **When landing** → Resets boost jumping state and enables double jump

### **2. Boost System**
```javascript
handleBoost() {
    if (boostPressed) {
        if (this.isBoosted) {
            // Already boosted - activate dash!
            this.performDash();
        } else {
            // Not boosted - start boost
            this.isBoosted = true;
            this.boostTimer = this.boostDuration; // 500ms
        }
    }
}
```
- **First Shift** → Sets `isBoosted = true`, starts 500ms timer
- **Second Shift** → Consumes boost, activates dash
- **Timer expires** → `isBoosted = false`

### **3. Jump System**
```javascript
if (this.isBoosted) {
    // Mark as boost jumping
    this.isBoostJumping = true;
    // Add horizontal boost
    this.sprite.setVelocityX(/* boosted velocity */);
} else {
    // Mark as normal jumping
    this.isBoostJumping = false;
}
```
- **Normal jump** → `isBoostJumping = false`
- **Boost jump** → `isBoostJumping = true` (persists until landing)

## 🎨 **Color System Logic**

The color system runs in `updateVisuals()` and uses a **priority-based approach**:

```javascript
updateVisuals() {
    // Priority 1: Dashing (highest priority)
    if (this.isDashing) {
        return; // Keep dash color (red/orange)
    }
    
    // Priority 2: Temporary jump effects
    if (this.showingJumpEffect) {
        return; // Keep temporary effect color
    }
    
    // Priority 3: State-based colors
    if (this.isBoosted && this.isGrounded) {
        this.sprite.setTint(0x00ff00); // Green - boost ready
    } else if (this.isBoostJumping) {
        this.sprite.setTint(0x00aa00); // Darker green - boost jumping
    } else if (!this.isGrounded && this.sprite.body.velocity.y < -50) {
        this.sprite.setTint(0xaaaa00); // Yellow - normal jumping with momentum
    } else {
        this.sprite.setTint(0xffffff); // White - default state
    }
}
```

## 🎮 **State-to-Color Mapping**

| State | Condition | Color | Hex Code |
|-------|-----------|-------|----------|
| **Boost Ready** | `isBoosted && isGrounded` | Bright Green | `0x00ff00` |
| **Boost Jumping** | `isBoostJumping` | Dark Green | `0x00aa00` |
| **Normal Jumping** | `!isGrounded && velocity.y < -50` | Yellow | `0xaaaa00` |
| **Dashing** | `isDashing` | Red/Orange | `0xff0000`/`0xff8800` |
| **Default** | Everything else | White | `0xffffff` |

## 🔄 **Complete State Flow Example**

### **Boost Jump Sequence:**
1. **Idle** → State: "Idle", Color: White
2. **Press Shift** → State: "Idle", Boost: "On", Color: Green
3. **Press Space** → State: "Boost Jumping", Boost: "Off", Color: Dark Green
4. **Rising** → State: "Boost Jumping", Color: Dark Green (persists)
5. **Peak** → State: "Boost Jumping", Color: Dark Green (still)
6. **Falling** → State: "Boost Jumping", Color: Dark Green (still)
7. **Land** → State: "Idle", Color: White (reset)

### **Normal Jump Sequence:**
1. **Idle** → State: "Idle", Color: White
2. **Press Space** → State: "Jumping", Color: Yellow
3. **Rising** → State: "Jumping", Color: Yellow (persists)
4. **Peak** → State: "Jumping", Color: Yellow (still)
5. **Falling** → State: "Jumping", Color: White (no upward momentum)
6. **Land** → State: "Idle", Color: White

## ⚡ **Key Benefits of This System**

1. **State Persistence** → Colors don't get overridden by update loops
2. **Clear Visual Feedback** → Each state has a distinct color
3. **Priority System** → Important states (dashing) override others
4. **Automatic Transitions** → Colors change automatically with state changes
5. **Debug Friendly** → State display shows exactly what's happening

## 🎮 **Control System**

### **Input Mapping:**
- **WASD/Arrows** → Horizontal movement
- **Space** → Jump
- **Shift** → Boost (first press) / Dash (second press while boosted)
- **Shift + Down** → Ground slide (while boosted and grounded)

### **Boost + Dash Integration:**
- **Single Shift** → Activates boost (500ms window)
- **Double Shift** → Consumes boost, activates dash
- **Shift + Down** → Ground slide variant

## 🔧 **Technical Implementation**

### **Movement Properties:**
```javascript
this.walkSpeed = 140;              // Base movement speed
this.jumpVelocity = 450;           // Normal jump power
this.boostedJumpVelocity = 400;    // Boost jump vertical (lower)
this.boostedJumpHorizontal = 200;  // Boost jump horizontal (extra)
this.dashSpeed = 600;              // Normal dash speed
this.boostedDashSpeed = 800;       // Boosted dash speed
```

### **Friction System:**
```javascript
// Ground friction - strong for responsive control
this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.3);

// Air resistance - light for natural movement
this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.9);
```

## 📊 **Debug System**

### **Real-time Status Display:**
- **Character State** → Idle/Walking/Jumping/Boost Jumping/Dashing
- **Boost State** → On/Off with timer
- **Dash Status** → Ready/Cooldown with timer
- **Ground Status** → On Ground/In Air
- **Velocity/Position** → Real-time physics data

### **Visual Feedback:**
- **Color-coded states** for immediate visual feedback
- **State persistence** prevents color conflicts
- **Priority system** ensures important states are visible

---

**File:** `simple-character-test.html`  
**Version:** Simple Character Controller v1.0  
**Date:** 2025-01-09  
**Status:** Complete and functional
