class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.1);
        
        // Player properties
        this.speed = 140;
        this.sprintSpeed = 320;
        this.jumpVelocity = -450;
        this.dashSpeed = 600;
        this.dashDuration = 300;
        
        // State tracking
        this.facingRight = true;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.isDashing = false;
        this.isCrouching = false;
        this.isSprinting = false;
        this.dashTimer = 0;
        this.coyoteTime = 100;
        this.coyoteTimer = 0;
        this.jumpBufferTime = 100;
        this.jumpBuffer = 0;
        
        // Double-tap dash tracking
        this.lastLeftTap = 0;
        this.lastRightTap = 0;
        this.doubleTapWindow = 300;
        
        // Dash cooldown
        this.dashCooldown = 500; // 500ms cooldown
        this.lastDashTime = 0;
        this.canDash = true;
        
        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,X,Z,SHIFT,SPACE');
        
        // Create ground detection
        this.setupGroundDetection();
    }
    
    setupGroundDetection() {
        this.sprite.body.setSize(28, 32);
        this.sprite.body.setOffset(2, 0);
    }
    
    update() {
        const delta = this.scene.game.loop.delta;
        
        // Check if grounded
        this.checkGrounded();
        
        // Handle dash timer
        if (this.isDashing) {
            this.dashTimer -= delta;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.sprite.setTint(0xffffff);
            }
        }
        
        // Handle coyote time
        if (!this.isGrounded && this.coyoteTimer > 0) {
            this.coyoteTimer -= delta;
        }
        
        // Handle jump buffer
        if (this.jumpBuffer > 0) {
            this.jumpBuffer -= delta;
        }
        
        // Handle dash cooldown
        if (!this.canDash && this.scene.time.now - this.lastDashTime >= this.dashCooldown) {
            this.canDash = true;
        }
        
        // Input handling
        this.handleInput();
    }
    
    checkGrounded() {
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.sprite.body.touching.down;
        
        if (this.isGrounded) {
            this.resetAbilities('ground');
            this.coyoteTimer = this.coyoteTime;
        } else if (wasGrounded && !this.isGrounded) {
            this.coyoteTimer = this.coyoteTime;
        }
    }
    
    resetAbilities(source = 'unknown') {
        // Reset double jump
        this.canDoubleJump = true;
        
        // Reset dash cooldown
        this.canDash = true;
        
        // Optional: Add visual feedback for ability reset
        if (source === 'entity') {
            // Special effect for entity-based resets
            this.sprite.setTint(0x00FFFF); // Cyan flash
            this.scene.time.delayedCall(150, () => {
                if (!this.isDashing && !this.isSprinting) {
                    this.sprite.setTint(0xFFFFFF);
                }
            });
        }
    }
    
    handleInput() {
        if (this.isDashing) {
            return; // Don't allow other inputs during dash
        }
        
        // Horizontal movement
        this.handleHorizontalMovement();
        
        // Jumping
        this.handleJumping();
        
        // Crouching
        this.handleCrouching();
        
        // Dashing
        this.handleDashing();
        
        // Shooting
        this.handleShooting();
    }
    
    handleHorizontalMovement() {
        const leftPressed = this.cursors.left.isDown || this.keys.A.isDown;
        const rightPressed = this.cursors.right.isDown || this.keys.D.isDown;
        const sprintPressed = this.keys.SHIFT.isDown;
        
        // Sprint handling (no cooldown)
        this.isSprinting = sprintPressed && (leftPressed || rightPressed);
        
        let currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;
        
        // Reduce speed when crouching
        if (this.isCrouching) {
            currentSpeed *= 0.5;
        }
        
        if (leftPressed) {
            this.sprite.setVelocityX(-currentSpeed);
            this.facingRight = false;
            this.sprite.setFlipX(true);
        } else if (rightPressed) {
            this.sprite.setVelocityX(currentSpeed);
            this.facingRight = true;
            this.sprite.setFlipX(false);
        } else {
            // Apply stronger friction for less sliding
            if (this.isGrounded) {
                this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.6); // Ground friction
            } else {
                this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.95); // Air resistance
            }
        }
        
        // Visual feedback for sprint state
        if (this.isSprinting && !this.isDashing) {
            this.sprite.setTint(0xFFFF99); // Light yellow when sprinting
        } else if (!this.canDash && !this.isDashing) {
            this.sprite.setTint(0x999999); // Gray when dash is on cooldown
        } else if (!this.isDashing) {
            this.sprite.setTint(0xFFFFFF); // Normal color
        }
        
        // Check for double-tap dash
        this.checkDoubleTapDash(leftPressed, rightPressed);
    }
    
    handleJumping() {
        const jumpPressed = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;
        const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                               Phaser.Input.Keyboard.JustDown(this.keys.W) || 
                               Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
        
        if (jumpJustPressed) {
            this.jumpBuffer = this.jumpBufferTime;
        }
        
        if (this.jumpBuffer > 0) {
            // Regular jump (grounded or coyote time)
            if (this.isGrounded || this.coyoteTimer > 0) {
                this.sprite.setVelocityY(this.jumpVelocity);
                this.jumpBuffer = 0;
                this.coyoteTimer = 0;
            }
            // Double jump
            else if (this.canDoubleJump && !this.isGrounded) {
                this.sprite.setVelocityY(this.jumpVelocity * 1.1);
                this.canDoubleJump = false;
                this.jumpBuffer = 0;
                
                // Visual effect for double jump
                this.sprite.setTint(0xffff00);
                this.scene.time.delayedCall(100, () => {
                    this.sprite.setTint(0xffffff);
                });
            }
        }
        
        // Variable jump height
        if (!jumpPressed && this.sprite.body.velocity.y < 0) {
            this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5);
        }
    }
    
    handleCrouching() {
        const crouchPressed = this.cursors.down.isDown || this.keys.S.isDown;
        
        if (crouchPressed && this.isGrounded) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.sprite.setScale(1, 0.7);
                this.sprite.body.setSize(28, 22);
                this.sprite.body.setOffset(2, 10);
            }
        } else {
            if (this.isCrouching) {
                this.isCrouching = false;
                this.sprite.setScale(1, 1);
                this.sprite.body.setSize(28, 32);
                this.sprite.body.setOffset(2, 0);
            }
        }
    }
    
    handleDashing() {
        const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.X);
        
        if (dashPressed && !this.isDashing && this.canDash) {
            this.performDash(this.facingRight ? 1 : -1);
        }
    }
    
    performDash(direction) {
        if (this.isDashing || !this.canDash) return;
        
        this.sprite.setVelocityX(this.dashSpeed * direction);
        this.sprite.setVelocityY(0); // Stop vertical movement during dash
        
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        
        // Start dash cooldown
        this.canDash = false;
        this.lastDashTime = this.scene.time.now;
        
        // Visual effect
        this.sprite.setTint(0xff0000);
        
        // Update facing direction
        this.facingRight = direction > 0;
        this.sprite.setFlipX(!this.facingRight);
    }
    
    checkDoubleTapDash(leftPressed, rightPressed) {
        const currentTime = this.scene.time.now;
        
        // Check for left double-tap
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            if (currentTime - this.lastLeftTap < this.doubleTapWindow && this.canDash) {
                this.performDash(-1);
            }
            this.lastLeftTap = currentTime;
        }
        
        // Check for right double-tap
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            if (currentTime - this.lastRightTap < this.doubleTapWindow && this.canDash) {
                this.performDash(1);
            }
            this.lastRightTap = currentTime;
        }
    }
    
    handleShooting() {
        const shootPressed = Phaser.Input.Keyboard.JustDown(this.keys.Z);
        
        if (shootPressed) {
            const direction = this.facingRight ? 1 : -1;
            const bulletX = this.sprite.x + (direction * 20);
            const bulletY = this.sprite.y;
            
            this.scene.createBullet(bulletX, bulletY, direction);
            
            // Visual feedback
            this.sprite.setTint(0x00ff00);
            this.scene.time.delayedCall(100, () => {
                this.sprite.setTint(0xffffff);
            });
        }
    }
}