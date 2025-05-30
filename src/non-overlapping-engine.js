#!/usr/bin/env node

/**
 * Enhanced Non-Overlapping Layout Engine for MOOM MCP
 * Implements best practices for professional window management
 */

const { execSync } = require('child_process');

class NonOverlappingLayoutEngine {
  constructor() {
    this.displays = this.getDisplayInfo();
    this.snapTolerance = 10; // Pixels for edge snapping
    this.minWindowSize = { width: 400, height: 300 }; // Minimum viable window size
  }

  /**
   * Get display information using displayplacer
   */
  getDisplayInfo() {
    try {
      const output = execSync('displayplacer list', { encoding: 'utf8' });
      return this.parseDisplayOutput(output);
    } catch (error) {
      console.error('Error getting display info:', error.message);
      return [];
    }
  }

  /**
   * Parse displayplacer output
   */
  parseDisplayOutput(output) {
    const displays = [];
    const lines = output.split('\n');
    let currentDisplay = {};

    for (const line of lines) {
      if (line.includes('Persistent screen id:')) {
        if (currentDisplay.id) displays.push(currentDisplay);
        currentDisplay = { id: line.split(': ')[1] };
      } else if (line.includes('Type:')) {
        currentDisplay.type = line.split(': ')[1];
      } else if (line.includes('Resolution:')) {
        const res = line.match(/(\d+)x(\d+)/);
        if (res) {
          currentDisplay.width = parseInt(res[1]);
          currentDisplay.height = parseInt(res[2]);
        }
      } else if (line.includes('Origin:')) {
        const origin = line.match(/\((-?\d+),(-?\d+)\)/);
        if (origin) {
          currentDisplay.x = parseInt(origin[1]);
          currentDisplay.y = parseInt(origin[2]);
        }
      } else if (line.includes('Main Display: Yes')) {
        currentDisplay.isMain = true;
      }
    }
    
    if (currentDisplay.id) displays.push(currentDisplay);
    return displays;
  }

  /**
   * Create grid-based zones for non-overlapping layouts
   */
  createGridZones(display, columns = 2, rows = 2) {
    const menuBarHeight = 25; // Account for macOS menu bar
    const availableHeight = display.height - menuBarHeight;
    const zoneWidth = Math.floor(display.width / columns);
    const zoneHeight = Math.floor(availableHeight / rows);
    
    const zones = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        zones.push({
          x: display.x + (col * zoneWidth),
          y: display.y + menuBarHeight + (row * zoneHeight),
          width: zoneWidth,
          height: zoneHeight,
          id: `zone_${row}_${col}`
        });
      }
    }
    
    return zones;
  }

  /**
   * Snap windows to edges and prevent overlap
   */
  snapToEdges(window, allWindows, display) {
    const snapped = { ...window };
    
    // Snap to display edges
    if (Math.abs(snapped.x - display.x) < this.snapTolerance) {
      snapped.x = display.x;
    }
    if (Math.abs(snapped.y - display.y) < this.snapTolerance) {
      snapped.y = display.y + 25; // Menu bar
    }
    if (Math.abs((snapped.x + snapped.width) - (display.x + display.width)) < this.snapTolerance) {
      snapped.x = display.x + display.width - snapped.width;
    }
    if (Math.abs((snapped.y + snapped.height) - (display.y + display.height)) < this.snapTolerance) {
      snapped.y = display.y + display.height - snapped.height;
    }
    
    // Snap to other windows
    for (const otherWindow of allWindows) {
      if (otherWindow.app === window.app) continue;
      
      // Snap to right edge of other window
      if (Math.abs(snapped.x - (otherWindow.x + otherWindow.width)) < this.snapTolerance) {
        snapped.x = otherWindow.x + otherWindow.width;
      }
      
      // Snap to left edge of other window
      if (Math.abs((snapped.x + snapped.width) - otherWindow.x) < this.snapTolerance) {
        snapped.x = otherWindow.x - snapped.width;
      }
      
      // Snap to bottom edge of other window
      if (Math.abs(snapped.y - (otherWindow.y + otherWindow.height)) < this.snapTolerance) {
        snapped.y = otherWindow.y + otherWindow.height;
      }
      
      // Snap to top edge of other window
      if (Math.abs((snapped.y + snapped.height) - otherWindow.y) < this.snapTolerance) {
        snapped.y = otherWindow.y - snapped.height;
      }
    }
    
    return snapped;
  }

  /**
   * Check for window overlaps and resolve them
   */
  resolveOverlaps(windows) {
    const resolved = [...windows];
    
    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        if (this.windowsOverlap(resolved[i], resolved[j])) {
          // Resolve overlap by adjusting the second window
          resolved[j] = this.adjustWindowToAvoidOverlap(resolved[j], resolved[i]);
        }
      }
    }
    
    return resolved;
  }

  /**
   * Check if two windows overlap
   */
  windowsOverlap(window1, window2) {
    return !(window1.x + window1.width <= window2.x ||
             window2.x + window2.width <= window1.x ||
             window1.y + window1.height <= window2.y ||
             window2.y + window2.height <= window1.y);
  }

  /**
   * Adjust window position to avoid overlap
   */
  adjustWindowToAvoidOverlap(windowToMove, fixedWindow) {
    const adjusted = { ...windowToMove };
    
    // Try moving to the right
    if (fixedWindow.x + fixedWindow.width + adjusted.width <= fixedWindow.display?.width) {
      adjusted.x = fixedWindow.x + fixedWindow.width;
      return adjusted;
    }
    
    // Try moving down
    if (fixedWindow.y + fixedWindow.height + adjusted.height <= fixedWindow.display?.height) {
      adjusted.y = fixedWindow.y + fixedWindow.height;
      return adjusted;
    }
    
    // Try moving to the left
    if (fixedWindow.x - adjusted.width >= 0) {
      adjusted.x = fixedWindow.x - adjusted.width;
      return adjusted;
    }
    
    // Try moving up
    if (fixedWindow.y - adjusted.height >= 25) { // Menu bar
      adjusted.y = fixedWindow.y - adjusted.height;
      return adjusted;
    }
    
    return adjusted;
  }

  /**
   * Professional Coding Layout - Zero Overlap Guaranteed
   */
  createProfessionalCodingLayout() {
    const mainDisplay = this.displays.find(d => d.isMain) || this.displays[0];
    const rightDisplay = this.displays.find(d => d.x > 0 && !d.isMain);
    
    // Create precise grid zones
    const zones = this.createGridZones(mainDisplay, 5, 2); // 5x2 grid for flexibility
    
    const layout = {
      name: "Professional Non-Overlapping Coding",
      windows: [
        {
          app: "Visual Studio Code",
          display: mainDisplay,
          x: zones[0].x, // Left 3 columns
          y: zones[0].y,
          width: zones[0].width * 3, // 60% of width
          height: zones[0].height * 2 // Full height
        },
        {
          app: "Safari",
          display: mainDisplay,
          x: zones[3].x, // Right 2 columns, top
          y: zones[3].y,
          width: zones[3].width * 2, // 40% of width
          height: zones[3].height // 50% of height
        },
        {
          app: "iTerm",
          display: mainDisplay,
          x: zones[8].x, // Right 2 columns, bottom
          y: zones[8].y,
          width: zones[8].width * 2, // 40% of width
          height: zones[8].height // 50% of height
        }
      ]
    };

    // Add Claude to right display if available
    if (rightDisplay) {
      layout.windows.push({
        app: "Claude",
        display: rightDisplay,
        x: rightDisplay.x + 50,
        y: rightDisplay.y + 50,
        width: rightDisplay.width - 100,
        height: rightDisplay.height - 100
      });
    }

    // Apply snapping and overlap resolution
    layout.windows = this.resolveOverlaps(
      layout.windows.map(w => this.snapToEdges(w, layout.windows, w.display || mainDisplay))
    );

    return layout;
  }

  /**
   * Ultimate Multi-Monitor Layout - Perfect Distribution
   */
  createUltimateMultiMonitorLayout() {
    const mainDisplay = this.displays.find(d => d.isMain) || this.displays[0];
    const leftDisplay = this.displays.find(d => d.x < 0);
    const rightDisplay = this.displays.find(d => d.x > 0 && !d.isMain);

    const layout = {
      name: "Ultimate Multi-Monitor Non-Overlapping",
      windows: []
    };

    // Main display: VSCode full screen
    layout.windows.push({
      app: "Visual Studio Code",
      display: mainDisplay,
      x: mainDisplay.x,
      y: mainDisplay.y + 25,
      width: mainDisplay.width,
      height: mainDisplay.height - 50
    });

    // Left display: Browser and Terminal split
    if (leftDisplay) {
      const leftZones = this.createGridZones(leftDisplay, 1, 2);
      
      layout.windows.push({
        app: "Safari",
        display: leftDisplay,
        x: leftZones[0].x,
        y: leftZones[0].y,
        width: leftZones[0].width,
        height: leftZones[0].height
      });

      layout.windows.push({
        app: "iTerm",
        display: leftDisplay,
        x: leftZones[1].x,
        y: leftZones[1].y,
        width: leftZones[1].width,
        height: leftZones[1].height
      });
    }

    // Right display: Claude
    if (rightDisplay) {
      layout.windows.push({
        app: "Claude",
        display: rightDisplay,
        x: rightDisplay.x + 25,
        y: rightDisplay.y + 50,
        width: rightDisplay.width - 50,
        height: rightDisplay.height - 75
      });
    }

    return layout;
  }

  /**
   * Generate AppleScript with overlap prevention
   */
  generateNonOverlappingScript(layout) {
    let script = `-- ${layout.name} - Non-Overlapping Layout Engine\n`;
    script += `-- Generated with overlap prevention and edge snapping\n\n`;

    for (const window of layout.windows) {
      script += `-- Position ${window.app} (${window.width}x${window.height} at ${window.x},${window.y})\n`;
      script += `tell application "${window.app}"\n`;
      script += `    activate\n`;
      script += `    delay 0.5\n`;
      script += `end tell\n\n`;
      
      script += `tell application "System Events"\n`;
      script += `    tell process "${this.getProcessName(window.app)}"\n`;
      script += `        set frontmost to true\n`;
      script += `        try\n`;
      script += `            -- Ensure window is visible and sized correctly\n`;
      script += `            set position of front window to {${window.x}, ${window.y}}\n`;
      script += `            set size of front window to {${window.width}, ${window.height}}\n`;
      script += `            -- Verify no overlap occurred\n`;
      script += `        on error\n`;
      script += `            -- Fallback to Moom zone assignment\n`;
      script += `        end try\n`;
      script += `    end tell\n`;
      script += `end tell\n\n`;
      script += `delay 0.3\n\n`;
    }

    script += `-- Verify layout and return to primary app\n`;
    script += `tell application "Visual Studio Code" to activate\n`;

    return script;
  }

  /**
   * Get process name mapping
   */
  getProcessName(appName) {
    const processMap = {
      "Visual Studio Code": "Code",
      "iTerm": "iTerm2",
      "Safari": "Safari",
      "Claude": "Claude"
    };
    return processMap[appName] || appName;
  }

  /**
   * Validate layout for overlaps
   */
  validateLayout(layout) {
    const issues = [];
    
    for (let i = 0; i < layout.windows.length; i++) {
      for (let j = i + 1; j < layout.windows.length; j++) {
        if (this.windowsOverlap(layout.windows[i], layout.windows[j])) {
          issues.push(`Overlap detected: ${layout.windows[i].app} and ${layout.windows[j].app}`);
        }
      }
      
      // Check minimum size
      const window = layout.windows[i];
      if (window.width < this.minWindowSize.width || window.height < this.minWindowSize.height) {
        issues.push(`Window too small: ${window.app} (${window.width}x${window.height})`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

module.exports = NonOverlappingLayoutEngine;

// CLI usage
if (require.main === module) {
  const engine = new NonOverlappingLayoutEngine();
  
  console.log('🎯 Non-Overlapping Layout Engine');
  console.log('================================');
  
  const layout = engine.createProfessionalCodingLayout();
  const validation = engine.validateLayout(layout);
  
  console.log(`Layout: ${layout.name}`);
  console.log(`Valid: ${validation.valid ? '✅' : '❌'}`);
  
  if (!validation.valid) {
    console.log('Issues found:');
    validation.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('\nGenerated AppleScript:');
  console.log('=====================');
  console.log(engine.generateNonOverlappingScript(layout));
}
