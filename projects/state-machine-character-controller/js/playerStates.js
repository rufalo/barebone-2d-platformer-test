/*
============================================================================
PLAYER STATE ENUMS - CLEAR STATE DEFINITIONS
============================================================================

This file defines all the possible states for the character controller.
Each state machine has its own enum to make transitions explicit and
prevent invalid state combinations.

The states are organized into logical groups:
- MovementState: Where the player is (grounded, airborne, submerged)
- ActionState: What the player is doing (idle, running, jumping, etc.)
- BoostState: Boost system state (idle, armed, active)
- ChargeState: Charge system state (idle, charging, full)
============================================================================
*/

export const MovementState = Object.freeze({
  GROUNDED: "grounded",
  AIRBORNE: "airborne", 
  SUBMERGED: "submerged", // for future water mechanics
});

export const ActionState = Object.freeze({
  IDLE: "idle",
  RUNNING: "running",
  JUMPING: "jumping",
  BOOST_JUMPING: "boost-jumping",
  CHARGE_JUMPING: "charge-jumping",
  SLIDING: "ground-sliding",
  // Future actions can be added here:
  // WALL_RUNNING: "wall-running",
  // DASHING: "dashing",
  // DOUBLE_JUMPING: "double-jumping",
});

export const BoostState = Object.freeze({
  IDLE: "boost-idle",        // no boost active
  ARMED: "boost-on",         // shift pressed, ready to activate when grounded
  ACTIVE: "boosting",        // boost window is active
});

export const ChargeState = Object.freeze({
  IDLE: "idle",              // not charging
  CHARGING: "charging",      // building up charge
  FULL: "charge-full",       // fully charged and ready
});
