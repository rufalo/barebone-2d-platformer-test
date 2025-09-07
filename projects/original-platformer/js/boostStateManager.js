class BoostStateManager {
    constructor(player) {
        this.player = player;
        
        // Base States (exclusive - only one active at a time)
        this.baseStates = {
            idle: 'idle',
            walking: 'walking', 
            running: 'running',
            jumping: 'jumping',
            falling: 'falling',
            wall_sliding: 'wall_sliding',
            crouching: 'crouching',
            dashing: 'dashing',
            sliding: 'sliding'
        };
        
        // Boost States (enhancement layer)
        this.boostStates = {
            boost_ready: 'boost_ready',
            boost_active: 'boost_active',
            boost_jump: 'boost_jump',
            boost_dash: 'boost_dash',
            boost_wallrun: 'boost_wallrun'
        };
        
        // Status Flags (concurrent - multiple can be true)
        this.statusFlags = {
            boost_chainable: false,
            boost_energy_full: true,
            boost_momentum: false,
            can_wall_kick: true,
            facing_direction: 1, // 1 for right, -1 for left
            grounded: false,
            can_double_jump: true,
            can_dash: true
        };
        
        // Current states
        this.currentBaseState = this.baseStates.idle;
        this.currentBoostState = null;
        
        // Energy system (in milliseconds)
        this.energy = {
            current: 300, // Base energy
            max: 1000, // Maximum with chains
            base: 300, // Base amount
            chainExtension: 200, // Added per chain action
            cooldownRate: 500, // Energy restored per second during cooldown
            lastUsed: 0,
            cooldownDuration: 500 // How long before energy starts restoring
        };
        
        // Chain timing windows (in milliseconds)
        this.chainWindows = {
            jump: 200,
            dash: 150,
            wall: 300
        };
        
        // State transition history for debugging
        this.stateHistory = [];
        this.maxHistoryLength = 10;
    }
    
    // Base state management
    setBaseState(newState) {
        if (this.currentBaseState !== newState) {
            const oldState = this.currentBaseState;
            this.currentBaseState = newState;
            this.addToHistory('base', oldState, newState);
            
            // Handle state-specific logic
            this.onBaseStateEnter(newState, oldState);
        }
    }
    
    getBaseState() {
        return this.currentBaseState;
    }
    
    // Boost state management
    setBoostState(newState) {
        if (this.currentBoostState !== newState) {
            const oldState = this.currentBoostState;
            this.currentBoostState = newState;
            this.addToHistory('boost', oldState, newState);
            
            // Handle state-specific logic
            this.onBoostStateEnter(newState, oldState);
        }
    }
    
    getBoostState() {
        return this.currentBoostState;
    }
    
    clearBoostState() {
        this.setBoostState(null);
    }
    
    // Status flag management
    setStatusFlag(flag, value) {
        if (this.statusFlags.hasOwnProperty(flag)) {
            this.statusFlags[flag] = value;
        }
    }
    
    getStatusFlag(flag) {
        return this.statusFlags[flag] || false;
    }
    
    // Energy system
    hasEnergy(amount = 0) {
        return this.energy.current >= amount;
    }
    
    useEnergy(amount) {
        if (this.hasEnergy(amount)) {
            this.energy.current -= amount;
            this.energy.lastUsed = Date.now();
            this.statusFlags.boost_energy_full = this.energy.current >= this.energy.base;
            return true;
        }
        return false;
    }
    
    extendEnergy(amount) {
        this.energy.current = Math.min(this.energy.max, this.energy.current + amount);
        this.statusFlags.boost_energy_full = this.energy.current >= this.energy.base;
    }
    
    updateEnergy(delta) {
        const now = Date.now();
        const timeSinceLastUse = now - this.energy.lastUsed;
        
        // Only restore energy after cooldown period
        if (timeSinceLastUse > this.energy.cooldownDuration && this.energy.current < this.energy.base) {
            const restoration = (this.energy.cooldownRate * delta) / 1000; // Convert to per-frame
            this.energy.current = Math.min(this.energy.base, this.energy.current + restoration);
            this.statusFlags.boost_energy_full = this.energy.current >= this.energy.base;
        }
    }
    
    // Chain system
    canChainAction(actionType) {
        if (!this.currentBoostState) return false;
        
        const window = this.chainWindows[actionType];
        if (!window) return false;
        
        const timeSinceLastUse = Date.now() - this.energy.lastUsed;
        return timeSinceLastUse <= window;
    }
    
    performChainAction(actionType) {
        if (this.canChainAction(actionType)) {
            this.extendEnergy(this.energy.chainExtension);
            this.statusFlags.boost_chainable = true;
            return true;
        }
        return false;
    }
    
    // State transition handlers
    onBaseStateEnter(newState, oldState) {
        // Handle visual feedback and state-specific logic
        switch (newState) {
            case this.baseStates.idle:
                this.clearBoostState();
                break;
            case this.baseStates.dashing:
                this.setBoostState(this.boostStates.boost_dash);
                break;
            case this.baseStates.wall_sliding:
                if (this.currentBoostState === this.boostStates.boost_active) {
                    this.setBoostState(this.boostStates.boost_wallrun);
                }
                break;
        }
    }
    
    onBoostStateEnter(newState, oldState) {
        // Handle boost state transitions
        if (newState === this.boostStates.boost_active) {
            this.statusFlags.boost_chainable = true;
        } else if (newState === null) {
            this.statusFlags.boost_chainable = false;
            this.statusFlags.boost_momentum = false;
        }
    }
    
    // History tracking
    addToHistory(type, oldState, newState) {
        this.stateHistory.unshift({
            type: type,
            from: oldState,
            to: newState,
            timestamp: Date.now()
        });
        
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.pop();
        }
    }
    
    // Debug information
    getDebugInfo() {
        return {
            baseState: this.currentBaseState,
            boostState: this.currentBoostState,
            energy: {
                current: Math.round(this.energy.current),
                max: this.energy.max,
                percentage: Math.round((this.energy.current / this.energy.max) * 100)
            },
            statusFlags: { ...this.statusFlags },
            canChain: {
                jump: this.canChainAction('jump'),
                dash: this.canChainAction('dash'),
                wall: this.canChainAction('wall')
            }
        };
    }
    
    // State management methods for player actions
    startBoost() {
        if (this.hasEnergy(this.energy.base)) {
            this.useEnergy(this.energy.base);
            this.setBoostState(this.boostStates.boost_active);
            return true;
        }
        return false;
    }
    
    startDash() {
        if (this.currentBoostState) {
            this.setBoostState(this.boostStates.boost_dash);
            // Chain dash extends energy
            this.performChainAction('dash');
        }
    }
    
    startJump() {
        if (this.currentBoostState) {
            this.setBoostState(this.boostStates.boost_jump);
            // Chain jump extends energy
            this.performChainAction('jump');
        }
    }
    
    startWallRun() {
        if (this.currentBoostState) {
            this.setBoostState(this.boostStates.boost_wallrun);
            // Chain wall run extends energy
            this.performChainAction('wall');
        }
    }
    
    // Update method called each frame
    update(delta) {
        this.updateEnergy(delta);
        
        // Update base state based on player conditions
        this.updateBaseStateFromPlayer();
        
        // Update status flags
        this.updateStatusFlags();
    }
    
    updateBaseStateFromPlayer() {
        const p = this.player;
        
        // Determine base state from player conditions
        if (p.isDashing) {
            this.setBaseState(this.baseStates.dashing);
        } else if (p.isSliding) {
            this.setBaseState(this.baseStates.sliding);
        } else if (p.isWallSliding) {
            this.setBaseState(this.baseStates.wall_sliding);
        } else if (p.isCrouching) {
            this.setBaseState(this.baseStates.crouching);
        } else if (!p.isGrounded && p.sprite.body.velocity.y < -50) {
            this.setBaseState(this.baseStates.jumping);
        } else if (!p.isGrounded && p.sprite.body.velocity.y > 50) {
            this.setBaseState(this.baseStates.falling);
        } else if (p.isGrounded && Math.abs(p.sprite.body.velocity.x) > 50) {
            if (p.isSprinting || p.isBoosting) {
                this.setBaseState(this.baseStates.running);
            } else {
                this.setBaseState(this.baseStates.walking);
            }
        } else {
            this.setBaseState(this.baseStates.idle);
        }
    }
    
    updateStatusFlags() {
        const p = this.player;
        
        this.statusFlags.grounded = p.isGrounded;
        this.statusFlags.facing_direction = p.facingRight ? 1 : -1;
        this.statusFlags.can_double_jump = p.canDoubleJump;
        this.statusFlags.can_dash = p.canDash;
        this.statusFlags.can_wall_kick = p.canWallKick;
        
        // Update boost momentum based on current velocity and boost state
        this.statusFlags.boost_momentum = this.currentBoostState !== null && 
                                         (Math.abs(p.sprite.body.velocity.x) > 200 || 
                                          Math.abs(p.sprite.body.velocity.y) > 200);
    }
    
    // Visual feedback methods
    getStateColor() {
        // Priority: boost state > base state
        if (this.currentBoostState) {
            switch (this.currentBoostState) {
                case this.boostStates.boost_active:
                    return 0x00FF99; // Green for active boost
                case this.boostStates.boost_jump:
                    return 0x00FFFF; // Cyan for boost jump
                case this.boostStates.boost_dash:
                    return 0x9400D3; // Purple for boost dash
                case this.boostStates.boost_wallrun:
                    return 0x00FF00; // Bright green for wallrun
                default:
                    return 0x00FF99;
            }
        }
        
        // Base state colors
        switch (this.currentBaseState) {
            case this.baseStates.dashing:
                return 0xFF0000; // Red for dash
            case this.baseStates.wall_sliding:
                return 0x00AAFF; // Blue for wall slide
            case this.baseStates.sliding:
                return 0xFFA500; // Orange for slide
            case this.baseStates.crouching:
                return 0xFF0000; // Red for crouch
            case this.baseStates.running:
                return 0xFFFF99; // Light yellow for running
            default:
                return !this.statusFlags.can_dash ? 0x999999 : 0xFFFFFF; // Gray when dash on cooldown, white otherwise
        }
    }
    
    getEnergyIntensity() {
        return this.energy.current / this.energy.max;
    }
}