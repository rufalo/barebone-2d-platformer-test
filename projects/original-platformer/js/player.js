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
                boostEnabled: true
            },
            versions: {
                movementSystem: 'v2' // 'v1' = traditional, 'v2' = boost-integrated
            }
        };

        // Movement system configurations
        this.movementSystems = {
            v1: {
                name: "Traditional Movement",
                description: "Hold to boost + traditional dash",
                dash: {
                    speed: { value: 600, min: 300, max: 1000 },
                    duration: { value: 300, min: 100, max: 500 },
                    cooldown: { value: 1000, min: 200, max: 2000 }
                },
                boost: {
                    speed: { value: 320, min: 200, max: 500 }
                }
            },
            v2: {
                name: "Boost-Integrated Movement", 
                description: "Tap to boost + integrated dash with air dash + ground slide",
                dash: {
                    speed: { value: 500, min: 200, max: 800 },
                    duration: { value: 200, min: 50, max: 400 },
                    cooldown: { value: 800, min: 100, max: 1500 },
                    boostDuration: { value: 300, min: 100, max: 600 },
                    airDashSpeed: { value: 400, min: 200, max: 700 },
                    airDashDuration: { value: 150, min: 50, max: 300 }
                },
                boost: {
                    speed: { value: 400, min: 250, max: 600 },
                    duration: { value: 350, min: 100, max: 800 },
                    jumpWindow: { value: 200, min: 50, max: 500 },
                    airMomentumDuration: { value: 300, min: 100, max: 1000 }
                },
                slide: {
                    duration: { value: 800, min: 200, max: 1500 },
                    friction: { value: 0.95, min: 0.8, max: 0.99 }
                }
            }
        };
        
        // State tracking
        this.facingRight = true;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.isDashing = false;
        this.isCrouching = false;
        this.isSliding = false;
        this.isSprinting = false;
        this.isWallSliding = false;
        this.crouchVisualApplied = false;
        this.dashTimer = 0;
        this.slideTimer = 0;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        
        // Natural wall kick system with boost integration
        this.wallSide = null; // 'left' or 'right' - which side the wall is on
        this.canWallKick = true; // Can perform wall kick (resets on ground)
        this.wallKickMomentum = false; // Preserve horizontal momentum after wall kick
        this.wallKickMomentumTimer = 0; // Duration to preserve momentum
        this.wallKickMomentumDuration = 150; // ms to preserve horizontal momentum (reduced for better feel)
        
        // Sprint-powered wall running system
        this.wallRunCount = 0; // Track wall runs up same wall
        this.maxWallRuns = 2; // Allow 2 wall runs up per boost
        this.isWallRunning = false; // Currently wall running (vertical movement)
        this.wallRunBoostActive = false; // Sprint boost active during wall interaction
        this.wallRunActivated = false; // Flag for wall run state activation
        
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
        
        // Ground slide system
        this.slideDirection = 0;
        this.slideSpeed = 250; // Base slide speed
        
        
        // Sprint v2 extends boost duration when jumping during boost
        
        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,X,Z,SHIFT,SPACE');
        
        // Create state manager
        this.stateManager = new BoostStateManager(this);
        
        // Create ground detection
        this.setupGroundDetection();
    }

    // Helper methods to get current version properties
    getCurrentDashConfig() {
        return this.movementSystems[this.config.versions.movementSystem].dash;
    }

    getCurrentBoostConfig() {
        return this.movementSystems[this.config.versions.movementSystem].boost;
    }
    
    getCurrentMovementSystem() {
        return this.movementSystems[this.config.versions.movementSystem];
    }
    
    getCurrentSlideConfig() {
        const system = this.movementSystems[this.config.versions.movementSystem];
        return system.slide || { duration: { value: 800 }, friction: { value: 0.95 } };
    }
    
    setupGroundDetection() {
        this.sprite.body.setSize(28, 32);
        this.sprite.body.setOffset(2, 0);
    }
    
    update() {
        const delta = this.scene.game.loop.delta;
        
        // Update state manager first
        this.stateManager.update(delta);
        
        // Check if grounded
        this.checkGrounded();
        
        // Handle dash timer
        if (this.isDashing) {
            this.dashTimer -= delta;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                // Let state manager handle visual feedback
            }
        }
        
        // Handle boost timer (boost v2)
        if (this.isBoosting) {
            this.boostTimer -= delta;
            if (this.boostTimer <= 0) {
                this.isBoosting = false;
                // Let state manager handle visual feedback
            }
        }
        
        // Handle slide timer
        if (this.isSliding) {
            this.slideTimer -= delta;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.slideDirection = 0;
                this.resetSlideState();
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
        
        // Handle wall kick momentum timer
        if (this.wallKickMomentum && this.wallKickMomentumTimer > 0) {
            this.wallKickMomentumTimer -= delta;
            if (this.wallKickMomentumTimer <= 0) {
                this.wallKickMomentum = false;
            }
        }
        
        // Handle dash cooldown
        if (!this.canDash && this.scene.time.now - this.lastDashTime >= this.getCurrentDashConfig().cooldown.value) {
            this.canDash = true;
        }
        
        // Check for wall sliding conditions
        this.checkWallSliding();
        
        // Input handling
        this.handleInput();
        
        // Update visual feedback using state manager
        this.updateVisualFeedback();
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
        
        // Reset wall kick ability and wall running when touching ground
        if (source === 'ground') {
            this.canWallKick = true;
            this.wallRunCount = 0;
            this.isWallRunning = false;
            this.wallRunBoostActive = false;
            this.wallRunActivated = false;
        }
        
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
    
    checkWallSliding() {
        // Wall sliding conditions:
        // 1. Player is in air (not grounded)
        // 2. Player is falling (positive Y velocity) 
        // 3. Player is touching a wall horizontally
        
        const wasWallSliding = this.isWallSliding;
        let shouldWallSlide = false;
        let detectedWallSide = null;
        
        // Only check if player is in air and falling
        if (!this.isGrounded && this.sprite.body.velocity.y > 50) {
            // Check if touching walls horizontally
            const touchingLeft = this.sprite.body.touching.left;
            const touchingRight = this.sprite.body.touching.right;
            
            if (touchingLeft || touchingRight) {
                // Find which wall we're touching using bounds-based detection (more reliable than physics.overlap)
                const playerBounds = this.sprite.getBounds();
                
                for (let wall of this.scene.level.walls) {
                    const wallBounds = wall.getBounds();
                    
                    // Check for bounds overlap (horizontal and vertical)
                    const horizontalOverlap = playerBounds.right > wallBounds.left && 
                                            playerBounds.left < wallBounds.right;
                    const verticalOverlap = playerBounds.bottom > wallBounds.top && 
                                          playerBounds.top < wallBounds.bottom;
                    
                    if (horizontalOverlap && verticalOverlap) {
                        // Determine wall side based on relative positions
                        if (this.sprite.x < wall.x) {
                            // Player is left of wall, so wall is on right side
                            detectedWallSide = 'right';
                        } else {
                            // Player is right of wall, so wall is on left side  
                            detectedWallSide = 'left';
                        }
                        shouldWallSlide = true;
                        console.log(`Wall detected: ${detectedWallSide} side, player at ${this.sprite.x.toFixed(0)}, wall at ${wall.x.toFixed(0)}`);
                        break;
                    }
                }
            }
        }
        
        // Handle wall slide state changes
        if (shouldWallSlide && !wasWallSliding) {
            // Check for momentum conversion when hitting wall during jump
            if (!this.isGrounded && this.sprite.body.velocity.y < 0) {
                // Player is jumping upward and just hit wall - convert horizontal momentum to vertical
                this.convertSprintMomentumToVertical();
            }
            
            // Start wall sliding - check for active boost
            this.startWallSlide(detectedWallSide);
        } else if (!shouldWallSlide && wasWallSliding) {
            // Stop wall sliding
            this.stopWallSlide();
        } else if (shouldWallSlide && wasWallSliding && this.wallSide !== detectedWallSide) {
            // Wall side changed (rare but possible)
            this.stopWallSlide();
            this.startWallSlide(detectedWallSide);
        }
    }
    
    handleInput() {
        // Jumping is allowed during slide for slide-to-jump
        this.handleJumping();
        
        if (this.isDashing || this.isSliding || this.wallKickMomentum) {
            return; // Don't allow movement/crouch/dash/shoot during dash, slide, or wall kick momentum
        }
        
        // Horizontal movement
        this.handleHorizontalMovement();
        
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
        const boostPressed = this.keys.SHIFT.isDown;
        const boostJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.SHIFT);
        
        // Handle different movement systems
        if (this.config.abilities.boostEnabled) {
            if (this.config.versions.movementSystem === 'v1') {
                // Traditional: Hold to boost
                this.isSprinting = boostPressed && (leftPressed || rightPressed);
            } else if (this.config.versions.movementSystem === 'v2') {
                // Boost-integrated: Tap to boost + air dash
                if (boostJustPressed) {
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
                // v2 doesn't use continuous boost
                this.isSprinting = false;
            }
        }
        
        let currentSpeed = this.config.movement.speed.value;
        
        // Apply boost speed for movement systems
        if (this.config.abilities.boostEnabled) {
            if (this.config.versions.movementSystem === 'v1' && this.isSprinting) {
                currentSpeed = this.getCurrentBoostConfig().speed.value;
            } else if (this.config.versions.movementSystem === 'v2' && this.isBoosting) {
                currentSpeed = this.getCurrentBoostConfig().speed.value;
            }
        }
        
        // Handle wall sliding movement
        if (this.isWallSliding) {
            let pressingIntoWall = false;
            let pressingAwayFromWall = false;
            
            if (this.wallSide === 'right') {
                // Wall is on right side
                pressingIntoWall = rightPressed && !leftPressed;
                pressingAwayFromWall = leftPressed && !rightPressed;
                
                if (pressingAwayFromWall) {
                    // Moving away from right wall (left)
                    this.sprite.setVelocityX(-currentSpeed);
                    this.facingRight = false;
                    this.sprite.setFlipX(true);
                } else if (pressingIntoWall) {
                    // Pressing into right wall
                    this.sprite.setVelocityX(0);
                    this.facingRight = true;
                    this.sprite.setFlipX(false);
                } else {
                    // Neutral - stick to wall
                    this.sprite.setVelocityX(0);
                }
            } else if (this.wallSide === 'left') {
                // Wall is on left side
                pressingIntoWall = leftPressed && !rightPressed;
                pressingAwayFromWall = rightPressed && !leftPressed;
                
                if (pressingAwayFromWall) {
                    // Moving away from left wall (right)
                    this.sprite.setVelocityX(currentSpeed);
                    this.facingRight = true;
                    this.sprite.setFlipX(false);
                } else if (pressingIntoWall) {
                    // Pressing into left wall
                    this.sprite.setVelocityX(0);
                    this.facingRight = false;
                    this.sprite.setFlipX(true);
                } else {
                    // Neutral - stick to wall
                    this.sprite.setVelocityX(0);
                }
            }
            
            // Apply wall slide friction when pressing into wall AND falling down
            if (pressingIntoWall && this.sprite.body.velocity.y > 0) {
                // Slow descent when pressing into wall
                this.sprite.setVelocityY(25);
            }
            // If moving up (jumping) or not pressing into wall, let normal physics apply
            
            this.updateMovementVisuals();
            return;
        }
        
        // Handle sliding movement
        if (this.isSliding) {
            // Override normal movement during slide
            this.sprite.setVelocityX(this.slideSpeed * this.slideDirection);
            // Update visual feedback and return early
            this.updateMovementVisuals();
            return;
        }
        
        // Reduce speed when crouching (but not sliding)
        if (this.isCrouching && !this.isSliding) {
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
                // Don't apply air resistance if we have air momentum from boost jump or wall kick
                if (!this.hasAirMomentum && !this.wallKickMomentum) {
                    this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.95); // Air resistance
                }
                // Air momentum and wall kick momentum are handled in update() loop with gradual decay
            }
        }
        
        // Update visual feedback
        this.updateMovementVisuals();
        
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
            // Wall kick system - ALL wall jumps kick away from wall
            if (this.isWallSliding && this.canWallKick) {
                console.log('💥 Performing WALL KICK away from wall');
                this.performWallKick();
                this.jumpBuffer = 0;
            }
            // Regular jump (grounded or coyote time)
            else if (this.isGrounded || this.coyoteTimer > 0) {
                this.sprite.setVelocityY(-this.config.jump.velocity.value);
                this.jumpBuffer = 0;
                this.coyoteTimer = 0;
                
                // Notify state manager about jump
                this.stateManager.startJump();
                
                // Handle slide-to-jump transition
                if (this.isSliding) {
                    // Maintain horizontal momentum from slide
                    this.sprite.setVelocityX(this.slideSpeed * this.slideDirection);
                    
                    // End slide state
                    this.isSliding = false;
                    this.slideDirection = 0;
                    this.resetSlideState();
                    
                    // If we were boost-sliding, extend boost for air momentum
                    if (this.isBoosting && this.config.versions.movementSystem === 'v2') {
                        const boostConfig = this.getCurrentBoostConfig();
                        this.boostTimer += boostConfig.airMomentumDuration?.value || 300;
                        
                        // Visual effect for boost slide jump
                        this.sprite.setTint(0x00FFFF); // Cyan for slide-jump boost extension
                        this.scene.time.delayedCall(150, () => {
                            if (!this.isDashing) {
                                this.updateMovementVisuals();
                            }
                        });
                    }
                }
                
                // Check for regular boost extension (boost-integrated movement system only)
                else if (this.config.versions.movementSystem === 'v2' && this.config.abilities.boostEnabled) {
                    // If jumping during an active boost (not from slide), extend the boost timer
                    if (this.isBoosting && this.boostDirection !== 0) {
                        const boostConfig = this.getCurrentBoostConfig();
                        
                        // Extend the current boost timer by adding air momentum duration
                        this.boostTimer += boostConfig.airMomentumDuration?.value || 300;
                        
                        // Visual effect for boost jump extension
                        this.sprite.setTint(0x00FFFF); // Cyan for extended boost jump
                        this.scene.time.delayedCall(150, () => {
                            if (!this.isDashing) {
                                this.updateMovementVisuals();
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
        const leftPressed = this.cursors.left.isDown || this.keys.A.isDown;
        const rightPressed = this.cursors.right.isDown || this.keys.D.isDown;
        const crouchJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keys.S);
        
        
        if (crouchPressed && this.isGrounded) {
            // For v2 system: prioritize slide when moving with boost
            if (this.config.versions.movementSystem === 'v2') {
                if (crouchJustPressed && (leftPressed || rightPressed) && (this.isBoosting || this.isSprinting)) {
                    console.log('Starting ground slide for v2 system');
                    this.startGroundSlide(leftPressed ? -1 : 1);
                } else if (!this.isCrouching && !this.isSliding) {
                    console.log('Starting regular crouch for v2 system');
                    this.isCrouching = true;
                    if (!this.crouchVisualApplied) {
                        this.applyCrouchState();
                    }
                }
            } else {
                // v1 system: regular crouch only
                if (!this.isCrouching) {
                    console.log('Starting regular crouch for v1 system');
                    this.isCrouching = true;
                    if (!this.crouchVisualApplied) {
                        this.applyCrouchState();
                    }
                }
            }
        } else {
            // Release crouch/slide
            if (this.isCrouching) {
                console.log('Stopping crouch');
                this.isCrouching = false;
                this.resetCrouchState();
            }
            if (this.isSliding) {
                console.log('Stopping slide');
                this.isSliding = false;
                this.slideDirection = 0;
                this.resetSlideState();
            }
        }
    }
    
    applyCrouchState() {
        if (this.crouchVisualApplied) return; // Prevent multiple applications
        
        // Scale down to half height and move down to keep bottom anchored
        this.sprite.setScale(1, 0.5); // Keep width, halve height
        
        // Move down by quarter of original height to keep bottom anchored
        // Original height is 32px, half height is 16px, so move down by 8px
        this.sprite.y += 8;
        
        this.sprite.setTint(0xFF0000); // Red tint to see the change clearly
        
        this.crouchVisualApplied = true;
        console.log('Applied crouch state - scaled to 0.5 height and repositioned');
    }
    
    resetCrouchState() {
        if (!this.crouchVisualApplied) return; // Prevent multiple resets
        
        // Scale back to normal and move up to restore original position
        this.sprite.setScale(1, 1); // Back to normal size
        
        // Move up by quarter of original height to restore bottom position
        // We moved down by 8px when crouching, so move back up by 8px
        this.sprite.y -= 8;
        
        this.sprite.setTint(0xFFFFFF); // Back to normal color
        
        this.crouchVisualApplied = false;
        console.log('Reset crouch state - scaled back to normal and repositioned');
    }
    
    applySlideState() {
        // Same scaling as crouch but with slide-specific visual feedback
        this.sprite.setScale(1, 0.5); // Keep width, halve height
        this.sprite.y += 8; // Move down to keep bottom anchored
        
        // Slide-specific color (orange to distinguish from crouch)
        if (this.isBoosting) {
            this.sprite.setTint(0xFF8C00); // Dark orange for boost slide
        } else {
            this.sprite.setTint(0xFFA500); // Orange for regular slide
        }
        
        console.log('Applied slide state - scaled and colored for sliding');
    }
    
    resetSlideState() {
        // Reset scale and position (same as crouch reset)
        this.sprite.setScale(1, 1);
        this.sprite.y -= 8;
        
        console.log('Reset slide state - scaled back to normal');
    }
    
    startGroundSlide(direction) {
        if (this.isDashing || this.isSliding) return; // Can't slide while dashing or already sliding
        
        // Ground slide acts like a dash in crouch state
        this.isSliding = true;
        this.slideDirection = direction;
        this.slideTimer = this.getCurrentSlideConfig().duration.value; // 800ms default
        
        // Apply slide visual state (crouched appearance)
        this.applySlideState();
        
        // Determine slide speed based on current movement state
        let slideSpeed;
        if (this.isBoosting) {
            slideSpeed = this.getCurrentBoostConfig().speed?.value || 400;
        } else if (this.isSprinting) {
            slideSpeed = this.getCurrentBoostConfig().speed?.value || 320;
        } else {
            slideSpeed = 250; // Default slide speed
        }
        
        // Apply immediate horizontal velocity (like a dash)
        this.sprite.setVelocityX(slideSpeed * direction);
        this.sprite.setVelocityY(0); // Stop vertical movement during slide
        
        // Update facing direction
        this.facingRight = direction > 0;
        this.sprite.setFlipX(!this.facingRight);
        
        console.log(`Ground slide started: speed=${slideSpeed}, direction=${direction}, duration=${this.slideTimer}`);
    }
    
    updateVisualFeedback() {
        // Use state manager for consistent visual feedback
        const stateColor = this.stateManager.getStateColor();
        const intensity = this.stateManager.getEnergyIntensity();
        
        // Apply some alpha variation based on energy intensity for boost states
        if (this.stateManager.currentBoostState) {
            // Slightly vary opacity based on energy level (0.7 to 1.0)
            const alpha = 0.7 + (intensity * 0.3);
            this.sprite.setAlpha(alpha);
        } else {
            this.sprite.setAlpha(1.0);
        }
        
        // Don't override crouch color when visually applied
        if (this.isCrouching && this.crouchVisualApplied) {
            return;
        }
        
        this.sprite.setTint(stateColor);
    }
    
    // Legacy method for compatibility - now calls new visual feedback
    updateMovementVisuals() {
        this.updateVisualFeedback();
    }
    
    performBoost(direction) {
        if (this.isBoosting || !this.config.abilities.boostEnabled) return;
        if (this.config.versions.movementSystem !== 'v2') return;
        if (!this.isGrounded) return; // Can only boost while grounded
        
        const boostConfig = this.getCurrentBoostConfig();
        
        // Safety check: ensure v2 properties exist
        if (!boostConfig.duration) {
            console.warn('Sprint v2 duration property missing');
            return;
        }
        
        // Try to start boost using state manager
        if (this.stateManager.startBoost()) {
            this.isBoosting = true;
            this.boostTimer = boostConfig.duration.value;
            this.boostDirection = direction;
            this.lastBoostTime = this.scene.time.now;
            
            // Don't apply velocity directly - let normal movement handling apply boost speed
        }
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
        
        // Notify state manager about dash
        this.stateManager.startDash();
        
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
    
    startWallSlide(side = 'right') {
        if (this.isWallSliding) return; // Already wall sliding
        
        this.isWallSliding = true;
        this.wallSide = side; // Store which side the wall is on
        
        // Capture boost for wall running
        if (this.isBoosting && this.config.versions.movementSystem === 'v2') {
            this.wallRunBoostActive = true;
            console.log('🟢 WALL RUN ACTIVATED - Sprint boost + wall contact!');
        } else {
            this.wallRunBoostActive = false;
            console.log('🔵 Normal wall slide - no boost');
            console.log(`isBoosting: ${this.isBoosting}, movementSystem: ${this.config.versions.movementSystem}`);
        }
        
        // Don't immediately change velocity - let normal physics continue
        // Wall slide friction will be applied in handleHorizontalMovement based on input
        
        // Visual feedback - different colors for boost vs normal wall sliding
        if (this.wallRunBoostActive) {
            this.sprite.setTint(0x00FFAA); // Green-blue tint for boost wall slide
        } else {
            this.sprite.setTint(0x00AAFF); // Blue tint for normal wall slide
        }
        
        console.log(`Started wall sliding on ${side} side`);
    }
    
    stopWallSlide() {
        if (!this.isWallSliding) return; // Not wall sliding
        
        this.isWallSliding = false;
        this.wallSide = null;
        
        // Don't reset wall run boost here - preserve it for potential wall kick
        
        // Reset to normal physics
        // (Don't reset velocity here - let normal movement handle it)
        
        // Update visual feedback
        this.updateMovementVisuals();
        
        console.log('Stopped wall sliding');
    }
    
    performWallKick() {
        if (!this.isWallSliding || !this.canWallKick) return;
        
        // Context-sensitive wall jump based on current vertical velocity
        const currentVerticalVelocity = this.sprite.body.velocity.y;
        const baseJumpPower = this.config.jump.velocity.value;
        let jumpPower, kickPower;
        let jumpType;
        
        console.log(`🔍 Wall jump debug: vertical velocity = ${currentVerticalVelocity.toFixed(1)}`);
        
        if (currentVerticalVelocity < -20) {
            // WALL PEAK JUMP - Player moving upward, kick away with high arc
            jumpType = "wall_peak";
            jumpPower = baseJumpPower * 0.8; // High vertical for big arc
            kickPower = 450; // Moderate horizontal kick 
            console.log('⬆️ WALL PEAK JUMP - HIGH arc, medium distance');
        } else {
            // WALL SLIDE JUMP - Player sliding down or moving slowly, kick away with low fast arc
            jumpType = "wall_slide";
            jumpPower = baseJumpPower * 0.3; // Very low vertical for fast trajectory
            kickPower = 800; // Very strong horizontal kick for maximum distance
            console.log('➡️ WALL SLIDE JUMP - LOW arc, MAXIMUM distance');
        }
        
        let horizontalDirection;
        
        // Determine kick direction based on wall side
        if (this.wallSide === 'right') {
            // Wall is on right, kick left
            horizontalDirection = -1;
        } else if (this.wallSide === 'left') {
            // Wall is on left, kick right  
            horizontalDirection = 1;
        } else {
            // Fallback
            horizontalDirection = this.facingRight ? -1 : 1;
        }
        
        // Apply kick velocities - strong horizontal boost + full vertical jump
        this.sprite.setVelocityY(-jumpPower);
        this.sprite.setVelocityX(kickPower * horizontalDirection);
        
        // Debug logging
        console.log(`Wall kick applied: X velocity = ${kickPower * horizontalDirection}, Y velocity = ${-jumpPower}`);
        
        // Check velocity immediately after setting it
        this.scene.time.delayedCall(16, () => { // Next frame check
            console.log(`Wall kick velocity check: X = ${this.sprite.body.velocity.x.toFixed(1)}, Y = ${this.sprite.body.velocity.y.toFixed(1)}`);
        });
        
        // Update state
        this.canWallKick = false; // One kick per wall contact
        this.isWallSliding = false;
        this.wallSide = null;
        
        // Reset wall running state after kick
        this.wallRunBoostActive = false;
        this.isWallRunning = false;
        
        // Activate momentum preservation
        this.wallKickMomentum = true;
        this.wallKickMomentumTimer = this.wallKickMomentumDuration;
        
        // Update facing direction based on kick direction
        this.facingRight = horizontalDirection > 0;
        this.sprite.setFlipX(!this.facingRight);
        
        // Visual feedback based on jump type
        if (jumpType === 'wall_peak') {
            this.sprite.setTint(0x00FFFF); // Cyan for wall peak jump
        } else {
            this.sprite.setTint(0xFF6600); // Orange for wall slide jump
        }
        
        this.scene.time.delayedCall(300, () => {
            if (!this.isDashing) {
                this.updateMovementVisuals();
            }
        });
        
        console.log(`${jumpType === 'wall_peak' ? '⬆️' : '➡️'} ${jumpType.toUpperCase().replace('_', ' ')} JUMP: direction=${horizontalDirection}, kick power=${kickPower}, jump power=${jumpPower.toFixed(0)}`);
    }
    
    performWallRun() {
        if (!this.isWallSliding || !this.wallRunBoostActive || this.wallRunCount >= this.maxWallRuns) return;
        
        // Wall running - wall friction helps boost vertical jump power
        const baseJumpPower = this.config.jump.velocity.value;
        const boostConfig = this.getCurrentBoostConfig();
        const boostSpeed = boostConfig.speed?.value || 400;
        
        // Wall friction boost - the faster you were boosting, the more the wall helps you climb
        const wallFrictionBoost = 1.4; // Wall friction gives 40% extra vertical power
        const jumpPower = baseJumpPower * wallFrictionBoost;
        
        // Determine direction to maintain alongside wall
        let horizontalDirection = 0;
        if (this.wallSide === 'right') {
            // Wall on right, maintain rightward momentum
            horizontalDirection = 1;
        } else if (this.wallSide === 'left') {
            // Wall on left, maintain leftward momentum  
            horizontalDirection = -1;
        }
        
        // Apply wall run velocities - wall friction enhanced vertical + maintained horizontal momentum
        this.sprite.setVelocityY(-jumpPower);
        this.sprite.setVelocityX(boostSpeed * 0.8 * horizontalDirection); // Reduced horizontal for wall proximity
        
        // Update wall running state
        this.wallRunCount++;
        this.isWallRunning = true;
        this.isWallSliding = false;
        this.wallSide = null;
        
        // Extend boost timer for continued wall running
        if (this.isBoosting) {
            this.boostTimer += boostConfig.airMomentumDuration?.value || 300;
        }
        
        // Visual feedback - bright cyan for wall running
        this.sprite.setTint(0x00FFFF);
        
        this.scene.time.delayedCall(200, () => {
            if (!this.isDashing) {
                this.updateMovementVisuals();
            }
        });
        
        console.log(`🧗 Wall friction climb #${this.wallRunCount}: vertical=${jumpPower.toFixed(0)} (${wallFrictionBoost}x boost), horizontal=${(boostSpeed * 0.8 * horizontalDirection).toFixed(0)}`);
    }
    
    convertSprintMomentumToVertical() {
        // Convert horizontal boost momentum to vertical boost when hitting wall during jump
        const currentHorizontalSpeed = Math.abs(this.sprite.body.velocity.x);
        const currentVerticalSpeed = Math.abs(this.sprite.body.velocity.y);
        
        // Only convert if player has significant horizontal velocity (from boost)
        if (currentHorizontalSpeed > 200) {
            // ACTIVATE WALL RUN immediately when boost jumping into wall
            if (this.isBoosting && this.config.versions.movementSystem === 'v2') {
                this.wallRunBoostActive = true;
                this.wallRunActivated = true;
                console.log('🟢 WALL RUN ACTIVATED - Sprint jump into wall!');
                
                // Force visual update immediately
                this.sprite.setTint(0x00FF00); // Bright green for wall run
            }
            
            // Convert horizontal momentum to vertical boost
            const momentumConversion = 0.3; // Convert 30% of horizontal speed to vertical
            const verticalBoost = currentHorizontalSpeed * momentumConversion;
            
            // Add the boost to current vertical velocity (upward)
            const newVerticalVelocity = this.sprite.body.velocity.y - verticalBoost;
            this.sprite.setVelocityY(newVerticalVelocity);
            
            // Reduce horizontal velocity since some energy was converted
            const energyLoss = 0.4; // Lose 40% of horizontal speed from wall impact
            this.sprite.setVelocityX(this.sprite.body.velocity.x * energyLoss);
            
            // Don't override visual feedback here if wall run is activated
            if (!this.wallRunActivated) {
                this.sprite.setTint(0xFFFF00); // Yellow for momentum conversion only
                this.scene.time.delayedCall(150, () => {
                    if (!this.isDashing) {
                        this.updateMovementVisuals();
                    }
                });
            }
            
            console.log(`⚡ Momentum conversion: horizontal ${currentHorizontalSpeed.toFixed(0)} → vertical boost ${verticalBoost.toFixed(0)}`);
        }
    }
}