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
        this.defaultAbilityVersions = JSON.parse(JSON.stringify(player.abilityVersions));
        
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
        const sprintToggle = document.getElementById('sprintEnabled');

        doubleJumpToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.doubleJumpEnabled = e.target.checked;
                this.saveConfig();
            }
        });

        dashToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.dashEnabled = e.target.checked;
                this.saveConfig();
            }
        });

        sprintToggle.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.abilities.sprintEnabled = e.target.checked;
                this.saveConfig();
            }
        });

        // Version selectors
        const dashVersionSelect = document.getElementById('dashVersionSelect');
        const sprintVersionSelect = document.getElementById('sprintVersionSelect');

        dashVersionSelect.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.versions.dashVersion = e.target.value;
                this.updateVersionLabels();
                this.updateVersionProperties();
                this.saveConfig();
            }
        });

        sprintVersionSelect.addEventListener('change', (e) => {
            if (this.player) {
                this.player.config.versions.sprintVersion = e.target.value;
                this.updateVersionLabels();
                this.updateVersionProperties();
                this.saveConfig();
            }
        });
    }

    setupPropertySliders() {
        // Movement properties
        this.setupSlider('speed', 'movement.speed');
        this.setupSlider('jumpVelocity', 'jump.velocity');
        
        // Jump properties
        this.setupSlider('coyoteTime', 'jump.coyoteTime');
        this.setupSlider('jumpBuffer', 'jump.bufferTime');
        
        // Versioned ability properties
        this.setupVersionedSlider('sprintSpeed', 'sprint', 'speed');
        this.setupVersionedSlider('sprintDuration', 'sprint', 'duration');
        this.setupVersionedSlider('sprintJumpWindow', 'sprint', 'jumpWindow');
        this.setupVersionedSlider('sprintAirMomentumDuration', 'sprint', 'airMomentumDuration');
        this.setupVersionedSlider('dashSpeed', 'dash', 'speed');
        this.setupVersionedSlider('dashDuration', 'dash', 'duration');
        this.setupVersionedSlider('dashCooldown', 'dash', 'cooldown');
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
    }

    setupVersionedSlider(elementId, abilityType, property) {
        const slider = document.getElementById(`${elementId}Slider`);
        const valueSpan = document.getElementById(`${elementId}Value`);

        if (!slider || !valueSpan) return;

        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueSpan.textContent = value;
            
            if (this.player) {
                const currentVersion = this.player.config.versions[`${abilityType}Version`];
                this.player.abilityVersions[abilityType][currentVersion][property].value = value;
                this.saveConfig();
            }
        });
    }

    setupResetButton() {
        const resetButton = document.getElementById('resetDefaults');
        resetButton.addEventListener('click', () => {
            this.resetToDefaults();
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
        document.getElementById('sprintEnabled').checked = this.player.config.abilities.sprintEnabled;

        // Sync version selectors
        document.getElementById('dashVersionSelect').value = this.player.config.versions.dashVersion;
        document.getElementById('sprintVersionSelect').value = this.player.config.versions.sprintVersion;

        // Update version labels
        this.updateVersionLabels();

        // Sync property sliders
        this.syncSlider('speed', 'movement.speed');
        this.syncSlider('jumpVelocity', 'jump.velocity');
        this.syncSlider('coyoteTime', 'jump.coyoteTime');
        this.syncSlider('jumpBuffer', 'jump.bufferTime');

        // Sync versioned property sliders
        this.syncVersionedSlider('sprintSpeed', 'sprint', 'speed');
        this.syncVersionedSlider('sprintDuration', 'sprint', 'duration');
        this.syncVersionedSlider('sprintJumpWindow', 'sprint', 'jumpWindow');
        this.syncVersionedSlider('sprintAirMomentumDuration', 'sprint', 'airMomentumDuration');
        this.syncVersionedSlider('dashSpeed', 'dash', 'speed');
        this.syncVersionedSlider('dashDuration', 'dash', 'duration');
        this.syncVersionedSlider('dashCooldown', 'dash', 'cooldown');
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
        const sprintVersionLabel = document.getElementById('sprintVersionLabel');

        if (dashVersionLabel) {
            dashVersionLabel.textContent = `(${this.player.config.versions.dashVersion})`;
        }
        if (sprintVersionLabel) {
            sprintVersionLabel.textContent = `(${this.player.config.versions.sprintVersion})`;
        }
    }

    updateVersionProperties() {
        if (!this.player) return;

        // Update slider ranges and values when version changes
        this.syncVersionedSlider('sprintSpeed', 'sprint', 'speed');
        this.syncVersionedSlider('sprintDuration', 'sprint', 'duration');
        this.syncVersionedSlider('sprintJumpWindow', 'sprint', 'jumpWindow');
        this.syncVersionedSlider('sprintAirMomentumDuration', 'sprint', 'airMomentumDuration');
        this.syncVersionedSlider('dashSpeed', 'dash', 'speed');
        this.syncVersionedSlider('dashDuration', 'dash', 'duration');
        this.syncVersionedSlider('dashCooldown', 'dash', 'cooldown');
    }

    saveConfig() {
        if (!this.player) return;

        try {
            const configData = {
                config: this.player.config,
                abilityVersions: this.player.abilityVersions,
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
            
            if (configData.abilityVersions) {
                this.player.abilityVersions = this.deepMerge(this.player.abilityVersions, configData.abilityVersions);
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
        
        // Reset ability versions to defaults
        this.player.abilityVersions = JSON.parse(JSON.stringify(this.defaultAbilityVersions));
        
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