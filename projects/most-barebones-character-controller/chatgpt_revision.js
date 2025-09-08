/* 
Finite-State Character Controller (Phaser 3 Arcade)
- States: idle | run | airborne | boosted | charging | sliding | boostJump | chargeJump
- Features:
  • Coyote time (80ms), jump buffer (75ms)
  • Acceleration/drag with maxVelocity clamp
  • Tap-to-arm Boost (400ms). If still holding Shift when boost expires (and unused), auto-transitions to Charge.
  • Charge reaches ready at 600ms; Charge Jump is vertical, powerful.
  • Ground slide (1000ms or cancel on opposite input) with proper collider resize and bottom anchor.
  • Air control maintained on Boost Jump, with steer.
  • Shift can be held in air to “buffer” activation: boost arms on next grounded frame.
*/

class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }
  
    preload() {
      // platform
      this.add.graphics({ fillStyle: { color: 0x8B4513 } })
        .fillRect(0, 0, 32, 32)
        .generateTexture('platform', 32, 32);
  
      // player (white so tints are pure)
      this.add.graphics({ fillStyle: { color: 0xffffff } })
        .fillRect(0, 0, 32, 64)
        .generateTexture('player', 32, 64);
    }
  
    create() {
      // --- World ---
      this.platforms = this.physics.add.staticGroup();
      const ground = this.platforms.create(400, 550, 'platform'); // 800x96
      ground.setScale(25, 3).refreshBody();
      this.platforms.create(200, 400, 'platform').setScale(6, 1).refreshBody();
      this.platforms.create(600, 300, 'platform').setScale(6, 1).refreshBody();
  
      // --- Player ---
      this.player = this.physics.add.sprite(100, 450, 'player');
      this.player.setOrigin(0.5, 1);
      this.player.setTint(0x3498db);
      this.player.setCollideWorldBounds(true);
      this.player.setBounce(0.05);
      this.player.setSize(32, 64).setOffset(0, 0);
      this.player.body.setMaxVelocity(350, 2000);   // clamp x, generous y
      this.player.body.setDragX(1400);              // strong ground drag (also used in air)
      this.physics.add.collider(this.player, this.platforms);
  
      // --- Input ---
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyJump  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      // --- Constants (spec-aligned) ---
      this.SPEED_NORMAL = 160;
      this.SPEED_BOOST  = 320;   // 2.0x
      this.SPEED_CHARGE = 128;   // 0.8x
      this.SPEED_SLIDE  = 300;   // ~1.88x
  
      this.ACCEL_RUN    = 2200;  // acceleration toward target speed
      this.JUMP_V       = -500;  // normal jump
      this.BOOST_JUMP_V = -550;  // boost jump vertical
      this.BOOST_JUMP_H = 450;   // horizontal oomph on boost jump (matches barebones)
  
      this.DUR_BOOST    = 400;   // ms
      this.DUR_CHARGE   = 600;   // ms to full
      this.DUR_SLIDE    = 1000;  // ms
  
      this.COYOTE_MS    = 80;    // jump grace after leaving ground
      this.JUMP_BUFFER_MS = 75;  // pre-land jump buffer
  
      // --- Runtime vars ---
      this.state = 'idle';           // Movement state: idle, running, jumping, boost-jumping, charge-jumping, ground-sliding, boosted, charging
      this.environment = 'ground';   // Environment state: ground, airborne, submerged (future)
      this.facing = 1; // 1:right, -1:left
      this.boostTimer = 0;
      this.chargeTime = 0;
      this.slideTimer = 0;
      this.slideDir = 0;
      this.boostPending = false;   // Shift tapped/held in air, arm boost on land
      this.boostSpent = false;     // this boost window got used (jump/slide)
      this.coyote = 0;
      this.jumpBuffer = 0;

      // --- State Tracking Debug ---
      this.activatedStates = new Set(); // Track which states have been activated
      this.activatedEnvironments = new Set(); // Track which environments have been activated
      this.activatedBoostStatuses = new Set(); // Track which boost statuses have been activated

      // --- Debug HUD ---
      this.debugText = this.add.text(16, 16, '', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      });
  
      // helpers
      this.setTintForState('idle');
    }
  
    // ---------- FSM ----------
    setState(next) {
      if (this.state === next) return;
      // onExit
      if (this.state === 'ground-sliding') this._endSlideCollider();
      // set
      this.state = next;
      this.setTintForState(next);
      this._trackStateActivation('movement', next);
    }

    setEnvironment(next) {
      if (this.environment === next) return;
      this.environment = next;
      this._trackStateActivation('environment', next);
      // Future: handle environment-specific logic here
    }

    _trackStateActivation(type, stateName) {
      if (type === 'environment') {
        if (!this.activatedEnvironments.has(stateName)) {
          this.activatedEnvironments.add(stateName);
          this._logActivatedStates();
        }
      } else if (type === 'movement') {
        if (!this.activatedStates.has(stateName)) {
          this.activatedStates.add(stateName);
          this._logActivatedStates();
        }
      } else if (type === 'boost') {
        if (!this.activatedBoostStatuses.has(stateName)) {
          this.activatedBoostStatuses.add(stateName);
          this._logActivatedStates();
        }
      }
    }

    _logActivatedStates() {
      const allStates = [...this.activatedStates, ...this.activatedEnvironments, ...this.activatedBoostStatuses];
      if (allStates.length > 0) {
        console.log('Activated:', allStates.join(', '));
      }
    }
  
    setTintForState(st) {
      const tints = {
        idle:           0x3498db, // blue
        running:        0x3498db, // blue
        jumping:        0x3498db, // blue
        'boost-jumping': 0xffff00, // bright yellow
        'charge-jumping': 0x00ff00, // green
        'ground-sliding': 0x54a0ff, // slide blue
        boosted:        0xff6b6b, // red
        charging:       0xfeca57, // yellow
        chargeReady:    0xff8c00, // orange (handled within charging)
      };
      const tint = tints[st] ?? 0x3498db;
      this.player.setTint(tint);
    }

    setTintForEnvironment(env) {
      // Future: environment-specific tints (e.g., darker blue when submerged)
      const envTints = {
        ground:     0xffffff, // no tint override
        airborne:   0xffffff, // no tint override
        submerged:  0x4a90e2, // darker blue for underwater (future)
      };
      // For now, just return the current tint
      return this.player.tintTopLeft;
    }
  
    // ---------- Update ----------
    update(time, delta) {
      const dt = Math.min(delta, 50); // clamp for safety on big frames
  
      // Grounded & coyote
      const wasGrounded = this.isGrounded;
      this.isGrounded = this.player.body.onFloor();
      if (this.isGrounded) this.coyote = this.COYOTE_MS;
      else this.coyote = Math.max(0, this.coyote - dt);

      // Update environment state
      if (this.isGrounded) {
        this.setEnvironment('ground');
      } else {
        this.setEnvironment('airborne');
      }
  
      // Jump input buffering
      if (Phaser.Input.Keyboard.JustDown(this.keyJump)) {
        this.jumpBuffer = this.JUMP_BUFFER_MS;
      } else {
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      }
  
      // Boost key logic (tap-to-arm)
      const shiftJustDown = Phaser.Input.Keyboard.JustDown(this.keyShift);
      if (shiftJustDown && !this.boostActive() && !this.chargingActive()) {
        // if in air, mark pending; if on ground, arm immediately
        if (this.isGrounded) this._armBoostWindow();
        else this.boostPending = true;
      }
  
      // If we land with a pending Shift, arm boost
      if (this.isGrounded && !wasGrounded && this.boostPending && !this.boostActive() && !this.chargingActive()) {
        this._armBoostWindow();
        this.boostPending = false;
      }
  
      // Update boost/charge timers & transitions
      this._updateBoostCharge(dt);
  
      // State machine routing
      if (this.state === 'ground-sliding') {
        this._updateSlide(dt);
        // sliding overrides most other controls
      } else if (this.state === 'boost-jumping' || this.state === 'charge-jumping') {
        this._updateAirControlDuringBoostJump();
        if (this.isGrounded) {
          // land → idle/running
          this.setState(this._moveInputAxis() !== 0 ? 'running' : 'idle');
        }
      } else if (this.state === 'jumping') {
        if (this.isGrounded) {
          // land → idle/running
          this.setState(this._moveInputAxis() !== 0 ? 'running' : 'idle');
        }
      } else {
        // Movement, jump handling, and slide start check
        this._handleRunMove(dt);
        this._handleJumpIfBuffered();
  
        // Start ground slide: Boost active + dir + down + grounded
        if (this.boostActive() &&
            this.cursors.down.isDown &&
            this.isGrounded &&
            this._moveInputAxis() !== 0 &&
            this.state !== 'ground-sliding') {
          console.log('Ground slide conditions met:', {
            boostActive: this.boostActive(),
            downPressed: this.cursors.down.isDown,
            grounded: this.isGrounded,
            moveAxis: this._moveInputAxis(),
            state: this.state
          });
          this._startSlide();
        }
  
        // State from environment & boost/charge (only if not in special jump states)
        if (this.state !== 'boost-jumping' && this.state !== 'charge-jumping' && this.state !== 'jumping') {
          if (this.environment === 'ground') {
            if (this.boostActive()) this.setState('boosted');
            else if (this.chargingActive()) this.setState('charging');
            else this.setState(this._moveInputAxis() !== 0 ? 'running' : 'idle');
          } else if (this.environment === 'airborne') {
            if (this.boostActive()) this.setState('boosted'); // airborne but boosted window armed
            else if (this.chargingActive()) this.setState('charging');
            else this.setState('idle'); // airborne idle (no "airborne" movement state)
          }
        } else {
          // Debug: Log when we're in a special jump state
          if (this.state === 'boost-jumping' || this.state === 'charge-jumping' || this.state === 'jumping') {
            console.log('In special jump state, skipping state machine:', {
              state: this.state,
              environment: this.environment,
              boostActive: this.boostActive(),
              chargingActive: this.chargingActive()
            });
          }
        }
      }
  
      // Debug HUD
      this._updateHUD();
    }
  
    // ---------- Movement ----------
    _moveInputAxis() {
      const left = this.cursors.left.isDown;
      const right = this.cursors.right.isDown;
      if (left && !right) return -1;
      if (right && !left) return 1;
      return 0;
    }
  
    _targetRunSpeed() {
      if (this.state === 'ground-sliding') return this.SPEED_SLIDE * this.slideDir;
      if (this.state === 'boosted' || this.state === 'boost-jumping') return this.SPEED_BOOST * this.facing;
      if (this.state === 'charging') return 0; // we slow down a bit; use accel toward 0
      // base run
      return this.SPEED_NORMAL * this.facing;
    }
  
    _handleRunMove(dt) {
      const axis = this._moveInputAxis();
      if (axis !== 0) this.facing = axis;
  
      // choose target speed based on current mode
      let targetSpeed = 0;
  
      if (this.state === 'boosted') {
        targetSpeed = this.SPEED_BOOST * axis;
      } else if (this.state === 'charging') {
        // slow drift while charging
        targetSpeed = this.SPEED_CHARGE * axis;
      } else {
        targetSpeed = this.SPEED_NORMAL * axis;
      }
  
      // Apply acceleration toward target
      const vx = this.player.body.velocity.x;
      const diff = targetSpeed - vx;
      const acc = Phaser.Math.Clamp(diff * 20, -this.ACCEL_RUN, this.ACCEL_RUN); // proportional accel
      this.player.setAccelerationX(acc);
  
      // flip visual (optional; sprite is a rectangle)
      if (axis !== 0) this.player.setFlipX(axis < 0);
    }
  
    // ---------- Jumping ----------
    _canJumpNow() {
      return this.isGrounded || this.coyote > 0;
    }
  
    _handleJumpIfBuffered() {
      const wantJump = this.jumpBuffer > 0;
      if (!wantJump) return;
  
      if (!this._canJumpNow()) return; // keep buffer running until it expires
  
      // Consume buffer
      this.jumpBuffer = 0;
  
      // Charge Jump (requires full charge)
      if (this.chargingActive() && this.chargeTime >= this.DUR_CHARGE) {
        this.player.setVelocityY(-800);   // full power
        this.player.setVelocityX(0);
        this.chargeTime = 0;
        this._endCharge();
        this.setState('charge-jumping');
        this.setTintForState('charge-jumping');
        return;
      }

      // Boost Jump (if boost active OR jumping from slide)
      if (this.boostActive() || this.state === 'ground-sliding') {
        console.log('Boost jump triggered:', {
          boostActive: this.boostActive(),
          chargingActive: this.chargingActive(),
          currentState: this.state,
          chargeTime: this.chargeTime,
          boostSpent: this.boostSpent
        });
        this.player.setVelocityY(this.BOOST_JUMP_V);
        // Use current input direction, or facing if no input
        const currentDirection = this.cursors.left.isDown ? -1 : (this.cursors.right.isDown ? 1 : 0);
        const dir = currentDirection !== 0 ? currentDirection : this.facing;
        this.player.setVelocityX(dir * this.BOOST_JUMP_H);
        this._spendBoost();
        if (this.state === 'ground-sliding') this._endSlide(true);
        this.setState('boost-jumping');
        this.setTintForState('boost-jumping');
        console.log('After boost jump setup:', {
          newState: this.state,
          chargeTime: this.chargeTime,
          boostSpent: this.boostSpent
        });
        return;
      }

      // Normal Jump
      this.player.setVelocityY(this.JUMP_V);
      this.setState('jumping');
      this.setTintForState('jumping');
    }
  
    _updateAirControlDuringBoostJump() {
      // keep strong air control at boost speed (like barebones version)
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.SPEED_BOOST);
        this.facing = -1;
        this.player.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.SPEED_BOOST);
        this.facing = 1;
        this.player.setFlipX(false);
      }
      // else let momentum continue (don't set velocity to 0)
    }
  
    // ---------- Boost / Charge ----------
    boostActive() { return this.boostTimer > 0 && !this.boostSpent; }
    chargingActive() { return this.chargeTime > 0 && !this.boostSpent; }
  
    _armBoostWindow() {
      this.boostTimer = this.DUR_BOOST;
      this.boostSpent = false;
      // Do NOT require key to be held; window persists until timer or spent
    }
  
    _spendBoost() {
      // Consumes current boost and blocks charge auto-transition for this window
      this.boostTimer = 0;
      this.boostSpent = true;
      this.boostPending = false;
      this._endCharge();
    }
  
    _endCharge() {
      this.chargeTime = 0;
    }
  
    _updateBoostCharge(dt) {
      // If Shift released, clear pending and cancel charging
      if (!this.keyShift.isDown) {
        this.boostPending = false;
        // Cancel charging if shift is released
        if (this.chargingActive()) {
          this._endCharge();
        }
      }

      // Boost countdown
      if (this.boostTimer > 0) {
        this.boostTimer = Math.max(0, this.boostTimer - dt);
        if (this.boostTimer === 0) {
          // If Shift still held and not spent, auto-enter charging
          if (this.keyShift.isDown && !this.boostSpent) {
            this.chargeTime = 0.001; // start charging
          } else {
            // window ended, nothing else
          }
        }
      }

      // Charging timer (only if not spent AND shift still held)
      if (this.chargeTime > 0 && !this.boostSpent && this.keyShift.isDown) {
        this.chargeTime = Math.min(this.DUR_CHARGE, this.chargeTime + dt);
        // Visual: yellow while charging, orange when ready
        if (this.chargeTime >= this.DUR_CHARGE) {
          this.player.setTint(0xff8c00); // charge ready (orange)
        } else {
          this.player.setTint(0xfeca57); // charging (yellow)
        }
      } else if (this.chargeTime > 0 && !this.keyShift.isDown) {
        // Cancel charging if shift released
        this._endCharge();
      }
    }
  
    // ---------- Slide ----------
    _startSlide() {
      this.slideTimer = this.DUR_SLIDE;
      this.slideDir = this._moveInputAxis() !== 0 ? this._moveInputAxis() : (this.facing || 1);
      this._spendBoost(); // slide consumes the boost window
      this.setState('ground-sliding');
      this.player.setVelocityX(this.SPEED_SLIDE * this.slideDir);
      this._startSlideCollider();
      this.setTintForState('ground-sliding');
      console.log('Ground slide started!', { slideDir: this.slideDir, speed: this.SPEED_SLIDE });
    }
  
    _updateSlide(dt) {
      // cancel on opposite direction or timer or leaving ground
      const opposite =
        (this.slideDir > 0 && this.cursors.left.isDown) ||
        (this.slideDir < 0 && this.cursors.right.isDown);
  
      this.slideTimer = Math.max(0, this.slideTimer - dt);
  
      if (this.slideTimer === 0 || !this.isGrounded || opposite) {
        this._endSlide(false);
      } else {
        // maintain slide speed (no control)
        this.player.setVelocityX(this.SPEED_SLIDE * this.slideDir);
      }
    }
  
    _endSlide(jumped) {
      this.slideTimer = 0;
      this.slideDir = 0;
      this._endSlideCollider();
      // state will be set by caller/jump or grounded logic
    }
  
    _startSlideCollider() {
      // visually half height & collider half height, anchored at bottom
      this.player.setScale(1, 0.5);
      this.player.setSize(32, 32);
      this.player.setOffset(0, 32);
    }
  
    _endSlideCollider() {
      this.player.setScale(1, 1);
      this.player.setSize(32, 64);
      this.player.setOffset(0, 0);
    }
  
    // ---------- HUD ----------
    _updateHUD() {
      // speed multiplier for display
      const vx = Math.abs(this.player.body.velocity.x);
      let mult = (vx / this.SPEED_NORMAL) || 0;
      mult = Math.round(mult * 10) / 10;

      // charge %
      const chargePct = Math.round((this.chargeTime / this.DUR_CHARGE) * 100);

      // State labels with more detail
      let movementState = this.state;
      if (this.state === 'charging' && this.chargeTime >= this.DUR_CHARGE) {
        movementState = 'chargeReady';
      }
      
      // Boost status information
      let boostStatus = 'INACTIVE';
      if (this.boostActive()) {
        boostStatus = 'ACTIVE';
      } else if (this.chargingActive()) {
        boostStatus = this.chargeTime >= this.DUR_CHARGE ? 'READY' : 'CHARGING';
      } else if (this.boostPending) {
        boostStatus = 'PENDING';
      }

      // Track boost status activation
      this._trackStateActivation('boost', boostStatus);

      this.debugText.setText([
        'Controls: Arrows=Move, Space=Jump, Shift=Boost/Charge',
        'Combos: Boost+Jump, Boost+Dir+Down=Slide',
        '',
        `Environment: ${this.environment.toUpperCase()}`,
        `Movement: ${movementState}`,
        `Boost Status: ${boostStatus}`,
        '',
        `Speed: ${mult.toFixed(1)}x | Charge: ${Phaser.Math.Clamp(chargePct, 0, 100)}%`,
        `Grounded: ${this.isGrounded ? 'YES' : 'NO'} | Coyote: ${this.coyote.toFixed(0)}ms`,
        `Jump Buffer: ${this.jumpBuffer.toFixed(0)}ms | Boost Timer: ${this.boostTimer.toFixed(0)}ms`
      ]);
    }
  }
  
  // --- Game config ---
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
  
  const game = new Phaser.Game(config);
  