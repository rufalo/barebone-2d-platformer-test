/*
============================================================================
PLAYER CONFIGURATION - DATA-DRIVEN ABILITY SYSTEM
============================================================================

This file contains all the configurable data for the character controller:
- Ability properties (speeds, durations, forces)
- Visual settings (colors, scales)
- Physics constants
- Feature flags for upgrades/locks

All values are designed to work with the Modifiers system for easy
upgrades and buffs.
============================================================================
*/

export const PlayerConfig = {
  // Abilities & base stats (pure data)
  abilities: {
    move: {
      speed: { base: 160 }, // units/s
      airControl: { base: 1.0 }, // 0..1 multiplier on horizontal control in air
    },
    boost: {
      speed: { base: 320 }, // 2x normal speed
      durationMs: { base: 400 }, // boost window duration
      canBufferInAir: true, // can press boost while airborne
    },
    charge: {
      speed: { base: 128 }, // 0.8x normal speed (slower while charging)
      durationMs: { base: 600 }, // time to full charge
    },
    slide: {
      speed: { base: 300 }, // 1.88x normal speed
      durationMs: { base: 1000 }, // slide duration
      cancels: ["OppositeDirection", "Airborne", "Timeout"], // what cancels slide
      scaleY: 0.5, // visual scaling during slide
    },
    jump: {
      normal: {
        vy: { base: -500 }, // upward velocity
        addHorizontal: false, // no horizontal boost
      },
      boost: {
        vy: { base: -550 }, // stronger upward velocity
        vx: { base: 320 }, // horizontal impulse (matches boost speed)
        airControlDuring: true, // can change direction during boost jump
      },
      charge: {
        vy: { base: -800 }, // strongest upward velocity (at full charge)
        vx: { base: 0 }, // no horizontal movement
        requiresFullCharge: true, // only works at 100% charge
      }
    },
    physics: {
      gravityY: 1200, // gravity strength
      bounce: 0.05, // bounce factor on landing
    },
    colors: {
      normal: 0x3498db, // blue
      boostActive: 0xff6b6b, // red
      chargeBoosting: 0xfeca57, // yellow
      chargeReady: 0xff8c00, // orange
      boostJump: 0xffff00, // bright yellow
      chargeJump: 0x00ff00, // green
      slide: 0x54a0ff, // light blue
    }
  },

  // Feature flags for upgrades/locks (toggled by your buff/upgrade system)
  featureFlags: {
    canBoost: true,
    canCharge: true,
    canSlide: true,
    canBoostJump: true,
    canChargeJump: true,
    // Future abilities can be added here:
    // canDoubleJump: false,
    // canWallRun: false,
    // canDash: false,
  }
};
