# Moom MCP Server

A Model Context Protocol (MCP) server that enables programmatic control of [Moom](https://manytricks.com/moom/) window layouts on macOS through natural language commands in Claude Desktop.

## Overview

This MCP server allows Claude to interact with Moom, a powerful macOS window management tool, enabling you to:
- Switch between saved window layouts
- Create new window arrangements with pixel-perfect precision
- Control window positioning and sizing across multiple monitors
- Manage your workspace layouts through conversational commands
- **NEW**: DisplayPlacer integration for exact multi-monitor positioning

## Features

- 🖼️ **activate_layout** - Instantly switch to any saved Moom layout
- 💾 **save_current_layout** - Save your current window arrangement as a reusable layout
- 🎯 **trigger_moom_action** - Execute Moom window actions (resize, move, center, etc.)
- 📋 **show_moom_menu** - Display the Moom popup menu
- 🖥️ **DisplayPlacer Integration** - Pixel-perfect multi-monitor window positioning
- 📐 **Precision Layouts** - Exact coordinate-based window management

## Prerequisites

- macOS (10.12 or later)
- [Moom](https://manytricks.com/moom/) installed and running
- Node.js 14 or higher
- [Claude Desktop](https://claude.ai/download) app
- Terminal app with accessibility permissions
- **Optional**: [DisplayPlacer](https://github.com/jakehilborn/displayplacer) for enhanced multi-monitor support

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/itrimble/moom-mcp.git
   cd moom-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Grant accessibility permissions:
   - Open **System Preferences** → **Security & Privacy** → **Privacy** → **Accessibility**
   - Add and enable Terminal (or your terminal app)
   - Add and enable Claude Desktop

4. Add to Claude Desktop configuration:
   - Open Claude Desktop
   - Navigate to Settings → Developer → Edit Config
   - Add the following to your `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "moom": {
         "command": "node",
         "args": ["/absolute/path/to/moom-mcp/src/index.js"]
       }
     }
   }
   ```

5. Restart Claude Desktop

## Usage

Once installed, you can use natural language commands in Claude Desktop:
### Activating Layouts
- "Switch to my Teaching (Mac Mini) layout"
- "Activate the AI Research Mode workspace"
- "Use my coding layout"
- **NEW**: "Switch to DisplayPlacer Coding Pro" (pixel-perfect positioning)

### Saving Layouts
- "Save the current window arrangement as 'Focus Mode'"
- "Create a new layout called 'Video Editing'"

### Window Actions
- "Make this window bigger" (grow)
- "Center the active window"
- "Move window to the left"
- "Fill the screen with current window"

### Menu Access
- "Show the Moom menu"
- "Open Moom's layout picker"

### Multi-Monitor Precision (NEW)
- "Create a DisplayPlacer coding layout" (uses exact coordinates)
- "Position windows with pixel precision"
- "Optimize for my 4K display setup"

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `activate_layout` | Switch to a saved Moom layout | `{ "layoutName": "Teaching (Mac Mini)" }` |
| `save_current_layout` | Save current window arrangement | `{ "layoutName": "Development Setup" }` |
| `trigger_moom_action` | Execute window actions | `{ "action": "center" }` |
| `show_moom_menu` | Display Moom popup menu | `{}` |

### Supported Window Actions

- `grow` - Increase window size
- `shrink` - Decrease window size
- `move-left` - Move window left
- `move-right` - Move window right
- `move-up` - Move window up
- `move-down` - Move window down
- `center` - Center window on screen
- `fill-screen` - Maximize window

## DisplayPlacer Integration

The server now includes advanced multi-monitor support using [DisplayPlacer](https://github.com/jakehilborn/displayplacer):

### Benefits
- **Pixel-perfect positioning** using exact display coordinates
- **Multi-monitor awareness** with proper origin calculation
- **4K display optimization** with scaling consideration
- **High refresh rate support** (120Hz+)
- **Negative coordinate handling** for left-positioned displays

### Enhanced Layouts
- **DisplayPlacer Coding Pro**: Precision layout for development
- **Ultimate Multi-Monitor Pro**: Full display utilization across all monitors

### Installation (Optional)
```bash
brew install jakehilborn/jakehilborn/displayplacer
```

## Project Structure

```
moom-mcp/
├── src/
│   ├── index.js                    # Main MCP server implementation
│   └── displayplacer-layouts.js    # DisplayPlacer integration module
├── examples.md         # Usage examples and workflows
├── test.js            # Basic functionality tests
├── test-ui.js         # UI automation tests
├── validate.js        # Configuration validator
├── demo.js            # Feature demonstration
├── package.json       # Node.js configuration
├── LICENSE            # MIT License
└── README.md          # This file
```

## Development

### Testing

Run the test suite:
```bash
npm test          # Basic tests
npm run test-ui   # UI automation tests
npm run validate  # Validate configuration
```

### Debugging

1. Check if Moom is running:
   ```bash
   pgrep -x Moom
   ```

2. Verify accessibility permissions are granted
3. Run the validation script:
   ```bash
   npm run validate
   ```

## Troubleshooting

### "Error accessing Moom menu"
- Ensure Moom is running
- Verify accessibility permissions for Terminal and Claude Desktop
- Check that Moom's menu bar icon is visible

### Layouts not activating
- Layout names are case-sensitive
- Verify the exact layout name in Moom preferences
- Special characters in layout names may need escaping

### MCP not loading in Claude
- Restart Claude Desktop after configuration changes
- Check the config file path is absolute
- Verify Node.js is in your PATH

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Ian Trimble** - [GitHub](https://github.com/itrimble)

## Acknowledgments

- [Many Tricks](https://manytricks.com/) for creating Moom
- [Anthropic](https://anthropic.com/) for the Model Context Protocol
- The MCP community for inspiration and examples

## Related Projects

- [Model Context Protocol](https://github.com/anthropics/model-context-protocol)
- [Moom by Many Tricks](https://manytricks.com/moom/)