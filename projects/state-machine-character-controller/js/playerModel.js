/*
============================================================================
PLAYER MODEL - STATE MANAGEMENT AND MODIFIERS
============================================================================

This file contains the core player model that manages:
- All state machines (movement, action, boost, charge)
- Input state tracking
- Timers for various abilities
- Modifiers system for upgrades/buffs
- Helper methods for reading config values with modifiers

The model is the single source of truth for player state and provides
a clean interface for the controller to read and modify state.
============================================================================
*/

import { StateMachine, TimedFlag } from "./fsm.js";
import { MovementState, ActionState, BoostState, ChargeState } from "./playerStates.js";
import { PlayerConfig } from "./playerConfig.js";

/**
 * Modifiers system for applying upgrades, buffs, and temporary effects.
 * Supports multiplicative, additive, and set operations on config values.
 */
export class Modifiers {
  constructor() { 
    this.mods = []; 
  }
  
  /**
   * Add a modifier to the system
   * @param {Object} mod - Modifier object with { key, op, value, enabled }
   *   - key: string identifier (e.g., "boost.speed")
   *   - op: "mul" | "add" | "set" 
   *   - value: number to apply
   *   - enabled: boolean (can be toggled on/off)
   */
  add(mod) { 
    this.mods.push(mod); 
  }
  
  /**
   * Remove a modifier by key
   * @param {string} key - The modifier key to remove
   */
  remove(key) {
    this.mods = this.mods.filter(mod => mod.key !== key);
  }
  
  /**
   * Evaluate a base value with all applicable modifiers
   * @param {number} base - Base value from config
   * @param {string} key - Modifier key to match
   * @returns {number} - Final value after applying modifiers
   */
  eval(base, key) {
    let value = base;
    
    for (const mod of this.mods) {
      if (!mod.enabled || mod.key !== key) continue;
      
      switch (mod.op) {
        case "mul":
          value *= mod.value;
          break;
        case "add":
          value += mod.value;
          break;
        case "set":
          value = mod.value;
          break;
      }
    }
    
    return value;
  }
  
  /**
   * Get all modifiers for a specific key
   * @param {string} key - Modifier key to find
   * @returns {Array} - Array of matching modifiers
   */
  getModifiers(key) {
    return this.mods.filter(mod => mod.key === key);
  }
}

/**
 * Player model that manages all state, timers, and configuration.
 * This is the single source of truth for player state.
 */
export class PlayerModel {
  constructor(sprite) {
    this.sprite = sprite;
    this.cfg = PlayerConfig;       // Configuration data
    this.mods = new Modifiers();   // Upgrades/buffs system

    // Input state (set by controller each frame)
    this.input = { 
      left: false, 
      right: false, 
      up: false, 
      down: false, 
      jump: false, 
      boost: false, 
      jumpPressed: false, 
      boostPressed: false 
    };
    
    // State machines
    this.movement = new StateMachine(MovementState.GROUNDED);
    this.action = new StateMachine(ActionState.IDLE);
    this.boost = new StateMachine(BoostState.IDLE);
    this.charge = new StateMachine(ChargeState.IDLE);

    // Timers for various abilities
    this.boostWindow = new TimedFlag(0);    // Boost activation window
    this.boostActive = new TimedFlag(0);    // Active boost duration
    this.slideTimer = new TimedFlag(0);     // Ground slide duration
    this.chargeTime = 0;                    // Charge accumulation (ms)
    this.jumpBuffer = new TimedFlag(0);     // Jump input buffering

    // Misc state tracking
    this.slideDir = 0;                      // Direction of current slide (-1, 0, 1)
    this.boostActionConsumed = false;       // Whether boost was used for an action
  }

  /**
   * Helper to read a config value with modifiers applied
   * @param {Object} path - Config path object (e.g., { base: 160 })
   * @param {string} key - Modifier key (e.g., "move.speed")
   * @returns {number} - Final value after modifiers
   */
  num(path, key) {
    const base = path.base;
    return this.mods.eval(base, key);
  }

  /**
   * Convenience getters for feature flags
   */
  get canBoost() { return this.cfg.featureFlags.canBoost; }
  get canCharge() { return this.cfg.featureFlags.canCharge; }
  get canSlide() { return this.cfg.featureFlags.canSlide; }
  get canBoostJump() { return this.cfg.featureFlags.canBoostJump; }
  get canChargeJump() { return this.cfg.featureFlags.canChargeJump; }
  
  /**
   * Get current speed multiplier for debug display
   * @returns {number} - Current speed multiplier (1.0 = normal, 2.0 = boost, etc.)
   */
  getCurrentSpeedMultiplier() {
    const normalSpeed = this.num(this.cfg.abilities.move.speed, "move.speed");
    
    if (this.boost.state === BoostState.ACTIVE) {
      return this.num(this.cfg.abilities.boost.speed, "boost.speed") / normalSpeed;
    } else if (this.charge.state === ChargeState.CHARGING) {
      return this.num(this.cfg.abilities.charge.speed, "charge.speed") / normalSpeed;
    } else if (this.action.state === ActionState.SLIDING) {
      return this.num(this.cfg.abilities.slide.speed, "slide.speed") / normalSpeed;
    } else if (this.action.state === ActionState.BOOST_JUMPING) {
      return this.num(this.cfg.abilities.boost.speed, "boost.speed") / normalSpeed;
    }
    
    return 1.0; // Normal speed
  }
  
  /**
   * Get charge percentage for debug display
   * @returns {number} - Charge percentage (0-100)
   */
  getChargePercentage() {
    if (this.charge.state === ChargeState.CHARGING) {
      const maxCharge = this.num(this.cfg.abilities.charge.durationMs, "charge.durationMs");
      return Math.round((this.chargeTime / maxCharge) * 100);
    } else if (this.charge.state === ChargeState.FULL) {
      return 100;
    }
    return 0;
  }
}
