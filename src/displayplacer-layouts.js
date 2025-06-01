#!/usr/bin/env node

/**
 * Advanced Display-Aware Layout Creator for MOOM MCP
 * Uses displayplacer for precise multi-monitor window positioning
 */

const { execSync } = require('child_process');

class DisplayPlacerIntegration {
  constructor() {
    this.displays = this.getDisplayInfo();
  }

  /**
   * Get current display configuration using displayplacer
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
   * Parse displayplacer output into usable display objects
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
   * Create optimal coding layout for current display setup
   */
  createCodingLayout() {
    const mainDisplay = this.displays.find(d => d.isMain) || this.displays[0];
    const leftDisplay = this.displays.find(d => d.x < 0);
    const rightDisplay = this.displays.find(d => d.x > 0 && !d.isMain);

    const layout = {
      name: "DisplayPlacer Coding Pro",
      windows: []
    };

    // VSCode: Left 60% of main display
    layout.windows.push({
      app: "Visual Studio Code",
      display: mainDisplay,
      x: mainDisplay.x,
      y: mainDisplay.y + 25, // Account for menu bar
      width: Math.floor(mainDisplay.width * 0.6),
      height: mainDisplay.height - 50
    });

    // Safari: Top right 40% of main display
    layout.windows.push({
      app: "Safari",
      display: mainDisplay,
      x: mainDisplay.x + Math.floor(mainDisplay.width * 0.6),
      y: mainDisplay.y + 25,
      width: Math.floor(mainDisplay.width * 0.4),
      height: Math.floor((mainDisplay.height - 50) * 0.5)
    });

    // iTerm: Bottom right 40% of main display
    layout.windows.push({
      app: "iTerm",
      display: mainDisplay,
      x: mainDisplay.x + Math.floor(mainDisplay.width * 0.6),
      y: mainDisplay.y + 25 + Math.floor((mainDisplay.height - 50) * 0.5),
      width: Math.floor(mainDisplay.width * 0.4),
      height: Math.floor((mainDisplay.height - 50) * 0.5)
    });

    // Claude: Right display if available, otherwise small overlay
    if (rightDisplay) {
      layout.windows.push({
        app: "Claude",
        display: rightDisplay,
        x: rightDisplay.x + 50,
        y: rightDisplay.y + 50,
        width: Math.min(800, rightDisplay.width - 100),
        height: Math.min(1000, rightDisplay.height - 100)
      });
    } else {
      layout.windows.push({
        app: "Claude",
        display: mainDisplay,
        x: mainDisplay.x + 100,
        y: mainDisplay.y + 100,
        width: 400,
        height: 600
      });
    }

    return layout;
  }

  /**
   * Create full multi-monitor layout utilizing all displays
   */
  createMultiMonitorLayout() {
    const mainDisplay = this.displays.find(d => d.isMain) || this.displays[0];
    const leftDisplay = this.displays.find(d => d.x < 0);
    const rightDisplay = this.displays.find(d => d.x > 0 && !d.isMain);

    const layout = {
      name: "Ultimate Multi-Monitor Pro",
      windows: []
    };

    // VSCode: Full main display
    layout.windows.push({
      app: "Visual Studio Code",
      display: mainDisplay,
      x: mainDisplay.x,
      y: mainDisplay.y + 25,
      width: mainDisplay.width,
      height: mainDisplay.height - 50
    });

    if (leftDisplay) {
      // Safari: Top half of left display
      layout.windows.push({
        app: "Safari",
        display: leftDisplay,
        x: leftDisplay.x,
        y: leftDisplay.y + 25,
        width: leftDisplay.width,
        height: Math.floor((leftDisplay.height - 50) * 0.6)
      });

      // iTerm: Bottom half of left display
      layout.windows.push({
        app: "iTerm",
        display: leftDisplay,
        x: leftDisplay.x,
        y: leftDisplay.y + 25 + Math.floor((leftDisplay.height - 50) * 0.6),
        width: leftDisplay.width,
        height: Math.floor((leftDisplay.height - 50) * 0.4)
      });
    }

    if (rightDisplay) {
      // Claude: Right display
      layout.windows.push({
        app: "Claude",
        display: rightDisplay,
        x: rightDisplay.x + 50,
        y: rightDisplay.y + 50,
        width: rightDisplay.width - 100,
        height: rightDisplay.height - 100
      });
    }

    return layout;
  }

  /**
   * Generate AppleScript to position windows according to layout
   */
  generateAppleScript(layout) {
    let script = `-- ${layout.name} - Generated with DisplayPlacer Integration\n\n`;
    script += `set errorList to {}\n\n`;

    for (const window of layout.windows) {
      script += `-- Position ${window.app}\n`;
      script += `if application "${window.app}" is running then\n`;
      script += `    tell application "${window.app}"\n`;
      script += `        activate\n`;
      script += `        delay 0.2 -- Shorter delay, activate should be quick\n`;
      script += `    end tell\n\n`;
      
      script += `    tell application "System Events"\n`;
      script += `        tell process "${this.getProcessName(window.app)}"\n`;
      script += `            set frontmost to true\n`;
      script += `            try\n`;
      script += `                set position of front window to {${window.x}, ${window.y}}\n`;
      script += `                set size of front window to {${window.width}, ${window.height}}\n`;
      script += `            on error errMsg number errNum\n`;
      script += `                set end of errorList to "Error positioning/sizing ${window.app}: " & errMsg & " (Number: " & errNum & ")"\n`;
      script += `            end try\n`;
      script += `        end tell\n`;
      script += `    end tell\n`;
      script += `else\n`;
      script += `    set end of errorList to "Error: Application ${window.app} is not running. Cannot position."\n`;
      script += `end if\n\n`;
      script += `delay 0.2\n\n`; // Shorter delay after each app block
    }

    script += `-- Finalizing script\n`;
    // Attempt to return focus to a common app like VSCode if it was part of the layout
    // This helps ensure a predictable active application after script execution.
    const vsCodeInLayout = layout.windows.some(w => w.app === "Visual Studio Code");
    if (vsCodeInLayout) {
        script += `if application "Visual Studio Code" is running then\n`;
        script += `    tell application "Visual Studio Code" to activate\n`;
        script += `end if\n`;
    }

    script += `if errorList is {} then\n`;
    script += `    return "Layout '${layout.name}' applied successfully."\n`;
    script += `else\n`;
    script += `    return "Layout '${layout.name}' applied with errors: " & (errorList as text)\n`;
    script += `end if\n`;

    return script;
  }

  /**
   * Get process name for different applications
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
   * Display current configuration summary
   */
  displaySummary() {
    console.log('🖥️  Display Configuration Summary:');
    console.log('================================');
    
    this.displays.forEach((display, index) => {
      console.log(`Display ${index + 1}: ${display.type}`);
      console.log(`  Resolution: ${display.width}x${display.height}`);
      console.log(`  Origin: (${display.x}, ${display.y})`);
      console.log(`  Main: ${display.isMain ? 'Yes' : 'No'}`);
      console.log('');
    });
  }
}

// Export for use in main MCP server
module.exports = DisplayPlacerIntegration;

// CLI usage
if (require.main === module) {
  const integration = new DisplayPlacerIntegration();
  integration.displaySummary();
  
  const codingLayout = integration.createCodingLayout();
  const multiLayout = integration.createMultiMonitorLayout();
  
  console.log('Generated Coding Layout AppleScript:');
  console.log('===================================');
  console.log(integration.generateAppleScript(codingLayout));
}
