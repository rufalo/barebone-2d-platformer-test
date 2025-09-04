class Level {
    constructor(scene) {
        this.scene = scene;
        this.platforms = scene.physics.add.staticGroup();
        this.movingPlatforms = scene.physics.add.group({
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
        
        // Add to movingPlatforms group (dynamic physics group)
        this.movingPlatforms.add(platform);
        
        // Store update function for movement
        platform.updateMovement = () => {
            if (platform.active && platform.body) {
                const oldX = platform.x;
                
                // Move platform manually (not using velocity to avoid physics conflicts)
                platform.x += platform.direction * platform.speed * (this.scene.game.loop.delta / 1000);
                
                // Check boundaries and reverse direction
                if (platform.x <= Math.min(startX, endX)) {
                    platform.x = Math.min(startX, endX);
                    platform.direction = 1;
                } else if (platform.x >= Math.max(startX, endX)) {
                    platform.x = Math.max(startX, endX);
                    platform.direction = -1;
                }
                
                // Move player with platform if they're standing on it
                const deltaX = platform.x - oldX;
                if (deltaX !== 0 && this.scene.player && this.scene.player.sprite.body) {
                    const playerBounds = this.scene.player.sprite.getBounds();
                    const platformBounds = platform.getBounds();
                    
                    // Check if player is standing on THIS specific platform
                    // Player must be: grounded, horizontally overlapping, and positioned above platform
                    const isGrounded = this.scene.player.sprite.body.touching.down;
                    const horizontalOverlap = playerBounds.right > platformBounds.left && 
                                             playerBounds.left < platformBounds.right;
                    const isAbovePlatform = playerBounds.bottom >= platformBounds.top - 5 && 
                                           playerBounds.bottom <= platformBounds.top + 10;
                    
                    if (isGrounded && horizontalOverlap && isAbovePlatform) {
                        this.scene.player.sprite.x += deltaX;
                    }
                }
            }
        };
        
        return platform;
    }
    
    // Method to add collision with player (called from main game scene)
    setupPlayerCollisions(player) {
        this.scene.physics.add.collider(player.sprite, this.platforms);
        this.scene.physics.add.collider(player.sprite, this.movingPlatforms);
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