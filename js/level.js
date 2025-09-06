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
        
        // Store wall sprites for collision-based wall detection
        this.walls = [];
        
        this.createLevel();
    }
    
    createLevel() {
        // Ground platforms (positioned near bottom of 800px screen at Y=720)
        // Extended ground coverage for wider screen with better spacing
        this.createPlatform(64, 720, 'ground');
        this.createPlatform(192, 720, 'ground');
        this.createPlatform(320, 720, 'ground');
        this.createPlatform(448, 720, 'ground');
        this.createPlatform(576, 720, 'ground');
        this.createPlatform(704, 720, 'ground');
        this.createPlatform(832, 720, 'ground');
        this.createPlatform(960, 720, 'ground');
        this.createPlatform(1088, 720, 'ground');
        this.createPlatform(1216, 720, 'ground');
        this.createPlatform(1344, 720, 'ground');
        this.createPlatform(1472, 720, 'ground');
        this.createPlatform(1600, 720, 'ground');
        
        // Mid-level platforms for jumping (spread across more vertical space)
        this.createPlatform(200, 600, 'platform');
        this.createPlatform(400, 530, 'platform');
        this.createPlatform(600, 470, 'platform');
        this.createPlatform(800, 410, 'platform');
        this.createPlatform(1000, 350, 'platform');
        
        // Higher platforms (more vertical spacing)
        this.createPlatform(300, 400, 'platform');
        this.createPlatform(500, 320, 'platform');
        this.createPlatform(700, 280, 'platform');
        this.createPlatform(900, 220, 'platform');
        this.createPlatform(1100, 180, 'platform');
        this.createPlatform(1300, 150, 'platform');
        
        // Some scattered platforms for parkour
        this.createPlatform(180, 500, 'platform'); // Moved inward from wall
        this.createPlatform(650, 520, 'platform');
        this.createPlatform(850, 460, 'platform');
        this.createPlatform(1050, 480, 'platform');
        this.createPlatform(1200, 380, 'platform'); // New platform for expanded area
        
        // Create a moving platform (adjusted height)
        this.createMovingPlatform(400, 650, 600, 650);
        
        // Create cliff structure for wall jump testing
        this.createCliff();
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
    
    createCliff() {
        // Create a left-side wall for testing bidirectional wall jumping
        this.createLeftWall();
        
        // Create right wall using same approach as left wall
        this.createRightWall();
    }
    
    createLeftWall() {
        // Create a left-side wall for testing bidirectional wall jumping
        const wallX = 150; // Moved inward from edge (was 50)
        const wallY = 520; // Adjusted for new ground level (Y=720)
        
        // Create left wall using the cliff texture
        const leftWall = this.scene.physics.add.staticSprite(wallX, wallY, 'cliff');
        leftWall.setOrigin(0.5, 0.5);
        leftWall.setTint(0x8B4513); // Brown tint to distinguish from right cliff
        leftWall.isWall = true; // Mark as wall for collision detection
        leftWall.wallSide = 'left'; // Store which side this wall is on
        
        this.platforms.add(leftWall);
        this.walls.push(leftWall); // Store in walls array for detection
        
        // Add approach platform on the right for jumping toward left wall
        const leftApproachPlatform = this.createPlatform(wallX + 150, 550, 'platform');
        
        // Add landing platform at top of left wall
        const leftTopPlatform = this.createPlatform(wallX - 96, 320, 'platform');
        
        console.log('Created left wall at x =', wallX);
    }
    
    createRightWall() {
        // Create a right-side wall for testing bidirectional wall jumping
        const wallX = 1250; // Moved inward from edge (was 1400, screen is 1400px wide)
        const wallY = 520; // Same height as left wall
        
        // Create right wall using the cliff texture
        const rightWall = this.scene.physics.add.staticSprite(wallX, wallY, 'cliff');
        rightWall.setOrigin(0.5, 0.5);
        rightWall.setTint(0x654321); // Darker brown to distinguish from left wall
        rightWall.isWall = true; // Mark as wall for collision detection
        rightWall.wallSide = 'right'; // Store which side this wall is on
        
        this.platforms.add(rightWall);
        this.walls.push(rightWall); // Store in walls array for detection
        
        // Add approach platform on the left for jumping toward right wall
        const rightApproachPlatform = this.createPlatform(wallX - 150, 550, 'platform');
        
        // Add landing platform at top of right wall
        const rightTopPlatform = this.createPlatform(wallX + 96, 320, 'platform');
        
        console.log('Created right wall at x =', wallX);
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
        
        // Wall detection is now handled in Player class using collision system
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