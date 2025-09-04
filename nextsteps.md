# Next Steps for Platformer Development

## Immediate Priority Features

### Enhanced Crouch & Ground Slide System

#### Current Issues with Crouch:
- Just changes hitbox size and applies gray tint
- No momentum or interesting mechanics
- Feels static and limited

#### Better Crouch System Ideas:
- **Slide transition**: Crouch while moving → slide with momentum
- **Slide duration**: Time-based slide that gradually slows down
- **Slide jump**: Jump during slide for low-profile movement
- **Slide dash**: Dash while sliding for extended distance
- **Surface interaction**: Slide under obstacles, through tight spaces
- **Speed mechanics**: Slide faster on slopes, slower uphill

#### Ground Slide Mechanics:
- **Momentum-based**: Inherit current movement speed when initiating slide
- **Friction system**: Gradual slowdown with configurable friction values
- **Direction control**: Limited steering while sliding
- **Slide boost**: Possible integration with sprint v2 system
- **Visual feedback**: Particle trail, different sprite animation

### Platform System Improvements

#### Current Platform Issues:
- Bounds-based detection can be imprecise
- Player gets "carried" even when slightly beside platform
- No clear separation between collision and "riding" detection

#### Trigger Zone Approach:
- **Separate collision boxes**:
  - **Solid collision**: Normal platform physics (can't pass through)
  - **Trigger zone**: Invisible area on top for "riding" detection
- **Trigger zone benefits**:
  - More precise "on platform" detection
  - Can be larger/smaller than visual platform
  - Clear separation of concerns
  - Better debug visualization

#### Implementation Concepts:
- **Platform components**: 
  - Visual sprite (what you see)
  - Physics body (solid collision)  
  - Trigger zone (riding detection)
- **Trigger events**: `onTriggerEnter`, `onTriggerStay`, `onTriggerExit`
- **Multi-platform handling**: Player can only "ride" one platform at a time
- **Debug visualization**: Show trigger zones in debug mode

#### Advanced Platform Features:
- **One-way platforms**: Can jump through from below
- **Moving platform chains**: Platforms that follow paths
- **Conditional platforms**: Appear/disappear based on conditions
- **Platform types**: Ice (slippery), conveyor belts, bouncy

## Future Development Ideas

### Combat & Enemies
- **Basic enemies**: Simple AI patterns (patrol, chase, jump)
- **Enemy types**: Ground walkers, flying enemies, turret-style shooters
- **Combat mechanics**: Stomp-to-kill, shoot-to-kill, invincibility frames
- **Health system**: Player HP, enemy HP, damage feedback

### Level Design & Progression
- **Multiple levels**: Level loading system, progression tracking
- **Checkpoints**: Save points within levels
- **Collectibles**: Coins, power-ups, ability unlocks
- **Environmental hazards**: Spikes, pits, moving hazards

### Advanced Movement
- **Wall mechanics**: Wall jump, wall slide, wall climb
- **Swimming**: Water physics, underwater movement
- **Grappling hook**: Point-and-swing mechanics
- **Movement v3**: New experimental movement system

### Visual & Polish
- **Particle effects**: Enhanced feedback for actions
- **Screen effects**: Camera shake improvements, screen transitions
- **Real sprites**: Replace colored rectangles with actual art
- **Animations**: Sprite animations for movement states

### Audio System
- **Sound effects**: Jump, dash, shoot, enemy hit sounds
- **Background music**: Level themes, menu music
- **Audio feedback**: Directional audio, volume controls

### UI & Menus
- **Main menu**: Start, options, level select
- **Pause system**: In-game pause with resume/restart options
- **HUD elements**: Health, score, ability cooldown indicators

### Technical Infrastructure
- **Save system**: Game progress, settings persistence
- **Performance**: Optimization, object pooling
- **Mobile support**: Touch controls, responsive scaling

## Integration Notes

Both slide and platform systems would integrate well with the existing movement v1/v2 framework:

- **Slide system** could have different behaviors per movement system
- **Improved platforms** would make all movement feel more reliable
- **Slide mechanics** could pair really well with the boost system for extended momentum gameplay

## Recommended Implementation Order

1. **Platform trigger zones** - Improves fundamental movement reliability
2. **Ground slide system** - Adds significant gameplay depth
3. **Enhanced crouch mechanics** - Polish existing systems
4. **Visual feedback improvements** - Make new systems feel great
5. **Advanced platform types** - Expand level design possibilities