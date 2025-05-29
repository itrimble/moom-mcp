# Moom MCP Server

A Model Context Protocol (MCP) server that enables programmatic control of [Moom](https://manytricks.com/moom/) window layouts on macOS through natural language commands in Claude Desktop.

## Overview

This MCP server allows Claude to interact with Moom, a powerful macOS window management tool, enabling you to:
- Switch between saved window layouts
- Create new window arrangements
- Control window positioning and sizing
- Manage your workspace layouts through conversational commands

## Features

- 🖼️ **activate_layout** - Instantly switch to any saved Moom layout
- 💾 **save_current_layout** - Save your current window arrangement as a reusable layout
- 🎯 **trigger_moom_action** - Execute Moom window actions (resize, move, center, etc.)
- 📋 **show_moom_menu** - Display the Moom popup menu

## Prerequisites

- macOS (10.12 or later)
- [Moom](https://manytricks.com/moom/) installed and running
- Node.js 14 or higher
- [Claude Desktop](https://claude.ai/download) app
- Terminal app with accessibility permissions

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

## Project Structure

```
moom-mcp/
├── src/
│   └── index.js        # Main MCP server implementation
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