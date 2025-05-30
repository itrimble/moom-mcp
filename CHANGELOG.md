# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-05-30

### Added
- **DisplayPlacer Integration** for precise multi-monitor window positioning
- `displayplacer-layouts.js` module for exact display coordinate calculation
- **"DisplayPlacer Coding Pro"** layout with pixel-perfect positioning
- **"Ultimate Multi-Monitor Pro"** layout for full display utilization
- Support for complex multi-monitor setups with proper origin calculation
- 4K display optimization with scaling consideration
- Integration with `execSync` for displayplacer command execution

### Enhanced
- Window positioning now uses exact coordinates from `displayplacer list`
- Multi-monitor awareness with proper display origin handling
- Fallback to Moom shortcuts if precise positioning fails
- Support for high refresh rate displays (120Hz)

### Technical Details
- Added display configuration parsing from displayplacer output
- Precise coordinate calculation for VSCode, Safari, iTerm, and Claude
- Handles negative coordinates for left-positioned displays
- Accounts for menu bar offset and display scaling

## [1.0.1] - 2025-05-29

### Fixed
- **Critical JavaScript syntax error in `MoomMCPServer` class**
  - Moved `createQuadLayout` method inside the `MoomMCPServer` class where it belongs
  - Fixed improper method declaration that was causing server crashes on startup
  - Added missing class closing brace and server startup code
  - Resolves `SyntaxError: Unexpected identifier 'createQuadLayout'`

### Technical Details
- The `createQuadLayout` method was incorrectly declared outside the class scope after the server instantiation
- This caused the MCP server to crash immediately on startup with a syntax error
- All functionality now properly contained within the class structure

## [1.0.0] - 2025-05-28

### Added
- Initial release of Moom MCP Server
- Core window management functionality:
  - `activate_layout` - Switch between saved Moom layouts
  - `save_current_layout` - Save current window arrangements
  - `trigger_moom_action` - Execute window actions (grow, shrink, move, center, etc.)
  - `show_moom_menu` - Display Moom popup menu
- AppleScript integration for macOS automation
- Comprehensive documentation and examples
- Test suite and validation tools
- Installation scripts and guides
