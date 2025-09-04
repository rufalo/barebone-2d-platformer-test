class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.1);
        
        // Configurable player properties with min/max values
        this.config = {
            movement: {
                speed: { value: 140, min: 50, max: 300 }
            },
            jump: {
                velocity: { value: 450, min: 200, max: 700 },
                coyoteTime: { value: 100, min: 50, max: 300 },
                bufferTime: { value: 100, min: 50, max: 300 }
            },
            abilities: {
                doubleJumpEnabled: true,
                dashEnabled: true,
                sprintEnabled: true
            },
            versions: {
                movementSystem: 'v1' // 'v1' = traditional, 'v2' = boost-integrated
            }
        };

        // Movement system configurations
        this.movementSystems = {
            v1: {
                name: "Traditional Movement",
                description: "Hold to sprint + traditional dash",
                dash: {
                    speed: { value: 600, min: 300, max: 1000 },
                    duration: { value: 300, min: 100, max: 500 },
                    cooldown: { value: 1000, min: 200, max: 2000 }
                },
                sprint: {
                    speed: { value: 320, min: 200, max: 500 }
                }
            },
            v2: {
                name: "Boost-Integrated Movement", 
                description: "Tap to boost + integrated dash with air dash",
                dash: {
                    speed: { value: 500, min: 200, max: 800 },
                    duration: { value: 200, min: 50, max: 400 },
                    cooldown: { value: 800, min: 100, max: 1500 },
                    boostDuration: { value: 300, min: 100, max: 600 },
                    airDashSpeed: { value: 400, min: 200, max: 700 },
                    airDashDuration: { value: 150, min: 50, max: 300 }
                },
                sprint: {
                    speed: { value: 400, min: 250, max: 600 },
                    duration: { value: 350, min: 100, max: 800 },
                    jumpWindow: { value: 200, min: 50, max: 500 },
                    airMomentumDuration: { value: 300, min: 100, max: 1000 }
                }
            }
        };
        
        // State tracking
        this.facingRight = true;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.isDashing = false;
        this.isCrouching = false;
        this.isSprinting = false;
        this.dashTimer = 0;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        
        // Double-tap dash tracking
        this.lastLeftTap = 0;
        this.lastRightTap = 0;
        this.doubleTapWindow = 300;
        
        // Dash cooldown
        this.lastDashTime = 0;
        this.canDash = true;
        
        // Sprint v2 boost system
        this.isBoosting = false;
        this.boostTimer = 0;
        this.boostDirection = 0;
        this.lastBoostTime = 0;
        
        // Sprint v2 extends boost duration when jumping during boost
        
        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,X,Z,SHIFT,SPACE');
        
        // Create ground detection
        this.setupGroundDetection();
    }

    // Helper methods to get current version properties
    getCurrentDashConfig() {
        return this.movementSystems[this.config.versions.movementSystem].dash;
    }

    getCurrentSprintConfig() {
        return this.movementSystems[this.config.versions.movementSystem].sprint;
    }
    
    getCurrentMovementSystem() {
        return this.movementSystems[this.config.versions.movementSystem];
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
        
        // Handle boost timer (sprint v2)
        if (this.isBoosting) {
            this.boostTimer -= delta;
            if (this.boostTimer <= 0) {
                this.isBoosting = false;
                this.sprite.setTint(0xffffff);
            }
        }
        
        // Sprint v2 boost continues even in air when timer is extended by jumping
        
        // Handle coyote time
        if (!this.isGrounded && this.coyoteTimer > 0) {
            this.coyoteTimer -= delta;
        }
        
        // Handle jump buffer
        if (this.jumpBuffer > 0) {
            this.jumpBuffer -= delta;
        }
        
        // Handle dash cooldown
        if (!this.canDash && this.scene.time.now - this.lastDashTime >= this.getCurrentDashConfig().cooldown.value) {
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
            this.coyoteTimer = this.config.jump.coyoteTime.value;
        } else if (wasGrounded && !this.isGrounded) {
            this.coyoteTimer = this.config.jump.coyoteTime.value;
        }
    }
    
    resetAbilities(source = 'unknown') {
        // Reset double jump
        this.canDoubleJump = true;
        
        // Only reset dash cooldown if enough time has passed or from entity
        if (source === 'entity' || this.scene.time.now - this.lastDashTime >= this.getCurrentDashConfig().cooldown.value) {
            this.canDash = true;
        }
        
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
        const sprintJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.SHIFT);
        
        // Handle different movement systems
        if (this.config.abilities.sprintEnabled) {
            if (this.config.versions.movementSystem === 'v1') {
                // Traditional: Hold to sprint
                this.isSprinting = sprintPressed && (leftPressed || rightPressed);
            } else if (this.config.versions.movementSystem === 'v2') {
                // Boost-integrated: Tap to boost + air dash
                if (sprintJustPressed) {
                    if (!this.isGrounded) {
                        // In air: Sprint button triggers air dash
                        if (this.config.abilities.dashEnabled) {
                            this.performAirDash(this.facingRight ? 1 : -1);
                        }
                    } else {
                        // On ground: Normal boost behavior
                        // Determine direction: use movement if pressing direction, otherwise use facing direction
                        let direction = 0;
                        if (leftPressed) {
                            direction = -1;
                        } else if (rightPressed) {
                            direction = 1;
                        } else {
                            // Standing still - use current facing direction
                            direction = this.facingRight ? 1 : -1;
                        }
                        this.performBoost(direction);
                    }
                }
                // v2 doesn't use continuous sprint
                this.isSprinting = false;
            }
        }
        
        let currentSpeed = this.config.movement.speed.value;
        
        // Apply sprint speed for movement systems
        if (this.config.abilities.sprintEnabled) {
            if (this.config.versions.movementSystem === 'v1' && this.isSprinting) {
                currentSpeed = this.getCurrentSprintConfig().speed.value;
            } else if (this.config.versions.movementSystem === 'v2' && this.isBoosting) {
                currentSpeed = this.getCurrentSprintConfig().speed.value;
            }
        }
        
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
                // Don't apply air resistance if we have air momentum from boost jump
                if (!this.hasAirMomentum) {
                    this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.95); // Air resistance
                }
                // Air momentum is handled in update() loop with gradual decay
            }
        }
        
        // Visual feedback for sprint/boost state  
        if (this.isBoosting && !this.isDashing) {
            this.sprite.setTint(0x00FF99); // Green when boosting (v2)
        } else if (this.isSprinting && !this.isDashing) {
            this.sprite.setTint(0xFFFF99); // Light yellow when sprinting (v1)
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
            this.jumpBuffer = this.config.jump.bufferTime.value;
        }
        
        if (this.jumpBuffer > 0) {
            // Regular jump (grounded or coyote time)
            if (this.isGrounded || this.coyoteTimer > 0) {
                this.sprite.setVelocityY(-this.config.jump.velocity.value);
                this.jumpBuffer = 0;
                this.coyoteTimer = 0;
                
                // Check for boost extension (boost-integrated movement system only)
                if (this.config.versions.movementSystem === 'v2' && this.config.abilities.sprintEnabled) {
                    // If jumping during an active boost, extend the boost timer with air momentum duration
                    if (this.isBoosting && this.boostDirection !== 0) {
                        const sprintConfig = this.getCurrentSprintConfig();
                        
                        // Extend the current boost timer by adding air momentum duration
                        this.boostTimer += sprintConfig.airMomentumDuration?.value || 1000;
                        
                        // Visual effect for boost jump extension
                        this.sprite.setTint(0x00FFFF); // Cyan for extended boost jump
                        this.scene.time.delayedCall(150, () => {
                            if (!this.isDashing) {
                                // Keep boost tint (green) if still boosting
                                this.sprite.setTint(this.isBoosting ? 0x00FF99 : 0xffffff);
                            }
                        });
                    }
                }
            }
            // Double jump
            else if (this.config.abilities.doubleJumpEnabled && this.canDoubleJump && !this.isGrounded) {
                this.sprite.setVelocityY(-this.config.jump.velocity.value * 1.1);
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
                // Visual crouch effect - tint instead of scale to avoid physics issues
                this.sprite.setTint(0xcccccc); // Gray tint to indicate crouching
                // Adjust hitbox to be shorter but keep sprite at ground level
                this.sprite.body.setSize(28, 20);
                this.sprite.body.setOffset(2, 12); // Move hitbox down to keep feet on ground
            }
        } else {
            if (this.isCrouching) {
                this.isCrouching = false;
                // Only reset tint if not dashing or sprinting
                if (!this.isDashing && !this.isSprinting) {
                    this.sprite.setTint(0xffffff);
                }
                // Reset hitbox to normal
                this.sprite.body.setSize(28, 32);
                this.sprite.body.setOffset(2, 0);
            }
        }
    }
    
    performBoost(direction) {
        if (this.isBoosting || !this.config.abilities.sprintEnabled) return;
        if (this.config.versions.movementSystem !== 'v2') return;
        if (!this.isGrounded) return; // Can only boost while grounded
        
        const sprintConfig = this.getCurrentSprintConfig();
        
        // Safety check: ensure v2 properties exist
        if (!sprintConfig.duration) {
            console.warn('Sprint v2 duration property missing');
            return;
        }
        
        this.isBoosting = true;
        this.boostTimer = sprintConfig.duration.value;
        this.boostDirection = direction;
        this.lastBoostTime = this.scene.time.now;
        
        // Visual effect for boost
        this.sprite.setTint(0x00FF99); // Green tint for boost
        
        // Don't apply velocity directly - let normal movement handling apply boost speed
    }
    
    handleDashing() {
        if (!this.config.abilities.dashEnabled) return;
        
        const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.X);
        
        if (dashPressed && !this.isDashing && this.canDash) {
            this.performDash(this.facingRight ? 1 : -1);
        }
    }
    
    performDash(direction) {
        if (this.isDashing || !this.canDash || !this.config.abilities.dashEnabled) return;
        
        const dashConfig = this.getCurrentDashConfig();
        
        if (this.config.versions.movementSystem === 'v1') {
            // Traditional: Simple dash - no boost integration
            this.sprite.setVelocityX(dashConfig.speed.value * direction);
            this.sprite.setVelocityY(0); // Stop vertical movement during dash
            
            this.isDashing = true;
            this.dashTimer = dashConfig.duration.value;
            
            // Visual effect - red for traditional dash
            this.sprite.setTint(0xff0000);
        } else if (this.config.versions.movementSystem === 'v2') {
            // Boost-integrated: Dash with boost integration - initial velocity + boost state
            this.sprite.setVelocityX(dashConfig.speed.value * direction);
            this.sprite.setVelocityY(0); // Stop vertical movement during dash
            
            this.isDashing = true;
            this.dashTimer = dashConfig.duration.value;
            
            // Activate boost state after dash for jump chaining
            this.isBoosting = true;
            this.boostTimer = dashConfig.boostDuration?.value || 300;
            this.boostDirection = direction;
            this.lastBoostTime = this.scene.time.now;
            
            // Visual effect - purple for boost-integrated dash
            this.sprite.setTint(0x9400D3);
        }
        
        // Common dash properties
        this.canDash = false;
        this.lastDashTime = this.scene.time.now;
        
        // Update facing direction
        this.facingRight = direction > 0;
        this.sprite.setFlipX(!this.facingRight);
    }
    
    performAirDash(direction) {
        if (this.isDashing || !this.canDash || !this.config.abilities.dashEnabled) return;
        if (this.config.versions.movementSystem !== 'v2') return;
        
        const dashConfig = this.getCurrentDashConfig();
        
        // Air dash with boost integration
        this.sprite.setVelocityX(dashConfig.airDashSpeed?.value || dashConfig.speed.value);
        this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5); // Reduce vertical velocity but don't stop it
        
        this.isDashing = true;
        this.dashTimer = dashConfig.airDashDuration?.value || dashConfig.duration.value;
        
        // Activate boost state for potential jump chaining when landing
        this.isBoosting = true;
        this.boostTimer = dashConfig.boostDuration?.value || 300;
        this.boostDirection = direction;
        this.lastBoostTime = this.scene.time.now;
        
        // Start dash cooldown
        this.canDash = false;
        this.lastDashTime = this.scene.time.now;
        
        // Visual effect - cyan for air dash
        this.sprite.setTint(0x00FFFF);
        
        // Update facing direction
        this.facingRight = direction > 0;
        this.sprite.setFlipX(!this.facingRight);
    }
    
    checkDoubleTapDash(leftPressed, rightPressed) {
        if (!this.config.abilities.dashEnabled) return;
        
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