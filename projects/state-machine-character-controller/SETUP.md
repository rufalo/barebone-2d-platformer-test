# Setup Guide - State Machine Character Controller

## 🚀 Quick Start (No Server Needed)

**Option 1: Standalone Version (Recommended for testing)**
1. Open `state-machine-standalone.html` directly in your browser
2. No server setup required - everything is in one file!

## 🌐 Using the Modular Version (With Local Server)

**Option 2: Python Server (Recommended)**
```bash
# Navigate to the project directory
cd projects/state-machine-character-controller

# Start the server
python serve.py

# Open in browser
http://localhost:8000/state-machine-test.html
```

**Option 3: Node.js Server**
```bash
# Install a simple server globally
npm install -g http-server

# Navigate to the project directory
cd projects/state-machine-character-controller

# Start the server
http-server -p 8000

# Open in browser
http://localhost:8000/state-machine-test.html
```

**Option 4: PHP Server**
```bash
# Navigate to the project directory
cd projects/state-machine-character-controller

# Start the server
php -S localhost:8000

# Open in browser
http://localhost:8000/state-machine-test.html
```

## 🔧 Why Do We Need a Server?

The modular version uses ES6 modules (`import`/`export`), which require HTTP/HTTPS protocol to work properly. Opening HTML files directly in the browser uses the `file://` protocol, which has CORS restrictions.

## 📁 File Structure

```
state-machine-character-controller/
├── state-machine-standalone.html  # ← Use this for quick testing
├── state-machine-test.html        # ← Use this with a server
├── serve.py                      # ← Python server script
├── js/                           # ← Modular JavaScript files
│   ├── playerConfig.js
│   ├── playerStates.js
│   ├── fsm.js
│   ├── playerModel.js
│   └── playerController.js
├── README.md
└── SETUP.md                      # ← This file
```

## 🎮 Testing the System

1. **Open the game** using one of the methods above
2. **Use the controls**:
   - Arrow Keys: Move
   - Spacebar: Jump
   - Shift: Boost/Charge
   - Boost + Direction + Down: Ground Slide

3. **Watch the debug display** to see:
   - Current states for all state machines
   - Speed multiplier
   - Player position and velocity
   - Feature flag status

## 🛠️ Customization Examples

### Change Movement Speed
Edit `PlayerConfig.abilities.move.speed.base` in the standalone file or `js/playerConfig.js`

### Add a Speed Boost Modifier
Uncomment this code in the `_setupExampleModifiers()` function:
```javascript
this.model.mods.add({
    key: "move.speed",
    op: "mul",
    value: 1.5,
    enabled: true
});
```

### Disable an Ability
Uncomment this code in the `_setupExampleModifiers()` function:
```javascript
this.model.cfg.featureFlags.canSlide = false;
```

## 🐛 Troubleshooting

**CORS Error**: Make sure you're using a server, not opening the file directly.

**Port Already in Use**: Try a different port:
```bash
python serve.py  # Uses port 8000
# Or modify the PORT variable in serve.py
```

**Module Not Found**: Make sure you're in the correct directory and using the modular version with a server.

## 🎯 Next Steps

1. **Test the standalone version** to see the system in action
2. **Experiment with modifiers** by uncommenting the example code
3. **Read the README.md** for detailed architecture information
4. **Try the modular version** with a server for development
5. **Customize the configuration** to match your game's needs
