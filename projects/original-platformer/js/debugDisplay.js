class DebugDisplay {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.stateManager = player.stateManager; // Will be set when state manager is integrated
        
        // Debug display elements
        this.debugContainer = null;
        this.stateText = null;
        this.velocityText = null;
        this.energyText = null;
        this.statusText = null;
        this.historyText = null;
        this.energyBar = null;
        this.energyBarBg = null;
        
        // Configuration
        this.config = {
            x: 15,
            y: 60,
            lineHeight: 20,
            fontSize: '13px',
            fontFamily: 'Courier New',
            textColor: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 15,
            energyBarWidth: 180,
            energyBarHeight: 12
        };
        
        this.createDebugElements();
    }
    
    createDebugElements() {
        const config = this.config;
        
        // Create background panel (slimmer width)
        this.debugPanel = this.scene.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRoundedRect(config.x - config.padding, config.y - config.padding, 300, 400, 8)
            .setScrollFactor(0)
            .setDepth(1000);
        
        // State information (lines 0-1)
        this.stateText = this.scene.add.text(config.x, config.y, '', {
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fill: config.textColor
        }).setScrollFactor(0).setDepth(1001);
        
        // Velocity information (lines 3-4)
        this.velocityText = this.scene.add.text(config.x, config.y + config.lineHeight * 3, '', {
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fill: config.textColor
        }).setScrollFactor(0).setDepth(1001);
        
        // Energy information (line 6)
        this.energyText = this.scene.add.text(config.x, config.y + config.lineHeight * 6, '', {
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fill: config.textColor
        }).setScrollFactor(0).setDepth(1001);
        
        // Energy bar background (line 7.5)
        this.energyBarBg = this.scene.add.graphics()
            .fillStyle(0x333333)
            .fillRect(config.x, config.y + config.lineHeight * 7.5, config.energyBarWidth, config.energyBarHeight)
            .setScrollFactor(0)
            .setDepth(1001);
            
        // Energy bar fill
        this.energyBar = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(1002);
        
        // Status flags (lines 9-13)
        this.statusText = this.scene.add.text(config.x, config.y + config.lineHeight * 9, '', {
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fill: config.textColor
        }).setScrollFactor(0).setDepth(1001);
        
        // State history (lines 15+)
        this.historyText = this.scene.add.text(config.x, config.y + config.lineHeight * 15, '', {
            fontSize: '11px',
            fontFamily: config.fontFamily,
            fill: '#CCCCCC'
        }).setScrollFactor(0).setDepth(1001);
    }
    
    update() {
        if (!this.player) return;
        
        // Update state information
        this.updateStateDisplay();
        
        // Update velocity information
        this.updateVelocityDisplay();
        
        // Update energy display (if state manager exists)
        if (this.stateManager) {
            this.updateEnergyDisplay();
            this.updateStatusDisplay();
            this.updateHistoryDisplay();
        } else {
            // Fallback display when state manager isn't integrated yet
            this.updateFallbackDisplay();
        }
    }
    
    updateStateDisplay() {
        let stateInfo = '';
        
        if (this.stateManager) {
            const debug = this.stateManager.getDebugInfo();
            stateInfo = `Base: ${debug.baseState}`;
            if (debug.boostState) {
                stateInfo += `\nBoost: ${debug.boostState}`;
            } else {
                stateInfo += `\nBoost: none`;
            }
        } else {
            // Fallback to current boolean flags
            const states = [];
            if (this.player.isDashing) states.push('dashing');
            if (this.player.isSliding) states.push('sliding');
            if (this.player.isWallSliding) states.push('wall_sliding');
            if (this.player.isCrouching) states.push('crouching');
            if (this.player.isSprinting) states.push('sprinting');
            if (this.player.isBoosting) states.push('boosting');
            if (!this.player.isGrounded && this.player.sprite.body.velocity.y < -50) states.push('jumping');
            if (!this.player.isGrounded && this.player.sprite.body.velocity.y > 50) states.push('falling');
            if (this.player.isGrounded && Math.abs(this.player.sprite.body.velocity.x) > 50) states.push('moving');
            if (states.length === 0) states.push('idle');
            
            stateInfo = `State: ${states.join(', ')}`;
        }
        
        this.stateText.setText(stateInfo);
    }
    
    updateVelocityDisplay() {
        const vel = this.player.sprite.body.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        
        const velocityInfo = `Velocity: ${vel.x.toFixed(0)}, ${vel.y.toFixed(0)}\nSpeed: ${speed.toFixed(0)}`;
        this.velocityText.setText(velocityInfo);
    }
    
    updateEnergyDisplay() {
        if (!this.stateManager) return;
        
        const debug = this.stateManager.getDebugInfo();
        const energyInfo = `Energy: ${debug.energy.current}/${debug.energy.max} (${debug.energy.percentage}%)`;
        this.energyText.setText(energyInfo);
        
        // Update energy bar
        const fillWidth = (debug.energy.current / debug.energy.max) * this.config.energyBarWidth;
        const intensity = debug.energy.current / debug.energy.max;
        
        // Color coding: red (low) -> yellow (medium) -> green (high)
        let barColor = 0xFF0000; // Red
        if (intensity > 0.3) {
            barColor = 0xFFFF00; // Yellow
        }
        if (intensity > 0.7) {
            barColor = 0x00FF00; // Green
        }
        
        this.energyBar.clear()
            .fillStyle(barColor)
            .fillRect(this.config.x, this.config.y + this.config.lineHeight * 7.5, fillWidth, this.config.energyBarHeight);
    }
    
    updateStatusDisplay() {
        if (!this.stateManager) return;
        
        const debug = this.stateManager.getDebugInfo();
        const flags = debug.statusFlags;
        
        const statusInfo = [
            `Grounded: ${flags.grounded}`,
            `Facing: ${flags.facing_direction > 0 ? 'Right' : 'Left'}`,
            `Can Dash: ${flags.can_dash}`,
            `Can Jump: ${flags.can_double_jump}`,
            `Chainable: ${debug.canChain.jump}|${debug.canChain.dash}|${debug.canChain.wall}`
        ].join('\n');
        
        this.statusText.setText(statusInfo);
    }
    
    updateHistoryDisplay() {
        if (!this.stateManager) return;
        
        const history = this.stateManager.stateHistory.slice(0, 2);
        let historyInfo = 'Recent Transitions:\n';
        
        history.forEach((entry, index) => {
            const age = Math.round((Date.now() - entry.timestamp) / 100) * 100; // Round to nearest 100ms
            const fromState = (entry.from || 'null').substring(0, 8); // Truncate long state names
            const toState = (entry.to || 'null').substring(0, 8);
            historyInfo += `${entry.type}: ${fromState}→${toState} (${age}ms)\n`;
        });
        
        this.historyText.setText(historyInfo);
    }
    
    updateFallbackDisplay() {
        // Show basic timer information when state manager isn't available
        const timers = [];
        
        if (this.player.dashTimer > 0) {
            timers.push(`Dash: ${Math.round(this.player.dashTimer)}ms`);
        }
        if (this.player.boostTimer > 0) {
            timers.push(`Boost: ${Math.round(this.player.boostTimer)}ms`);
        }
        if (this.player.slideTimer > 0) {
            timers.push(`Slide: ${Math.round(this.player.slideTimer)}ms`);
        }
        if (this.player.coyoteTimer > 0) {
            timers.push(`Coyote: ${Math.round(this.player.coyoteTimer)}ms`);
        }
        
        const timerInfo = timers.length > 0 ? timers.join('\n') : 'No active timers';
        this.energyText.setText(`Timers:\n${timerInfo}`);
        
        // Show abilities status
        const abilities = [
            `Grounded: ${this.player.isGrounded}`,
            `Can Dash: ${this.player.canDash}`,
            `Can Jump: ${this.player.canDoubleJump}`,
            `Wall Side: ${this.player.wallSide || 'none'}`
        ].join('\n');
        
        this.statusText.setText(abilities);
        
        this.historyText.setText('State Manager not integrated');
    }
    
    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }
    
    show() {
        this.debugPanel.setVisible(true);
        this.stateText.setVisible(true);
        this.velocityText.setVisible(true);
        this.energyText.setVisible(true);
        this.energyBar.setVisible(true);
        this.energyBarBg.setVisible(true);
        this.statusText.setVisible(true);
        this.historyText.setVisible(true);
    }
    
    hide() {
        this.debugPanel.setVisible(false);
        this.stateText.setVisible(false);
        this.velocityText.setVisible(false);
        this.energyText.setVisible(false);
        this.energyBar.setVisible(false);
        this.energyBarBg.setVisible(false);
        this.statusText.setVisible(false);
        this.historyText.setVisible(false);
    }
    
    destroy() {
        if (this.debugPanel) this.debugPanel.destroy();
        if (this.stateText) this.stateText.destroy();
        if (this.velocityText) this.velocityText.destroy();
        if (this.energyText) this.energyText.destroy();
        if (this.energyBar) this.energyBar.destroy();
        if (this.energyBarBg) this.energyBarBg.destroy();
        if (this.statusText) this.statusText.destroy();
        if (this.historyText) this.historyText.destroy();
    }
}