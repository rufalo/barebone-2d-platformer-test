class DebugMenu {
    constructor() {
        this.player = null;
        this.defaultConfig = null;
        this.storageKey = 'platformer-debug-config';
        this.initializeDebugMenu();
    }

    setPlayer(player) {
        this.player = player;
        // Store default configuration for reset functionality
        this.defaultConfig = JSON.parse(JSON.stringify(player.config));
        this.defaultMovementSystems = JSON.parse(JSON.stringify(player.movementSystems));
        
        // Load saved config if it exists
        this.loadConfig();
        
        // Sync UI with current player config
        this.syncUIWithPlayer();
    }

    initializeDebugMenu() {
        // Ability toggles
        this.setupAbilityToggles();
        
        // Property sliders
        this.setupPropertySliders();
        
        // Reset button
        this.setupResetButton();
    }

    setupAbilityToggles() {
        const doubleJumpToggle = document.getElementById('doubleJumpEnabled');
        const dashToggle = document.getElementById('dashEnabled');
        const boostToggle = document.getElementById('boostEnabled');

        doubleJumpToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.doubleJumpEnabled = e.target.checked;
                this.saveConfig();
            }
            e.target.blur(); // Remove focus to prevent keyboard interference
        });

        dashToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.dashEnabled = e.target.checked;
                this.saveConfig();
            }
            e.target.blur(); // Remove focus to prevent keyboard interference
        });

        boostToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.boostEnabled = e.target.checked;
                this.saveConfig();
            }
            e.target.blur(); // Remove focus to prevent keyboard interference
        });

        // Movement system selector
        const movementSystemSelect = document.getElementById('movementSystemSelect');

        movementSystemSelect.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.versions.movementSystem = e.target.value;
                this.syncMovementSystemSliders();
                this.saveConfig();
            }
            e.target.blur(); // Remove focus to prevent keyboard interference
        });
    }

    setupPropertySliders() {
        // Movement properties
        this.setupSlider('speed', 'movement.speed');
        this.setupSlider('jumpVelocity', 'jump.velocity');
        
        // Jump properties
        this.setupSlider('coyoteTime', 'jump.coyoteTime');
        this.setupSlider('jumpBuffer', 'jump.bufferTime');
        
        // Movement system properties
        this.setupMovementSystemSlider('boostSpeed', 'boost', 'speed');
        this.setupMovementSystemSlider('boostDuration', 'boost', 'duration');
        this.setupMovementSystemSlider('boostJumpWindow', 'boost', 'jumpWindow');
        this.setupMovementSystemSlider('boostAirMomentumDuration', 'boost', 'airMomentumDuration');
        this.setupMovementSystemSlider('dashSpeed', 'dash', 'speed');
        this.setupMovementSystemSlider('dashDuration', 'dash', 'duration');
        this.setupMovementSystemSlider('dashCooldown', 'dash', 'cooldown');
    }

    setupSlider(elementId, configPath) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);

        if (!slider || !valueSpan) return;

        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueSpan.textContent = value;
            
            if (this.player) {
                this.setNestedProperty(this.player.config, configPath + '.value', value);
                this.saveConfig();
            }
        });
        
        // Remove focus when slider interaction ends
        slider.addEventListener('mouseup', (e) => {
            e.target.blur();
        });
    }

    setupMovementSystemSlider(elementId, abilityType, property) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);

        if (!slider || !valueSpan) return;

        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueSpan.textContent = value;
            
            if (this.player) {
                const currentSystem = this.player.config.versions.movementSystem;
                if (this.player.movementSystems[currentSystem][abilityType][property]) {
                    this.player.movementSystems[currentSystem][abilityType][property].value = value;
                    this.saveConfig();
                }
            }
        });
        
        // Remove focus when slider interaction ends
        slider.addEventListener('mouseup', (e) => {
            e.target.blur();
        });
    }

    setupResetButton() {
        const resetButton = document.getElementById('resetDefaults');
        resetButton.addEventListener('click', (e) => {
            this.resetToDefaults();
            e.target.blur(); // Remove focus to prevent keyboard interference
        });
    }

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    getNestedProperty(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (let key of keys) {
            current = current[key];
        }
        
        return current;
    }

    syncUIWithPlayer() {
        if (!this.player) return;

        // Sync ability toggles
        document.getElementById('doubleJumpEnabled').checked = this.player.config.abilities.doubleJumpEnabled;
        document.getElementById('dashEnabled').checked = this.player.config.abilities.dashEnabled;
        document.getElementById('boostEnabled').checked = this.player.config.abilities.boostEnabled;

        // Sync movement system selector
        document.getElementById('movementSystemSelect').value = this.player.config.versions.movementSystem;

        // Sync property sliders
        this.syncSlider('speed', 'movement.speed');
        this.syncSlider('jumpVelocity', 'jump.velocity');
        this.syncSlider('coyoteTime', 'jump.coyoteTime');
        this.syncSlider('jumpBuffer', 'jump.bufferTime');

        // Sync movement system property sliders
        this.syncMovementSystemSliders();
    }

    syncSlider(elementId, configPath) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);
        
        if (!slider || !valueSpan) return;

        const value = this.getNestedProperty(this.player.config, configPath + '.value');
        slider.value = value;
        valueSpan.textContent = value;
    }

    syncVersionedSlider(elementId, abilityType, property) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);
        
        if (!slider || !valueSpan) return;

        const currentVersion = this.player.config.versions[`${abilityType}Version`];
        const versionData = this.player.abilityVersions[abilityType][currentVersion];
        const config = versionData[property];
        
        // Check if property exists for this version
        if (!config) {
            // Hide the control if property doesn't exist for this version
            const control = slider.closest('.property-control');
            if (control) {
                control.style.display = 'none';
            }
            return;
        }
        
        // Show the control if it exists
        const control = slider.closest('.property-control');
        if (control) {
            control.style.display = 'block';
        }
        
        slider.min = config.min;
        slider.max = config.max;
        slider.value = config.value;
        valueSpan.textContent = config.value;
    }

    updateVersionLabels() {
        if (!this.player) return;

        const dashVersionLabel = document.getElementById('dashVersionLabel');
        const boostVersionLabel = document.getElementById('boostVersionLabel');

        if (dashVersionLabel) {
            dashVersionLabel.textContent = `(${this.player.config.versions.dashVersion})`;
        }
        if (boostVersionLabel) {
            boostVersionLabel.textContent = `(${this.player.config.versions.boostVersion})`;
        }
    }

    updateVersionProperties() {
        if (!this.player) return;

        // Update slider ranges and values when version changes
        this.syncVersionedSlider('boostSpeed', 'boost', 'speed');
        this.syncVersionedSlider('boostDuration', 'boost', 'duration');
        this.syncVersionedSlider('boostJumpWindow', 'boost', 'jumpWindow');
        this.syncVersionedSlider('boostAirMomentumDuration', 'boost', 'airMomentumDuration');
        this.syncVersionedSlider('dashSpeed', 'dash', 'speed');
        this.syncVersionedSlider('dashDuration', 'dash', 'duration');
        this.syncVersionedSlider('dashCooldown', 'dash', 'cooldown');
    }
    
    syncMovementSystemSliders() {
        if (!this.player) return;
        
        const currentSystem = this.player.config.versions.movementSystem;
        const system = this.player.movementSystems[currentSystem];
        
        // Sync boost properties
        this.syncMovementSystemSlider('boostSpeed', 'boost', 'speed');
        this.syncMovementSystemSlider('boostDuration', 'boost', 'duration');
        this.syncMovementSystemSlider('boostJumpWindow', 'boost', 'jumpWindow');
        this.syncMovementSystemSlider('boostAirMomentumDuration', 'boost', 'airMomentumDuration');
        
        // Sync dash properties  
        this.syncMovementSystemSlider('dashSpeed', 'dash', 'speed');
        this.syncMovementSystemSlider('dashDuration', 'dash', 'duration');
        this.syncMovementSystemSlider('dashCooldown', 'dash', 'cooldown');
    }
    
    syncMovementSystemSlider(elementId, abilityType, property) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);
        
        if (!slider || !valueSpan) return;
        
        const currentSystem = this.player.config.versions.movementSystem;
        const config = this.player.movementSystems[currentSystem][abilityType][property];
        
        // Check if property exists for this system
        if (!config) {
            // Hide the control if property doesn't exist
            const control = slider.closest('.property-control');
            if (control) {
                control.style.display = 'none';
            }
            return;
        }
        
        // Show the control if it exists
        const control = slider.closest('.property-control');
        if (control) {
            control.style.display = 'block';
        }
        
        slider.min = config.min;
        slider.max = config.max;
        slider.value = config.value;
        valueSpan.textContent = config.value;
    }

    saveConfig() {
        if (!this.player) return;

        try {
            const configData = {
                config: this.player.config,
                movementSystems: this.player.movementSystems,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(configData));
            this.showSaveIndicator();
        } catch (error) {
            console.warn('Failed to save debug config:', error);
        }
    }

    loadConfig() {
        if (!this.player) return;

        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) return;

            const configData = JSON.parse(savedData);
            
            // Merge saved config with current config, preserving structure
            if (configData.config) {
                this.player.config = this.deepMerge(this.player.config, configData.config);
            }
            
            if (configData.movementSystems) {
                this.player.movementSystems = this.deepMerge(this.player.movementSystems, configData.movementSystems);
            }

            console.log('Loaded saved debug configuration');
        } catch (error) {
            console.warn('Failed to load debug config:', error);
            // Clear corrupted data
            localStorage.removeItem(this.storageKey);
        }
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    showSaveIndicator() {
        // Create a temporary save indicator
        const indicator = document.createElement('div');
        indicator.textContent = 'Saved!';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(indicator);
        
        // Animate in
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
        });
        
        // Remove after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    document.body.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }

    resetToDefaults() {
        if (!this.player || !this.defaultConfig) return;

        // Deep copy default config back to player
        this.player.config = JSON.parse(JSON.stringify(this.defaultConfig));
        
        // Reset movement systems to defaults
        this.player.movementSystems = JSON.parse(JSON.stringify(this.defaultMovementSystems));
        
        // Clear saved data
        localStorage.removeItem(this.storageKey);
        
        // Sync UI with reset values
        this.syncUIWithPlayer();
        
        // Show reset indicator
        this.showResetIndicator();
    }

    showResetIndicator() {
        // Create a temporary reset indicator
        const indicator = document.createElement('div');
        indicator.textContent = 'Reset to Defaults!';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF9800;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(indicator);
        
        // Animate in
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
        });
        
        // Remove after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    document.body.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }
}

// Initialize debug menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.debugMenu = new DebugMenu();
});