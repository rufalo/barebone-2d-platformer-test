class Target {
    constructor(scene, x, y, group) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'target');
        this.sprite.setImmovable(true);
        this.sprite.setBounce(0);
        
        // Target properties
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.flashTimer = 0;
        
        // Visual setup
        this.originalTint = 0xFF6B6B;
        this.sprite.setTint(this.originalTint);
        
        // Add to group if provided
        if (group) {
            group.add(this.sprite);
        }
        
        // Store reference to this target in the sprite for collision handling
        this.sprite.targetInstance = this;
        
        // Create health indicator
        this.createHealthIndicator();
    }
    
    createHealthIndicator() {
        // Create health bar background (positioned relative to target)
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarBg.fillStyle(0x000000);
        this.healthBarBg.fillRect(-12, -20, 24, 4);
        this.healthBarBg.x = this.sprite.x;
        this.healthBarBg.y = this.sprite.y;
        
        // Create health bar fill
        this.healthBar = this.scene.add.graphics();
        this.healthBar.x = this.sprite.x;
        this.healthBar.y = this.sprite.y;
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        if (this.healthBar) {
            this.healthBar.clear();
            
            // Calculate health percentage
            const healthPercent = this.health / this.maxHealth;
            const width = 24 * healthPercent;
            
            // Color based on health
            let color = 0x00FF00; // Green
            if (healthPercent < 0.7) color = 0xFFFF00; // Yellow
            if (healthPercent < 0.3) color = 0xFF0000; // Red
            
            this.healthBar.fillStyle(color);
            this.healthBar.fillRect(-12, -20, width, 4);
            
            // Update position to follow target
            this.healthBar.x = this.sprite.x;
            this.healthBar.y = this.sprite.y;
            this.healthBarBg.x = this.sprite.x;
            this.healthBarBg.y = this.sprite.y;
        }
    }
    
    hit() {
        if (this.isDestroyed) return;
        
        this.health--;
        this.updateHealthBar();
        
        // Flash effect
        this.sprite.setTint(0xFFFFFF);
        this.flashTimer = 100;
        
        // Screen shake effect
        this.scene.cameras.main.shake(100, 0.01);
        
        if (this.health <= 0) {
            this.destroy();
        } else {
            // Return to original color after flash
            this.scene.time.delayedCall(100, () => {
                this.sprite.setTint(this.originalTint);
            });
        }
        
        // Create hit particle effect
        this.createHitEffect();
    }
    
    createHitEffect() {
        // Simple particle effect using graphics
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(0xFFD93D);
            particle.fillCircle(0, 0, 2);
            particle.x = this.sprite.x + (Math.random() - 0.5) * 20;
            particle.y = this.sprite.y + (Math.random() - 0.5) * 20;
            
            // Animate particle
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 100,
                y: particle.y + (Math.random() - 0.5) * 100 - 50,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        
        // Create destruction effect
        this.createDestructionEffect();
        
        // Remove health bar
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
        }
        
        // Destroy sprite after effect
        this.scene.time.delayedCall(200, () => {
            this.sprite.destroy();
        });
    }
    
    createDestructionEffect() {
        // Explosion effect
        for (let i = 0; i < 10; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(0xFF6B6B);
            particle.fillCircle(0, 0, 3);
            particle.x = this.sprite.x;
            particle.y = this.sprite.y;
            
            const angle = (i / 10) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * distance,
                y: particle.y + Math.sin(angle) * distance,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
        
        // Screen shake for destruction
        this.scene.cameras.main.shake(200, 0.02);
    }
    
    update() {
        if (this.isDestroyed) return;
        
        // Update flash effect
        if (this.flashTimer > 0) {
            this.flashTimer -= this.scene.game.loop.delta;
            if (this.flashTimer <= 0) {
                this.sprite.setTint(this.originalTint);
            }
        }
        
        // Update health bar position
        if (this.healthBar && this.healthBarBg) {
            this.healthBar.x = this.sprite.x;
            this.healthBar.y = this.sprite.y;
            this.healthBarBg.x = this.sprite.x;
            this.healthBarBg.y = this.sprite.y;
        }
    }
    
    // Static method to create multiple targets easily
    static createTargetLine(scene, startX, y, count, spacing, group) {
        const targets = [];
        for (let i = 0; i < count; i++) {
            const target = new Target(scene, startX + (i * spacing), y, group);
            targets.push(target);
        }
        return targets;
    }
    
    // Method to reset target (useful for respawning)
    reset() {
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.sprite.setTint(this.originalTint);
        this.sprite.setVisible(true);
        this.sprite.body.enable = true;
        this.updateHealthBar();
    }
}