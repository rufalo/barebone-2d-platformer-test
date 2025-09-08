/*
============================================================================
FINITE STATE MACHINE SYSTEM
============================================================================

This file provides the core state machine infrastructure:
- TimedFlag: A timer that can be started, ticked, and checked for activity
- StateMachine: A simple state machine with enter/exit callbacks and guards

These are reusable components that make state management clean and explicit.
============================================================================
*/

/**
 * A timer that tracks remaining time and can be started, ticked, and checked.
 * Used for boost windows, slide duration, jump buffering, etc.
 */
export class TimedFlag {
  constructor(ms = 0) { 
    this.remaining = ms; 
  }
  
  /**
   * Start the timer with the given duration in milliseconds
   */
  start(ms) { 
    this.remaining = ms; 
  }
  
  /**
   * Decrease the timer by delta time
   */
  tick(dt) { 
    if (this.remaining > 0) {
      this.remaining = Math.max(0, this.remaining - dt); 
    }
  }
  
  /**
   * Check if the timer is still active (has time remaining)
   */
  get active() { 
    return this.remaining > 0; 
  }
  
  /**
   * Stop the timer immediately
   */
  stop() { 
    this.remaining = 0; 
  }
}

/**
 * A simple state machine with enter/exit callbacks and transition guards.
 * Provides a clean way to manage state transitions with side effects.
 */
export class StateMachine {
  constructor(initial) {
    this.state = initial;
    this._onEnter = new Map();
    this._onExit = new Map();
  }
  
  /**
   * Register a callback to run when entering a state
   * @param {string} stateName - The state to listen for
   * @param {function} callback - Function to call on enter (from, to, context)
   * @returns {StateMachine} - For method chaining
   */
  onEnter(stateName, callback) { 
    this._onEnter.set(stateName, callback); 
    return this; 
  }
  
  /**
   * Register a callback to run when exiting a state
   * @param {string} stateName - The state to listen for
   * @param {function} callback - Function to call on exit (from, to, context)
   * @returns {StateMachine} - For method chaining
   */
  onExit(stateName, callback) { 
    this._onExit.set(stateName, callback); 
    return this; 
  }

  /**
   * Attempt to transition to a new state
   * @param {string} to - Target state
   * @param {function} guardFn - Optional guard function that must return true to allow transition
   * @param {*} context - Optional context passed to guard and callbacks
   * @returns {boolean} - True if transition occurred, false if blocked
   */
  tryTransition(to, guardFn = null, context = null) {
    // Don't transition to the same state
    if (to === this.state) return false;
    
    // Check guard function if provided
    if (guardFn && !guardFn(context)) return false;
    
    const from = this.state;
    
    // Call exit callback for current state
    if (this._onExit.has(from)) {
      this._onExit.get(from)(from, to, context);
    }
    
    // Change state
    this.state = to;
    
    // Call enter callback for new state
    if (this._onEnter.has(to)) {
      this._onEnter.get(to)(from, to, context);
    }
    
    return true;
  }
}
