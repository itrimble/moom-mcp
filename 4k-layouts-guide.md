# 4K Multi-Monitor Moom Layouts

## 🖥️ Display Configuration
- **Main Display**: 4K Resolution (3840x2160 or 4096x2160)
- **Left Display**: Standard resolution
- **Right Display**: Standard resolution

## 📐 4K-Optimized Layouts

### 1. **4K Four Panel** ⌘⌥1
Perfect for monitoring multiple apps on your 4K display:
```
┌─────────────┬─────────────┐
│   VS Code   │    Edge     │
├─────────────┼─────────────┤
│    iTerm    │   Finder    │
└─────────────┴─────────────┘
```

### 2. **4K Dev Workspace** ⌘⌥2
Maximizes 4K real estate with overlapping terminal:
```
Main 4K Display:
┌─────────────────┬──────────┐
│                 │          │
│    VS Code      │   Edge   │
│     (60%)       │  (40%)   │
│                 ├──────────┤
│                 │  iTerm   │
└─────────────────┴──────────┘

Left Display: Perplexity (full)
Right Display: Available
```

### 3. **4K Productivity Grid** ⌘⌥3
Spreads across all displays:
- Main 4K: VS Code (left 2/3) | Perplexity (right 1/3)
- Right Display: iTerm (top) | Edge (bottom)
- Left Display: Available

### 4. **Three Monitor Dev** ⌘⌥4
Each app gets its own display:
- Left: iTerm (full screen)
- Main: VS Code (full screen)
- Right: Edge (full screen)

### 5. **No Overlap Dev** ⌘⌥5
Clean, non-overlapping layout:
- Main: VS Code (left) | iTerm (right)
- Right: Edge (full)
- Left: Perplexity (full)

## 🎯 Rectangle Shortcuts for 4K

### Basic Positions
- **Halves**: ⌃⌥ + Arrow Keys
- **Quarters**: ⌃⌘ + U/I/J/K
- **Maximize**: ⌃⌥ + Return
- **Center**: ⌃⌥ + C

### Advanced (Rectangle Pro)
- **Thirds**: ⌃⌥ + D/F/G
- **Sixths**: ⌃⌥⇧ + U/I/O/J/K/L
- **Custom sizes**: Define in Rectangle preferences

### Display Movement
- **Next Display**: ⌃⌥⌘ + →
- **Previous Display**: ⌃⌥⌘ + ←

## 🛠️ Creating Custom 4K Layouts

### For 6-App Grid (3x2):
```applescript
-- Position 6 apps in a grid on 4K display
-- Requires Rectangle Pro or custom shortcuts for sixths
```

### For Picture-in-Picture Style:
```applescript
-- Main app maximized, smaller apps in corners
-- Great for video editing or streaming
```

## 📊 Recommended Layouts by Task

### Coding
- **4K Dev Workspace**: Maximum code visibility
- **4K Four Panel**: Code, docs, terminal, browser

### Research
- **4K Productivity Grid**: Multiple browsers/references
- **AI-Assisted Coding**: AI tools on side displays

### Teaching/Presenting
- **Teaching (Mac Mini)**: Your existing setup
- **1 Screen Teaching 4k**: Optimized for screen sharing

## ⚙️ Optimization Tips

1. **4K Scaling**: Set display scaling to give more space vs larger text
2. **Font Sizes**: Adjust IDE/terminal fonts for 4K clarity
3. **Window Borders**: Moom can add spacing between windows
4. **Auto-Trigger**: Set layouts to activate based on display configuration

## 🚀 Next Steps

1. Test each layout and adjust Rectangle shortcuts as needed
2. Assign keyboard shortcuts in Moom preferences
3. Create app-specific layouts (Xcode + Simulator, etc.)
4. Set up auto-trigger for dock/undock scenarios