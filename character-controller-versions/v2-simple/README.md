# Simple Character Controller v2.0

A clean, streamlined character controller focused on core movement mechanics and intuitive controls.

## 🎮 **Controls**

- **WASD/Arrows** → Move
- **Space** → Jump
- **Shift** → Boost (first press) / Dash (second press while boosted)
- **Shift + Down** → Ground slide (while boosted and grounded)

## ⚡ **Core Mechanics**

### **Boost System**
- **Single Shift** → Activates boost (500ms window)
- **Double Shift** → Consumes boost, activates dash
- **Boost + Jump** → Enhanced jump with forward momentum
- **Boost + Dash** → Enhanced dash speed

### **Movement Feel**
- **Responsive controls** with strong ground friction
- **Momentum-based jumping** with visual feedback
- **State-driven colors** for clear feedback
- **Smooth transitions** between states

## 🎨 **Visual System**

### **State-Based Colors**
- **White** → Default state
- **Green** → Boost ready
- **Dark Green** → Boost jumping
- **Yellow** → Normal jumping with momentum
- **Red/Orange** → Dashing

### **Real-time Status**
- Character state display
- Boost status with timer
- Dash cooldown indicator
- Physics data (velocity, position)

## 📁 **Files**

- **`simple-character-test.html`** → Complete test implementation
- **`simple-character-controller-documentation.md`** → Detailed system documentation

## 🔧 **Technical Details**

### **State Variables**
```javascript
this.isGrounded = false;        // Ground detection
this.isBoosted = false;         // Boost active state
this.isDashing = false;         // Dash active state
this.isBoostJumping = false;    // Boost jump tracking
```

### **Movement Properties**
```javascript
this.walkSpeed = 140;              // Base movement
this.jumpVelocity = 450;           // Normal jump
this.boostedJumpVelocity = 400;    // Boost jump (lower)
this.boostedJumpHorizontal = 200;  // Boost jump (forward)
this.dashSpeed = 600;              // Normal dash
this.boostedDashSpeed = 800;       // Boosted dash
```

## 🎯 **Design Philosophy**

1. **Simplicity** → Clean, readable code
2. **Responsiveness** → Tight, precise controls
3. **Visual Feedback** → Clear state indication
4. **Extensibility** → Easy to add new features
5. **Debugging** → Real-time state visibility

## 🚀 **Getting Started**

1. **Open `simple-character-test.html`** in browser
2. **Test basic movement** (WASD + Space)
3. **Try boost system** (Shift + Shift for dash)
4. **Experiment with boost jumping** (Shift + Space)
5. **Check state display** for real-time feedback

## 🔄 **Future Enhancements**

- Wall sliding and wall kicking
- Air dashing mechanics
- Advanced combo systems
- Particle effects
- Sound integration

---

**Version:** 2.0  
**Status:** Complete and functional  
**Last Updated:** 2025-01-09
