class Level {
    constructor(scene) {
        this.scene = scene;
        this.platforms = scene.physics.add.staticGroup();
        this.movingPlatforms = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        
        // Trigger zones for platform detection
        this.platformTriggers = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        
        this.createLevel();
    }
    
    createLevel() {
        // Ground platforms
        this.createPlatform(64, 568, 'ground');
        this.createPlatform(192, 568, 'ground');
        this.createPlatform(320, 568, 'ground');
        this.createPlatform(448, 568, 'ground');
        this.createPlatform(576, 568, 'ground');
        this.createPlatform(704, 568, 'ground');
        this.createPlatform(832, 568, 'ground');
        this.createPlatform(960, 568, 'ground');
        this.createPlatform(1088, 568, 'ground');
        
        // Mid-level platforms for jumping
        this.createPlatform(200, 450, 'platform');
        this.createPlatform(400, 380, 'platform');
        this.createPlatform(600, 320, 'platform');
        this.createPlatform(800, 280, 'platform');
        this.createPlatform(1000, 220, 'platform');
        
        // Higher platforms
        this.createPlatform(300, 250, 'platform');
        this.createPlatform(500, 180, 'platform');
        this.createPlatform(700, 150, 'platform');
        this.createPlatform(900, 100, 'platform');
        
        // Some scattered platforms for parkour
        this.createPlatform(150, 350, 'platform');
        this.createPlatform(750, 380, 'platform');
        this.createPlatform(950, 320, 'platform');
        
        // Create a moving platform (example for future expansion)
        this.createMovingPlatform(400, 500, 600, 500);
    }
    
    createPlatform(x, y, texture = 'platform') {
        const platform = this.scene.physics.add.staticSprite(x, y, texture);
        platform.setOrigin(0.5, 0.5);
        this.platforms.add(platform);
        
        // Add some visual variety
        if (texture === 'platform') {
            const tints = [0x8B4513, 0xA0522D, 0x654321];
            platform.setTint(tints[Math.floor(Math.random() * tints.length)]);
        }
        
        return platform;
    }
    
    createMovingPlatform(startX, startY, endX, endY, speed = 50) {
        // Create the platform the same way as the test platform that worked
        const platform = this.scene.physics.add.sprite(startX, startY, 'platform');
        platform.body.allowGravity = false;
        platform.body.immovable = true;
        platform.setTint(0xFF4500); // Bright orange/red to clearly distinguish moving platforms
        
        // Store movement properties
        platform.startX = startX;
        platform.endX = endX;
        platform.speed = Math.abs(speed);
        platform.direction = 1; // 1 for right, -1 for left
        
        // Create trigger zone on top of platform for "riding" detection
        const topTrigger = this.scene.physics.add.sprite(startX, startY - 8, 'platform');
        topTrigger.body.allowGravity = false;
        topTrigger.body.immovable = true;
        
        // Make trigger visible for debugging with distinct colors
        topTrigger.setVisible(true);
        topTrigger.setTint(0x00FF00); // Green for trigger zone (debug)
        topTrigger.setAlpha(0.5); // Semi-transparent so we can see through it
        topTrigger.body.setSize(64, 4); // Thin trigger zone on top
        
        // Store reference to parent platform
        topTrigger.parentPlatform = platform;
        platform.topTrigger = topTrigger;
        
        // Add to groups
        this.movingPlatforms.add(platform);
        this.platformTriggers.add(topTrigger);
        
        
        // Store update function for movement
        platform.updateMovement = () => {
            if (platform.active && platform.body && topTrigger.active) {
                const oldX = platform.x;
                
                // Move platform manually (not using velocity to avoid physics conflicts)
                platform.x += platform.direction * platform.speed * (this.scene.game.loop.delta / 1000);
                
                // Move trigger zone with platform
                topTrigger.x = platform.x;
                
                // Check boundaries and reverse direction
                if (platform.x <= Math.min(startX, endX)) {
                    platform.x = Math.min(startX, endX);
                    topTrigger.x = platform.x;
                    platform.direction = 1;
                } else if (platform.x >= Math.max(startX, endX)) {
                    platform.x = Math.max(startX, endX);
                    topTrigger.x = platform.x;
                    platform.direction = -1;
                }
                
                // Move player with platform using trigger-based detection
                const deltaX = platform.x - oldX;
                if (deltaX !== 0 && platform.playerOnTop) {
                    this.scene.player.sprite.x += deltaX;
                }
            }
        };
        
        return platform;
    }
    
    // Method to add collision with player (called from main game scene)
    setupPlayerCollisions(player) {
        this.scene.physics.add.collider(player.sprite, this.platforms);
        this.scene.physics.add.collider(player.sprite, this.movingPlatforms);
        
        // Note: Trigger detection is handled manually in the update() method
        // because Phaser's overlap callback doesn't work reliably for continuous detection
        
    }
    
    // Update method to handle trigger exit detection and platform movement
    update() {
        // Update moving platforms
        this.movingPlatforms.children.entries.forEach(platform => {
            if (platform.updateMovement) {
                platform.updateMovement();
            }
        });
        
        // Check overlap status for all platform triggers
        this.movingPlatforms.children.entries.forEach(platform => {
            if (platform.topTrigger) {
                const isOverlapping = this.scene.physics.overlap(this.scene.player.sprite, platform.topTrigger);
                
                if (isOverlapping && !platform.playerOnTop) {
                    // Player just entered trigger
                    platform.playerOnTop = true;
                    platform.topTrigger.setTint(0xFF0000); // Red when triggered
                    platform.topTrigger.setAlpha(0.8);
                } else if (!isOverlapping && platform.playerOnTop) {
                    // Player just left trigger
                    platform.playerOnTop = false;
                    platform.topTrigger.setTint(0x00FF00); // Green when not triggered
                    platform.topTrigger.setAlpha(0.5);
                }
            }
        });
    }
    
    // Method to create additional platforms dynamically
    addPlatform(x, y, texture = 'platform') {
        return this.createPlatform(x, y, texture);
    }
    
    // Method to create additional moving platforms
    addMovingPlatform(startX, startY, endX, endY, speed = 50) {
        return this.createMovingPlatform(startX, startY, endX, endY, speed);
    }
    
    // Method to remove platforms (useful for destructible platforms)
    removePlatform(platform) {
        if (this.platforms.contains(platform)) {
            this.platforms.remove(platform);
        } else if (this.movingPlatforms.contains(platform)) {
            this.movingPlatforms.remove(platform);
        }
        platform.destroy();
    }
    
    // Get all platforms (static and moving)
    getAllPlatforms() {
        return [...this.platforms.children.entries, ...this.movingPlatforms.children.entries];
    }
}