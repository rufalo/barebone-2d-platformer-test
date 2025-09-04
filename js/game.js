class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create colored rectangles as placeholders for sprites
        this.add.graphics()
            .fillStyle(0x4A90E2)
            .fillRect(0, 0, 32, 32)
            .generateTexture('player', 32, 32);

        this.add.graphics()
            .fillStyle(0x8B4513)
            .fillRect(0, 0, 64, 16)
            .generateTexture('platform', 64, 16);

        this.add.graphics()
            .fillStyle(0xFF6B6B)
            .fillRect(0, 0, 24, 24)
            .generateTexture('target', 24, 24);

        this.add.graphics()
            .fillStyle(0xFFD93D)
            .fillRect(0, 0, 8, 8)
            .generateTexture('bullet', 8, 8);

        this.add.graphics()
            .fillStyle(0x6BCF7F)
            .fillRect(0, 0, 128, 16)
            .generateTexture('ground', 128, 16);

        this.add.graphics()
            .fillStyle(0x9B59B6)
            .fillRect(0, 0, 20, 20)
            .generateTexture('resetOrb', 20, 20);
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 1200, 600);
        
        // Create level
        this.level = new Level(this);
        
        // Create player
        this.player = new Player(this, 100, 400);
        
        // Create targets
        this.targets = this.physics.add.group();
        new Target(this, 800, 300, this.targets);
        new Target(this, 1000, 200, this.targets);
        
        // Create bullets group
        this.bullets = this.physics.add.group();
        
        // Create reset orbs (floating entities that reset abilities)
        this.resetOrbs = this.physics.add.staticGroup();
        this.createResetOrb(400, 250);
        this.createResetOrb(600, 150);
        
        // Set up collisions
        this.physics.add.collider(this.player.sprite, this.level.platforms);
        this.physics.add.collider(this.player.sprite, this.level.movingPlatforms);
        this.physics.add.collider(this.targets, this.level.platforms);
        this.physics.add.collider(this.targets, this.level.movingPlatforms);
        this.physics.add.collider(this.bullets, this.level.platforms, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.bullets, this.level.movingPlatforms, (bullet) => {
            bullet.destroy();
        });
        
        // Bullet-target collision
        this.physics.add.overlap(this.bullets, this.targets, (bullet, target) => {
            if (bullet && bullet.active && target && target.active) {
                bullet.destroy();
                if (target.targetInstance) {
                    target.targetInstance.hit();
                } else {
                    // Fallback for direct target sprites
                    target.hit();
                }
            }
        });
        
        // Reset orb collision
        this.physics.add.overlap(this.player.sprite, this.resetOrbs, (player, orb) => {
            if (orb && orb.active) {
                // Reset player abilities
                this.player.resetAbilities('entity');
                
                // Visual effect on orb
                orb.setTint(0x00FFFF);
                this.time.delayedCall(300, () => {
                    if (orb.active) {
                        orb.setTint(0x9B59B6);
                    }
                });
            }
        });
        
        // Camera follows player
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setBounds(0, 0, 1200, 600);
        
        // Debug info
        this.add.text(10, 10, 'Basic Platformer Character Test - v1.0.1', { 
            fontSize: '16px', 
            fill: '#ffffff' 
        }).setScrollFactor(0);
    }

    update() {
        this.player.update();
        
        // Update all targets
        this.targets.children.entries.forEach(target => {
            if (target.targetInstance) {
                target.targetInstance.update();
            }
        });
        
        // Update reset orbs (floating animation)
        this.resetOrbs.children.entries.forEach(orb => {
            if (orb.active) {
                orb.y = orb.baseY + Math.sin(this.time.now * 0.003 + orb.x * 0.01) * 8;
            }
        });
        
        // Update moving platforms
        this.level.movingPlatforms.children.entries.forEach(platform => {
            if (platform.active && platform.updateMovement) {
                platform.updateMovement();
            }
        });
    }
    
    createBullet(x, y, direction) {
        const bullet = this.physics.add.sprite(x, y, 'bullet');
        bullet.setScale(0.8);
        this.bullets.add(bullet);
        
        // Set physics properties after the body is fully initialized
        this.physics.world.once('worldstep', () => {
            if (bullet.body) {
                bullet.body.allowGravity = false;
                bullet.body.setVelocityX(direction * 600);
                bullet.body.setVelocityY(0); // Ensure no Y velocity
            }
        });
        
        // Remove bullet after 3 seconds
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
        
        return bullet;
    }
    
    createResetOrb(x, y) {
        const orb = this.physics.add.staticSprite(x, y, 'resetOrb');
        orb.body.setSize(16, 16); // Smaller hitbox than visual
        orb.setTint(0x9B59B6); // Purple color
        orb.baseY = y; // Store original Y position for floating animation
        this.resetOrbs.add(orb);
        return orb;
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: GameScene
};

// Start the game
const game = new Phaser.Game(config);