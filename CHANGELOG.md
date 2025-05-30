# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-05-30

### 🎯 MAJOR RELEASE: Professional Workflow Management with Zero Overlap Guarantee

### Added
- **Complete Professional Workflow System** with AI-driven layout management
- **Non-Overlapping Layout Engine** implementing macOS window management best practices
- **Zero Overlap Guarantee** using grid-based zones and edge detection
- **Professional Workflows**: Coding, Teaching, Research, and Writing presets
- **Smart Application Launching** with conflict prevention and sequential delays
- **Monitor Validation System** ensuring layouts meet hardware requirements
- **Edge Detection & Snapping** algorithms for perfect window alignment
- **Layout Validation** with overlap detection and correction

### Professional Workflows
- **Coding Workflow**: VSCode + Safari + iTerm + Claude with zero overlap
- **Teaching Workflow**: Optimized for screen sharing and presentations  
- **Research Workflow**: Multi-monitor AI research and analysis setup
- **Writing Workflow**: Focused documentation and writing environment

### Technical Features
- Grid-based zone calculation for precise positioning
- Snap tolerance and minimum window size enforcement
- Dynamic monitor configuration adaptation
- Sequential application launching with conflict prevention
- Comprehensive error handling and validation
- AppleScript integration for reliable macOS control

### Enhanced
- **DisplayPlacer Integration** now includes professional workflow support
- **Multi-Monitor Awareness** with adaptive layout system
- **MCP Tool Implementation** following comprehensive guide standards
- **Natural Language Control** for professional workflow activation

### Breaking Changes
- Workflow activation now requires monitor validation
- Application launching uses sequential approach (may be slower but more reliable)
- Layout names updated to reflect professional standards

### Success Criteria Achieved
✅ **No Overlapping Windows** - Grid-based zones prevent all overlaps  
✅ **Smart Snap & Align** - Edge detection ensures perfect alignment  
✅ **Preset Layouts** - Professional workflows with Moom integration  
✅ **Monitor Adaptation** - Dynamic layout adjustment for different setups  
✅ **Application Launching** - Reliable sequential launch with conflict prevention  
✅ **Professional UX** - Natural language control with keyboard shortcuts

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
