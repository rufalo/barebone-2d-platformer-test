/*
============================================================================
BARE BONES CHARACTER CONTROLLER - MOVEMENT SPECIFICATIONS
============================================================================

=== BASIC MOVEMENT ===
• Normal Speed: 160 units/s (1.0x multiplier)
• Boost Speed: 320 units/s (2.0x multiplier) - 400ms duration  
• Charge Speed: 128 units/s (0.8x multiplier) - builds over 600ms
• Ground Slide: 300 units/s (1.88x multiplier) - 1000ms duration

=== JUMP ABILITIES ===
• Normal Jump: 500 velocity units (standard jump power)
• Boost Jump: 550 vertical + 320 horizontal (air control enabled)
• Charge Jump: 800 vertical only (requires full 600ms charge)

=== BOOST SYSTEM ===
• Boost Activation: Press Shift (can buffer while airborne)
• Boost Duration: 400ms active window
• Boost Actions: Jump (boost jump) or Slide (ground slide)
• Charge Transition: Hold Shift after boost expires → charge mode
• Charge Ready: Orange color at 100% charge (600ms)

=== INPUT BUFFERING ===
• Jump Buffer: 75ms window before landing
• Boost Buffer: Infinite while holding Shift (pending system)

=== GROUND SLIDE ===
• Activation: Boost + Direction + Down (while grounded)
• Speed: 300 units/s in slide direction
• Duration: 1000ms or until opposite direction pressed
• Visual: Half height scaling from bottom anchor
• Jump Cancel: Performs boost jump when jumping from slide

=== STATE COLORS ===
• Normal: Blue (#3498db)
• Boost Active: Red (#ff6b6b) 
• Charge Boosting: Yellow (#feca57)
• Charge Ready: Orange (#ff8c00)
• Boost Jump: Yellow (#ffff00)
• Charge Jump: Green (#00ff00)
• Ground Slide: Blue (#54a0ff)

=== PHYSICS SETTINGS ===
• Gravity: 1200 units/s²
• Bounce: 0.05 (minimal bounce on landing)
• Origin: Bottom center (0.5, 1.0) for ground-based scaling

============================================================================
*/

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create simple colored rectangles as textures
        this.add.graphics({ fillStyle: { color: 0x8B4513 } })
            .fillRect(0, 0, 32, 32)
            .generateTexture('platform', 32, 32);
            
        // White player texture so tints show as pure colors
        this.add.graphics({ fillStyle: { color: 0xffffff } })
            .fillRect(0, 0, 32, 64)
            .generateTexture('player', 32, 64);
    }

    create() {
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        
        // Ground
        const ground = this.platforms.create(400, 550, 'platform');
        ground.setScale(25, 3).refreshBody(); // 800x96 ground
        
        // Platforms
        this.platforms.create(200, 400, 'platform').setScale(6, 1).refreshBody();
        this.platforms.create(600, 300, 'platform').setScale(6, 1).refreshBody();

        // Create player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setOrigin(0.5, 1); // Set origin to bottom center by default
        this.player.setTint(0x3498db); // Default blue color
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.05);
        this.physics.add.collider(this.player, this.platforms);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // State variables
        this.isBoosted = false;
        this.isChargeBoosting = false;
        this.isGroundSliding = false;
        this.isBoostJumping = false;
        this.isChargeJumping = false;
        this.isGrounded = false;
        this.wasGrounded = false; // Track previous frame grounded state
        
        // Timers and values
        this.boostTimer = 0;
        this.chargeLevel = 0;
        this.slideTimer = 0;
        this.boostActionUsed = false; // Track if boost was consumed by an action
        this.shiftWasPressed = false; // Track if shift key was just pressed
        this.boostConsumed = false; // Track if boost is fully consumed and needs new press
        this.slideDirection = 0; // Track slide direction for cancellation (-1 left, 1 right, 0 none)
        this.boostPending = false; // Track if boost key was pressed while airborne
        this.currentSpeedMultiplier = 1.0; // Track current speed multiplier for debug
        
        // Jump buffer system
        this.jumpBuffer = 0; // Timer for jump input buffering
        this.jumpBufferDuration = 75; // 75ms window to buffer jump before landing
        
        // Constants
        this.NORMAL_SPEED = 160;
        this.BOOST_SPEED = 320; // 2x speed
        this.CHARGE_SPEED = 128; // 0.8x speed
        this.SLIDE_SPEED = 300;
        this.JUMP_VELOCITY = -500; // Normal jump - more power
        this.BOOST_JUMP_VELOCITY = -550; // Boost jump - much more power
        this.BOOST_JUMP_HORIZONTAL = 450; // Boost jump horizontal speed
        this.BOOST_DURATION = 400;
        this.CHARGE_DURATION = 600;
        this.SLIDE_DURATION = 1000;

        // Debug text
        this.debugText = this.add.text(16, 16, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
    }

    update(time, delta) {
        // Track grounded state
        this.wasGrounded = this.isGrounded;
        this.isGrounded = this.player.body.touching.down;
        const justLanded = !this.wasGrounded && this.isGrounded; // Just transitioned to ground
        
        // Reset states when landing
        if (this.isGrounded && (this.isBoostJumping || this.isChargeJumping)) {
            this.isBoostJumping = false;
            this.isChargeJumping = false;
        }

        // Handle boost system (BEFORE jump handling)
        this.handleBoost(delta, justLanded);
        
        // Handle movement
        this.handleMovement();
        
        // Handle input buffering
        this.handleInputBuffering(delta);
        
        // Handle jumping (AFTER boost handling)
        this.handleJumping();
        
        // Handle ground sliding
        this.handleGroundSlide(delta);
        
        // Update debug info
        this.updateDebugText();
    }

    handleInputBuffering(delta) {
        // Handle jump buffering
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.jumpBuffer = this.jumpBufferDuration; // Start jump buffer
        }
        
        // Decay jump buffer
        if (this.jumpBuffer > 0) {
            this.jumpBuffer -= delta;
            if (this.jumpBuffer < 0) this.jumpBuffer = 0;
        }
    }

    handleBoost(delta, justLanded) {
        const shiftJustPressed = Phaser.Input.Keyboard.JustDown(this.shiftKey);
        
        // Track boost key press (can be pressed in air or on ground)
        if (shiftJustPressed && !this.boostConsumed) {
            this.boostPending = true;
        }
        
        // Activate boost when grounded (either just pressed or pending from air)
        if (this.isGrounded && this.boostPending && !this.isBoosted && !this.isChargeBoosting && !this.boostConsumed) {
            // Start boost
            this.isBoosted = true;
            this.boostTimer = this.BOOST_DURATION;
            this.boostActionUsed = false;
            this.boostConsumed = false;
            this.boostPending = false; // Consume pending boost
            this.player.setTint(0xff6b6b); // Red tint during boost
        }
        
        if (this.shiftKey.isDown) {
            // Continue boost logic for charge transition
        } else {
            // Release shift - end all boost states and reset flags
            this.isBoosted = false;
            this.isChargeBoosting = false;
            this.chargeLevel = 0;
            this.boostConsumed = false;
            this.boostPending = false; // Clear pending boost when shift released
            if (!this.isGroundSliding && !this.isBoostJumping && !this.isChargeJumping) {
                this.player.setTint(0x3498db); // Back to default blue
            }
        }

        // Update boost timer and transition to charge
        if (this.isBoosted) {
            this.boostTimer -= delta;
            if (this.boostTimer <= 0) {
                this.boostTimer = 0;
                // Auto-transition to charge boost if shift still held AND no boosted action was used
                if (this.shiftKey.isDown && !this.boostActionUsed) {
                    this.isBoosted = false;
                    this.isChargeBoosting = true;
                    this.chargeLevel = 0;
                    this.player.setTint(0xfeca57); // Yellow tint during charge
                } else {
                    // Boost expired or was used, end boost
                    this.isBoosted = false;
                    this.boostConsumed = true; // Mark as consumed
                    if (!this.isGroundSliding && !this.isBoostJumping && !this.isChargeJumping) {
                        this.player.setTint(0x3498db); // Back to default blue
                    }
                }
            }
        }

        // Update charge level
        if (this.isChargeBoosting) {
            this.chargeLevel += delta;
            if (this.chargeLevel > this.CHARGE_DURATION) {
                this.chargeLevel = this.CHARGE_DURATION;
                // Change color when charge is ready
                this.player.setTint(0xff8c00); // Orange for charge ready
            } else {
                // Yellow during charging
                this.player.setTint(0xfeca57);
            }
        }
    }

    handleMovement() {
        if (this.isGroundSliding) {
            this.currentSpeedMultiplier = this.SLIDE_SPEED / this.NORMAL_SPEED; // ~1.88x
            return; // No movement control during slide
        }

        // Allow air control during boost jump
        if (this.isBoostJumping) {
            this.currentSpeedMultiplier = 2.0; // Maintain 2x multiplier
            // Allow direction change during boost jump
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-this.BOOST_SPEED);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(this.BOOST_SPEED);
            }
            // Don't set velocity to 0 - let momentum continue if no input
            return;
        }


        let speed = this.NORMAL_SPEED;
        this.currentSpeedMultiplier = 1.0; // Default multiplier
        
        if (this.isBoosted) {
            speed = this.BOOST_SPEED;
            this.currentSpeedMultiplier = 2.0; // 2x speed
        } else if (this.isChargeBoosting) {
            speed = this.CHARGE_SPEED;
            this.currentSpeedMultiplier = 0.8; // 0.8x speed
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }
    }

    handleJumping() {
        // Check for jump input (just pressed or buffered)
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        const bufferedJumpAvailable = this.jumpBuffer > 0;
        
        // Execute jump if grounded and (just pressed or buffered input available)
        if (this.isGrounded && (jumpPressed || bufferedJumpAvailable)) {
            // Consume jump buffer
            this.jumpBuffer = 0;
            
            if (this.isChargeBoosting && this.chargeLevel >= this.CHARGE_DURATION) {
                // Charge jump - only at full charge, more powerful
                const jumpPower = 650 + (this.chargeLevel / this.CHARGE_DURATION) * 150;
                this.player.setVelocityY(-jumpPower);
                this.player.setVelocityX(0); // No horizontal movement
                this.isChargeJumping = true;
                this.isChargeBoosting = false;
                this.chargeLevel = 0;
                this.player.setTint(0x00ff00); // Green for charge jump
            } else if (this.isBoosted || this.isGroundSliding) {
                // Boost jump - much more powerful with horizontal momentum
                this.player.setVelocityY(this.BOOST_JUMP_VELOCITY);
                // Add enhanced horizontal momentum in current direction
                const currentDirection = this.cursors.left.isDown ? -1 : (this.cursors.right.isDown ? 1 : 0);
                if (currentDirection !== 0) {
                    this.player.setVelocityX(currentDirection * this.BOOST_SPEED); // Use boost speed (2x)
                    this.currentSpeedMultiplier = 2.0; // 2x speed
                }
                this.isBoostJumping = true;
                this.isBoosted = false;
                this.boostTimer = 0;
                this.boostActionUsed = true; // Mark boost as used
                this.boostConsumed = true; // Boost is fully consumed
                // Reset charge boost if it was active
                this.isChargeBoosting = false;
                this.chargeLevel = 0;
                // End ground slide if jumping from slide
                if (this.isGroundSliding) {
                    this.isGroundSliding = false;
                    this.slideTimer = 0;
                    this.slideDirection = 0;
                    this.player.setScale(1, 1); // Restore normal size
                }
                this.player.setTint(0xffff00); // Yellow for boost jump
            } else {
                // Normal jump - increased power
                this.player.setVelocityY(this.JUMP_VELOCITY);
                this.player.setTint(0x3498db); // Keep default blue for normal jump
            }
        }
    }

    handleGroundSlide(delta) {
        // Start ground slide: Boost + Direction + Down
        if (this.isBoosted && this.cursors.down.isDown && 
            (this.cursors.left.isDown || this.cursors.right.isDown) && 
            this.isGrounded && !this.isGroundSliding) {
            
            this.isGroundSliding = true;
            this.slideTimer = this.SLIDE_DURATION;
            this.isBoosted = false;
            this.boostTimer = 0;
            this.boostActionUsed = true; // Mark boost as used
            this.boostConsumed = true; // Boost is fully consumed
            // Reset charge boost if it was active
            this.isChargeBoosting = false;
            this.chargeLevel = 0;
            
            // Set slide visuals - origin already set to bottom center
            this.player.setScale(1, 0.5); // Half height, shrinks from bottom
            this.player.setTint(0x54a0ff); // Blue for slide
            
            // Set slide velocity
            const direction = this.cursors.left.isDown ? -1 : 1;
            this.player.setVelocityX(this.SLIDE_SPEED * direction);
            this.currentSpeedMultiplier = this.SLIDE_SPEED / this.NORMAL_SPEED; // ~1.88x
        }

        // Store slide direction for cancellation check
        if (this.isGroundSliding && !this.slideDirection) {
            this.slideDirection = this.player.body.velocity.x > 0 ? 1 : -1;
        }

        // Update slide
        if (this.isGroundSliding) {
            this.slideTimer -= delta;
            
            // Check for opposite direction cancellation
            const oppositePressed = (this.slideDirection > 0 && this.cursors.left.isDown) || 
                                  (this.slideDirection < 0 && this.cursors.right.isDown);
            
            if (this.slideTimer <= 0 || !this.isGrounded || oppositePressed) {
                // End slide
                this.isGroundSliding = false;
                this.slideTimer = 0;
                this.slideDirection = 0; // Reset slide direction
                
                // Restore normal size - keep bottom origin
                this.player.setScale(1, 1);
                this.player.setTint(0x3498db); // Back to default blue
                this.currentSpeedMultiplier = 1.0; // Back to normal speed
            }
        }
    }

    updateDebugText() {
        const chargePercent = Math.round((this.chargeLevel / this.CHARGE_DURATION) * 100);
        
        // Determine current state
        let currentState = 'Normal';
        if (this.isGroundSliding) currentState = 'Ground Sliding';
        else if (this.isChargeJumping) currentState = 'Charge Jumping';
        else if (this.isBoostJumping) currentState = 'Boost Jumping';
        else if (this.isChargeBoosting) currentState = 'Charge Boosting';
        else if (this.isBoosted) currentState = 'Boosted';
        else if (!this.isGrounded) currentState = 'Airborne';
        
        this.debugText.setText([
            'Controls: Arrows=Move, Space=Jump, Shift=Boost/Charge',
            'Combos: Boost+Jump, Boost+Dir+Down=Slide',
            '',
            `State: ${currentState}`,
            `Speed: ${this.currentSpeedMultiplier.toFixed(1)}x`,
            `Charge: ${chargePercent}%`
        ]);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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