# Moom + Rectangle Layout Guide

## Created Layouts

### 1. Dev Split Screen
- **Main Display**: VS Code (left) | Edge (right)
- **Shortcut**: Assign in Moom preferences

### 2. Full Stack Development (to create)
- **Left Display**: iTerm2 (full screen)
- **Main Display**: VS Code (full screen)
- **Right Display**: Edge (full screen)

### 3. Research Mode (to create)
- **Left Display**: Perplexity (full screen)
- **Main Display**: VS Code (left) | Edge (right)
- **Right Display**: Claude or ChatGPT (full screen)

### 4. Xcode Development (to create)
- **Main Display**: Xcode (full screen)
- **Right Display**: Simulator (top) | iTerm2 (bottom)
- **Left Display**: Documentation browser

## How to Assign Keyboard Shortcuts

1. Open Moom preferences (click Moom icon → Settings)
2. Go to the Custom tab
3. Find your layout (e.g., "Dev Split Screen")
4. Click in the keyboard shortcut field
5. Press your desired key combination (e.g., ⌘⌥1)

## Rectangle Shortcuts Reference
- Left Half: ⌃⌥←
- Right Half: ⌃⌥→
- Top Half: ⌃⌥↑
- Bottom Half: ⌃⌥↓
- Maximize: ⌃⌥Return
- Next Display: ⌃⌥⌘→
- Previous Display: ⌃⌥⌘←

## Creating New Layouts

Use this template:
```applescript
-- Activate and position first app
tell application "APP_NAME" to activate
delay 0.5
tell application "System Events"
    key code KEYCODE using {MODIFIERS}
end tell
delay 0.5

-- Repeat for other apps...

-- Save as Moom layout
tell application "Moom"
    save layout and replace "LAYOUT_NAME"
end tell
```