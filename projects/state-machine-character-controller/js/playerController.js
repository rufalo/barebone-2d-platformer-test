/*
============================================================================
PLAYER CONTROLLER - STATE TRANSITIONS AND ABILITY EXECUTION
============================================================================

This file contains the main controller logic that:
- Manages state transitions based on input and conditions
- Executes ability effects (jumps, slides, movement)
- Handles visual feedback (colors, scaling)
- Provides a clean input API for the game scene

The controller separates "when/how long/what cancels" (transition logic)
from "what the ability does" (execution logic), making the system
easy to understand and modify.
============================================================================
*/

import { MovementState, ActionState, BoostState, ChargeState } from "./playerStates.js";

export class PlayerController {
  constructor(scene, model) {
    this.scene = scene;
    this.m = model;
    this.body = model.sprite.body; // Arcade physics body

    // Wire up visual effects for state changes
    this._wireVisuals();
  }

  /**
   * Set up visual effects that trigger on state changes
   */
  _wireVisuals() {
    const colors = this.m.cfg.abilities.colors;
    
    // Action state visuals
    this.m.action
      .onEnter(ActionState.SLIDING, (_, __, m) => {
        m.sprite.setTint(colors.slide);
        m.sprite.setScale(1, m.cfg.abilities.slide.scaleY);
      })
      .onExit(ActionState.SLIDING, () => {
        this.m.sprite.setScale(1, 1);
        this.m.sprite.setTint(colors.normal);
      });

    // Boost state visuals
    this.m.boost
      .onEnter(BoostState.ACTIVE, () => this.m.sprite.setTint(colors.boostActive))
      .onExit(BoostState.ACTIVE, () => {
        // Only reset to normal if not in a special action state
        if (!this._isInSpecialActionState()) {
          this.m.sprite.setTint(colors.normal);
        }
      });

    // Charge state visuals
    this.m.charge
      .onEnter(ChargeState.CHARGING, () => this.m.sprite.setTint(colors.chargeBoosting))
      .onEnter(ChargeState.FULL, () => this.m.sprite.setTint(colors.chargeReady))
      .onExit(ChargeState.CHARGING, () => {
        if (!this._isInSpecialActionState()) {
          this.m.sprite.setTint(colors.normal);
        }
      })
      .onExit(ChargeState.FULL, () => {
        if (!this._isInSpecialActionState()) {
          this.m.sprite.setTint(colors.normal);
        }
      });
  }

  /**
   * Check if player is in a state that should maintain its own color
   */
  _isInSpecialActionState() {
    return this.m.action.state === ActionState.SLIDING ||
           this.m.action.state === ActionState.BOOST_JUMPING ||
           this.m.action.state === ActionState.CHARGE_JUMPING;
  }

  /**
   * Main update loop - called each frame
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    // 1) Sense/derive movement state from physics
    this._senseMovement();

    // 2) Update all timers
    this._updateTimers(dt);

    // 3) Resolve boost/charge state machines
    this._updateBoostState(dt);
    this._updateChargeState(dt);

    // 4) Resolve action state machine (idle/running/jumping/sliding/etc.)
    this._updateActionState(dt);

    // 5) Apply ability effects (numbers -> actual velocities/forces)
    this._applyMotion(dt);
  }

  /**
   * Update movement state based on physics body
   */
  _senseMovement() {
    const grounded = this.body.blocked.down || this.body.touching.down;
    const submerged = false; // TODO: hook your water sensor here
    
    const newState = submerged ? MovementState.SUBMERGED : 
                    (grounded ? MovementState.GROUNDED : MovementState.AIRBORNE);
    
    this.m.movement.tryTransition(newState);
  }

  /**
   * Update all timers
   */
  _updateTimers(dt) {
    this.m.boostWindow.tick(dt);
    this.m.boostActive.tick(dt);
    this.m.slideTimer.tick(dt);
    this.m.jumpBuffer.tick(dt);
  }

  /**
   * Update boost state machine
   */
  _updateBoostState(dt) {
    const { boostPressed, boost } = this.m.input;

    // Buffer/arm boost press
    if (boostPressed && this.m.canBoost) {
      if (this.m.boost.state === BoostState.IDLE) {
        this.m.boost.tryTransition(BoostState.ARMED);
      }
    }

    // Start active boost only if grounded and armed
    if (this.m.movement.state === MovementState.GROUNDED &&
        this.m.boost.state === BoostState.ARMED &&
        this.m.boostActive.remaining === 0) {
      
      const duration = this.m.num(this.m.cfg.abilities.boost.durationMs, "boost.durationMs");
      this.m.boostActive.start(duration);
      this.m.boost.tryTransition(BoostState.ACTIVE);
      this.m.boostActionConsumed = false;
    }

    // If player releases boost, disarm if not charging
    if (!boost && this.m.boost.state !== BoostState.ACTIVE) {
      this.m.boost.tryTransition(BoostState.IDLE);
    }

    // Auto-end ACTIVE when duration expires
    if (this.m.boost.state === BoostState.ACTIVE && !this.m.boostActive.active) {
      this.m.boost.tryTransition(BoostState.IDLE);
      
      // Auto-enter CHARGING if still holding boost and action not consumed
      if (this.m.input.boost && this.m.canCharge && !this.m.boostActionConsumed) {
        this.m.charge.tryTransition(ChargeState.CHARGING);
        this.m.chargeTime = 0;
      }
    }
  }

  /**
   * Update charge state machine
   */
  _updateChargeState(dt) {
    if (this.m.charge.state === ChargeState.CHARGING) {
      this.m.chargeTime += dt;
      const maxCharge = this.m.num(this.m.cfg.abilities.charge.durationMs, "charge.durationMs");
      
      if (this.m.chargeTime >= maxCharge) {
        this.m.charge.tryTransition(ChargeState.FULL);
      }
      
      // Cancel conditions
      if (!this.m.input.boost) { // let go of key
        this.m.charge.tryTransition(ChargeState.IDLE);
      }
      if (this.m.boost.state === BoostState.ACTIVE) { // boost took over
        this.m.charge.tryTransition(ChargeState.IDLE);
      }
    } else if (this.m.charge.state === ChargeState.FULL) {
      if (!this.m.input.boost) {
        this.m.charge.tryTransition(ChargeState.IDLE);
      }
    }
  }

  /**
   * Update action state machine
   */
  _updateActionState(dt) {
    const actionState = this.m.action.state;
    const movementState = this.m.movement.state;

    // Slide start: Boost ACTIVE + grounded + direction + down
    const canSlide = this.m.canSlide &&
      movementState === MovementState.GROUNDED &&
      this.m.boost.state === BoostState.ACTIVE &&
      (this.m.input.left || this.m.input.right) &&
      this.m.input.down;

    if (canSlide && actionState !== ActionState.SLIDING) {
      this._enterSlide();
      return;
    }

    // Slide cancellation logic
    if (actionState === ActionState.SLIDING) {
      const opposite = (this.m.slideDir > 0 && this.m.input.left) ||
                      (this.m.slideDir < 0 && this.m.input.right);
      
      if (!this.m.slideTimer.active || movementState !== MovementState.GROUNDED || opposite) {
        this.m.action.tryTransition(ActionState.IDLE);
      }
      return; // no other action updates during slide
    }

    // Jump handling: prioritize charge/boost variants
    const jumpPressed = this.m.input.jumpPressed || this.m.jumpBuffer.active;

    if (movementState === MovementState.GROUNDED) {
      if (jumpPressed) {
        // Choose which jump to perform
        if (this.m.canChargeJump && this.m.charge.state === ChargeState.FULL) {
          this._doChargeJump();
          return;
        }
        if (this.m.canBoostJump && this.m.boost.state === BoostState.ACTIVE) {
          this._doBoostJump();
          return;
        }
        // Normal jump
        this._doNormalJump();
        return;
      }
      
      // Walking/running/idle
      if (this.m.input.left || this.m.input.right) {
        this.m.action.tryTransition(ActionState.RUNNING);
      } else {
        this.m.action.tryTransition(ActionState.IDLE);
      }
    } else {
      // Airborne fallback
      if (actionState !== ActionState.BOOST_JUMPING && actionState !== ActionState.CHARGE_JUMPING) {
        this.m.action.tryTransition(ActionState.JUMPING);
      }
    }
  }

  /**
   * Execute ground slide ability
   */
  _enterSlide() {
    const duration = this.m.num(this.m.cfg.abilities.slide.durationMs, "slide.durationMs");
    const speed = this.m.num(this.m.cfg.abilities.slide.speed, "slide.speed");
    
    this.m.action.tryTransition(ActionState.SLIDING);
    this.m.slideTimer.start(duration);
    this.m.boostActionConsumed = true;
    
    // Exit boost window when consumed
    this.m.boost.tryTransition(BoostState.IDLE);
    
    // Set velocity and direction
    const direction = this.m.input.left ? -1 : 1;
    this.m.slideDir = direction;
    this.body.setVelocityX(speed * direction);
  }

  /**
   * Execute normal jump
   */
  _doNormalJump() {
    const vy = this.m.num(this.m.cfg.abilities.jump.normal.vy, "jump.normal.vy");
    this.body.setVelocityY(vy);
    this.m.action.tryTransition(ActionState.JUMPING);
    this.m.jumpBuffer.stop();
  }

  /**
   * Execute boost jump
   */
  _doBoostJump() {
    const vy = this.m.num(this.m.cfg.abilities.jump.boost.vy, "jump.boost.vy");
    const vx = this.m.num(this.m.cfg.abilities.jump.boost.vx, "jump.boost.vx");
    const direction = this.m.input.left ? -1 : (this.m.input.right ? 1 : 0);
    
    this.body.setVelocityY(vy);
    if (direction !== 0) {
      this.body.setVelocityX(vx * direction);
    }
    
    this.m.action.tryTransition(ActionState.BOOST_JUMPING);
    this.m.boostActionConsumed = true;
    this.m.boost.tryTransition(BoostState.IDLE);
    this.m.jumpBuffer.stop();
    
    // Set visual color for boost jump
    this.m.sprite.setTint(this.m.cfg.abilities.colors.boostJump);
  }

  /**
   * Execute charge jump
   */
  _doChargeJump() {
    const vy = this.m.num(this.m.cfg.abilities.jump.charge.vy, "jump.charge.vy");
    
    this.body.setVelocityY(vy);
    this.body.setVelocityX(0); // No horizontal movement
    
    this.m.action.tryTransition(ActionState.CHARGE_JUMPING);
    this.m.charge.tryTransition(ChargeState.IDLE);
    this.m.jumpBuffer.stop();
    
    // Set visual color for charge jump
    this.m.sprite.setTint(this.m.cfg.abilities.colors.chargeJump);
  }

  /**
   * Apply movement and physics each frame
   */
  _applyMotion(dt) {
    const movementState = this.m.movement.state;
    const actionState = this.m.action.state;
    const boostActive = this.m.boost.state === BoostState.ACTIVE;
    const charging = this.m.charge.state === ChargeState.CHARGING;
    
    const move = this.m.cfg.abilities.move;
    const boost = this.m.cfg.abilities.boost;
    const charge = this.m.cfg.abilities.charge;

    // Decide target speed based on current states
    let speed = this.m.num(move.speed, "move.speed");
    if (boostActive) {
      speed = this.m.num(boost.speed, "boost.speed");
    } else if (charging) {
      speed = this.m.num(charge.speed, "charge.speed");
    }

    // Special abilities handle their own movement
    if (actionState === ActionState.SLIDING || actionState === ActionState.BOOST_JUMPING) {
      // Allow directional air control during boost jump if enabled
      if (actionState === ActionState.BOOST_JUMPING && 
          this.m.cfg.abilities.jump.boost.airControlDuring) {
        if (this.m.input.left) {
          this.body.setVelocityX(-this.m.num(boost.speed, "boost.speed"));
        } else if (this.m.input.right) {
          this.body.setVelocityX(this.m.num(boost.speed, "boost.speed"));
        }
      }
      return;
    }

    // Normal movement control
    let x = 0;
    if (this.m.input.left) x -= 1;
    if (this.m.input.right) x += 1;

    let applied = speed * x;
    
    // Apply air control multiplier if airborne
    if (movementState === MovementState.AIRBORNE) {
      const airControl = this.m.num(move.airControl, "move.airControl");
      applied *= airControl;
    }
    
    this.body.setVelocityX(applied);
  }

  // ========== PUBLIC INPUT API ==========
  // These methods are called from the game scene to feed input to the controller

  /**
   * Handle jump button press
   */
  pressJump() {
    this.m.input.jumpPressed = true;
    this.m.input.jump = true;
    this.m.jumpBuffer.start(75); // 75ms buffer window
  }

  /**
   * Handle jump button release
   */
  releaseJump() {
    this.m.input.jump = false;
  }

  /**
   * Handle boost button press
   */
  pressBoost() {
    this.m.input.boostPressed = true;
    this.m.input.boost = true;
  }

  /**
   * Handle boost button release
   */
  releaseBoost() {
    this.m.input.boost = false;
  }

  /**
   * Set movement axis input
   * @param {boolean} left - Left input
   * @param {boolean} right - Right input
   * @param {boolean} up - Up input
   * @param {boolean} down - Down input
   */
  setAxis(left, right, up, down) {
    this.m.input.left = left;
    this.m.input.right = right;
    this.m.input.up = up;
    this.m.input.down = down;
  }

  /**
   * Clear "pressed" input flags at end of frame
   */
  endFrame() {
    this.m.input.jumpPressed = false;
    this.m.input.boostPressed = false;
  }
}
