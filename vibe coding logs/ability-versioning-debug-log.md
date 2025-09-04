# Ability Versioning System Debug Log

## Problem Description
Creating a system to support multiple versions of abilities (dash v1/v2, sprint v1/v2) that:
1. Allows switching between versions in real-time
2. Maintains separate property configurations for each version
3. Preserves all version data when switching
4. Integrates with debug menu for easy comparison

## Initial Challenge
The original dash and sprint implementations were hardcoded single versions. Need to support experimentation with different gameplay feels while keeping original implementations available.

## Attempted Solutions and Results

### Attempt 1: Boolean Toggle System
**Code:**
```javascript
// Simple boolean flags
this.config = {
    useDashV2: false,
    useSprintV2: false
};

getDashSpeed() {
    return this.config.useDashV2 ? 500 : 600;
}
```
**Result:** ✅ Works for simple value swaps
**Problem:** ❌ Can't have different min/max ranges, duration, cooldown per version

### Attempt 2: Conditional Property Loading
**Code:**
```javascript
// Load different property sets
if (this.config.dashVersion === 'v2') {
    this.dashSpeed = 500;
    this.dashDuration = 200;
    this.dashCooldown = 800;
} else {
    this.dashSpeed = 600;
    this.dashDuration = 300;
    this.dashCooldown = 1000;
}
```
**Result:** ❌ Properties lost when switching versions
**Problem:** Only one set of properties exists at a time

### Attempt 3: Separate Version Objects
**Code:**
```javascript
this.dashV1 = {
    speed: 600,
    duration: 300,
    cooldown: 1000
};

this.dashV2 = {
    speed: 500,
    duration: 200,
    cooldown: 800
};
```
**Result:** ✅ Both versions preserved
**Problem:** ❌ No integration with debug menu constraints (min/max values)

### Attempt 4: Structured Version Architecture
**Code:**
```javascript
this.abilityVersions = {
    dash: {
        v1: {
            speed: { value: 600, min: 300, max: 1000 },
            duration: { value: 300, min: 100, max: 500 },
            cooldown: { value: 1000, min: 200, max: 2000 }
        },
        v2: {
            speed: { value: 500, min: 200, max: 800 },
            duration: { value: 200, min: 50, max: 400 },
            cooldown: { value: 800, min: 100, max: 1500 }
        }
    }
};
```
**Result:** ✅ **Structured Version Data Working**
**Discovery:** Min/max values can be different per version for better tuning ranges

### Attempt 5: Version Selection State
**Code:**
```javascript
this.config = {
    versions: {
        dashVersion: 'v1',
        sprintVersion: 'v1'
    }
};
```
**Result:** ✅ Clean version tracking
**Problem:** ❌ Still need helper methods to access current version properties

### Attempt 6: Dynamic Property Access
**Code:**
```javascript
getCurrentDashConfig() {
    return this.abilityVersions.dash[this.config.versions.dashVersion];
}

// Usage in methods
performDash(direction) {
    const dashConfig = this.getCurrentDashConfig();
    this.sprite.setVelocityX(dashConfig.speed.value * direction);
}
```
**Result:** ✅ **Dynamic Version Access Working**
**Discovery:** Single code path handles all versions automatically

### Attempt 7: All Method Updates
**Code:**
```javascript
// Updated every reference from hardcoded to dynamic
// Before:
this.sprite.setVelocityX(this.dashSpeed * direction);
this.dashTimer = this.dashDuration;

// After:
const dashConfig = this.getCurrentDashConfig();
this.sprite.setVelocityX(dashConfig.speed.value * direction);
this.dashTimer = dashConfig.duration.value;
```
**Result:** ✅ All dash references updated
**Problem:** ❌ 15+ references to find and update across player class

### Attempt 8: Sprint Integration
**Code:**
```javascript
getCurrentSprintConfig() {
    return this.abilityVersions.sprint[this.config.versions.sprintVersion];
}

// Sprint has simpler structure (only speed property)
this.abilityVersions.sprint = {
    v1: { speed: { value: 320, min: 200, max: 500 } },
    v2: { speed: { value: 280, min: 150, max: 450 } }
};
```
**Result:** ✅ Sprint versioning working
**Discovery:** Different abilities can have different property structures

### Attempt 9: Debug Menu Integration
**Code:**
```html
<!-- Version selectors in debug menu -->
<select id="dashVersionSelect">
    <option value="v1">Dash v1 (Original)</option>
    <option value="v2">Dash v2 (Experimental)</option>
</select>
```
**Result:** ✅ UI for version selection
**Problem:** ❌ Changing version doesn't update property sliders

### Attempt 10: Dynamic Slider Range Updates
**Code:**
```javascript
dashVersionSelect.addEventListener('change', (e) => {
    this.player.config.versions.dashVersion = e.target.value;
    this.updateVersionProperties(); // Update slider ranges
});

updateVersionProperties() {
    // Refresh all version-dependent sliders
    this.syncVersionedSlider('dashSpeed', 'dash', 'speed');
    this.syncVersionedSlider('dashDuration', 'dash', 'duration');
}
```
**Result:** ✅ **Dynamic Range Updates Working**
**Discovery:** Slider min/max need to update when version changes

### Attempt 11: Version-Aware Slider Setup
**Code:**
```javascript
syncVersionedSlider(elementId, abilityType, property) {
    const currentVersion = this.player.config.versions[`${abilityType}Version`];
    const config = this.player.abilityVersions[abilityType][currentVersion][property];
    
    slider.min = config.min;
    slider.max = config.max;
    slider.value = config.value;
    valueSpan.textContent = config.value;
}
```
**Result:** ✅ Sliders update ranges and values when version changes
**Problem:** ❌ Slider event handlers don't know about versions

### Attempt 12: Versioned Slider Event Handlers
**Code:**
```javascript
setupVersionedSlider(elementId, abilityType, property) {
    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const currentVersion = this.player.config.versions[`${abilityType}Version`];
        this.player.abilityVersions[abilityType][currentVersion][property].value = value;
    });
}
```
**Result:** ✅ **Version-Specific Property Updates Working**
**Discovery:** Event handlers need to look up current version dynamically

### Attempt 13: Visual Version Indication
**Code:**
```html
<!-- Show current version in section headers -->
<h4>Dash Properties <span id="dashVersionLabel">(v1)</span></h4>
```
**Code:**
```javascript
updateVersionLabels() {
    document.getElementById('dashVersionLabel').textContent = 
        `(${this.player.config.versions.dashVersion})`;
}
```
**Result:** ✅ **Clear Visual Version Indication**
**Discovery:** Users need to see which version they're currently tuning

## Crouch System Refactor

### Attempt 14: Crouch Visual Fix
**Code:**
```javascript
// Original problematic approach
if (!this.isCrouching) {
    this.isCrouching = true;
    this.sprite.setScale(1, 0.7); // Caused visual issues
    this.sprite.body.setSize(28, 22);
}
```
**Result:** ❌ Player rectangle behavior was weird/jumpy
**Problem:** setScale() caused visual and physics inconsistencies

### Attempt 15: Tint-Based Crouch Feedback
**Code:**
```javascript
if (!this.isCrouching) {
    this.isCrouching = true;
    this.sprite.setTint(0xcccccc); // Gray tint for crouch
    this.sprite.body.setSize(28, 20); // Smaller hitbox
    this.sprite.body.setOffset(2, 12); // Keep feet on ground
}
```
**Result:** ✅ **Clean Crouch Visual Feedback**
**Discovery:** Tint + hitbox adjustment works better than scale changes

## Persistence Integration

### Attempt 16: Version Data Persistence
**Code:**
```javascript
// Save both config and version data
saveConfig() {
    const configData = {
        config: this.player.config,
        abilityVersions: this.player.abilityVersions // Include version data
    };
    localStorage.setItem('debug-config', JSON.stringify(configData));
}
```
**Result:** ✅ **Complete Version State Persistence**
**Discovery:** Need to save version data separately from main config

### Attempt 17: Reset Functionality
**Code:**
```javascript
resetToDefaults() {
    // Reset main config
    this.player.config = JSON.parse(JSON.stringify(this.defaultConfig));
    
    // Reset version data to original values
    this.player.abilityVersions = JSON.parse(JSON.stringify(this.defaultAbilityVersions));
}
```
**Result:** ✅ **Complete Reset Working**
**Discovery:** Need separate defaults for both config and version data

## ✅ FINAL WORKING SOLUTION

### Complete Versioning Architecture
```javascript
// Main config tracks current versions
this.config = {
    versions: {
        dashVersion: 'v1',
        sprintVersion: 'v1'
    }
};

// Separate object stores all version data
this.abilityVersions = {
    dash: {
        v1: { /* original properties */ },
        v2: { /* experimental properties */ }
    },
    sprint: {
        v1: { /* original properties */ },
        v2: { /* experimental properties */ }
    }
};

// Helper methods for clean access
getCurrentDashConfig() {
    return this.abilityVersions.dash[this.config.versions.dashVersion];
}
```

### Debug Menu Integration
- **Version Selectors**: Dropdown menus switch between v1/v2
- **Dynamic Sliders**: Ranges update when version changes  
- **Visual Labels**: Section headers show current version
- **Independent Tuning**: Each version maintains its own property values

### Game Logic Integration
- **Single Code Path**: All methods use getCurrentXConfig() helpers
- **Runtime Switching**: No restart needed when changing versions
- **Ability Toggles**: Can disable entire abilities regardless of version

## Key Learnings

1. **Separate Version Data from Config** - Don't mix version selection with version properties
2. **Helper Methods Simplify Code** - `getCurrentDashConfig()` is cleaner than long property paths
3. **Different Abilities Need Different Properties** - Dash has speed/duration/cooldown, Sprint only has speed
4. **UI Must Reflect Current State** - Show version in labels, update slider ranges
5. **Min/Max Can Vary By Version** - v2 might have different tuning ranges than v1
6. **Persistence Needs Both Objects** - Save config AND abilityVersions for complete state
7. **Visual Feedback Matters** - Tint changes work better than scale changes for crouch

## Root Cause Analysis
The original single-version system worked fine but prevented experimentation. The solution required:
- Data architecture that stores multiple versions
- Runtime switching without game restart  
- UI that adapts to show current version properties
- Persistence that maintains all version data

## Final Status: ✅ SOLVED
- Dash v1/v2 switching working with different speed/duration/cooldown
- Sprint v1/v2 switching working with different speeds
- Real-time version switching without restart
- Debug menu shows current version and updates ranges
- Complete persistence across browser sessions  
- All version data preserved when switching
- Crouch visual issues fixed with tint approach