const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class MoomMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'moom-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'activate_layout',
          description: 'Activate a specific Moom layout by name',
          inputSchema: {
            type: 'object',
            properties: {
              layoutName: {
                type: 'string',
                description: 'Name of the layout to activate (e.g., "Teaching (Mac Mini)", "AI Research Mode")',
              },
            },
            required: ['layoutName'],
          },
        },
        {
          name: 'save_current_layout',
          description: 'Save the current window arrangement as a new Moom layout',
          inputSchema: {
            type: 'object',
            properties: {
              layoutName: {
                type: 'string',
                description: 'Name for the new layout',
              },
            },
            required: ['layoutName'],
          },        },
        {
          name: 'trigger_moom_action',
          description: 'Trigger common Moom actions via keyboard shortcuts',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['grow', 'shrink', 'move-left', 'move-right', 'move-up', 'move-down', 'center', 'fill-screen'],
                description: 'Moom action to trigger',
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'show_moom_menu',
          description: 'Show the Moom popup menu',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'create_quad_layout',
          description: 'Create a quad (2x2) window layout on a specific display',
          inputSchema: {
            type: 'object',
            properties: {
              layoutName: {
                type: 'string',
                description: 'Name for the quad layout',
              },
              display: {
                type: 'string',
                enum: ['main', 'left', 'right'],
                description: 'Which display to use',
              },
              apps: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of 4 app names for TL, TR, BL, BR positions',
              },
            },
            required: ['layoutName', 'apps'],
          },
        },
        {
          name: 'create_custom_grid_layout',
          description: 'Create a custom grid layout (e.g., 3x2, 4x3) for high-res displays',
          inputSchema: {
            type: 'object',
            properties: {
              layoutName: {
                type: 'string',
                description: 'Name for the grid layout',
              },
              columns: {
                type: 'integer',
                description: 'Number of columns in the grid',
              },
              rows: {
                type: 'integer',
                description: 'Number of rows in the grid',
              },
            },
            required: ['layoutName', 'columns', 'rows'],
          },
        },
        {
          name: 'list_layouts',
          description: 'List all saved Moom layouts',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'launch_application',
          description: 'Launch a specified application for workflow setup',
          inputSchema: {
            type: 'object',
            properties: {
              appName: {
                type: 'string',
                description: 'Name of the application to launch',
              },
            },
            required: ['appName'],
          },
        },
        {
          name: 'get_monitors',
          description: 'Get monitor configuration data for layout adaptation',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'set_window_position',
          description: 'Move a window to a specific position for precise control',
          inputSchema: {
            type: 'object',
            properties: {
              appName: {
                type: 'string',
                description: 'Name of the application',
              },
              x: {
                type: 'number',
                description: 'X coordinate',
              },
              y: {
                type: 'number',
                description: 'Y coordinate',
              },
            },
            required: ['appName', 'x', 'y'],
          },
        },
        {
          name: 'set_window_size',
          description: 'Resize a window to specific dimensions',
          inputSchema: {
            type: 'object',
            properties: {
              appName: {
                type: 'string',
                description: 'Name of the application',
              },
              width: {
                type: 'number',
                description: 'Window width',
              },
              height: {
                type: 'number',
                description: 'Window height',
              },
            },
            required: ['appName', 'width', 'height'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'activate_layout':
          return await this.activateLayout(args.layoutName);
        case 'save_current_layout':
          return await this.saveCurrentLayout(args.layoutName);
        case 'trigger_moom_action':
          return await this.triggerMoomAction(args.action);
        case 'show_moom_menu':
          return await this.showMoomMenu();
        case 'list_layouts':
          return await this.listLayouts();
        case 'create_quad_layout':
          return await this.createQuadLayout(args.layoutName, args.display, args.apps);
        case 'create_custom_grid_layout':
          return await this.createCustomGridLayout(args.layoutName, args.columns, args.rows);
        case 'list_layouts':
          return await this.listLayouts();
        case 'launch_application':
          return await this.launchApplication(args.appName);
        case 'get_monitors':
          return await this.getMonitors();
        case 'set_window_position':
          return await this.setWindowPosition(args.appName, args.x, args.y);
        case 'set_window_size':
          return await this.setWindowSize(args.appName, args.width, args.height);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }
  async runAppleScript(script) {
    try {
      const { stdout, stderr } = await execAsync(`osascript -e '${script}'`);
      if (stderr) {
        throw new Error(stderr);
      }
      return stdout.trim();
    } catch (error) {
      throw new Error(`AppleScript error: ${error.message}`);
    }
  }

  async listLayouts() {
    const script = `
      tell application "Moom"
        list of layouts
      end tell
    `;
    
    try {
      const result = await this.runAppleScript(script);
      const layouts = result.split(', ').map(name => name.trim());
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              layouts: layouts,
              count: layouts.length
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing layouts: ${error.message}`,
          },
        ],
      };
    }
  }

  async activateLayout(layoutName) {
    // Use AppleScript to apply layout
    const script = `
      tell application "Moom"
        apply layout "${layoutName}"
      end tell
    `;    
    try {
      await this.runAppleScript(script);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully activated layout: ${layoutName}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }

  async saveCurrentLayout(layoutName) {
    // Use AppleScript to save layout
    const script = `
      tell application "Moom"
        save layout and replace "${layoutName}"
      end tell
    `;
    
    try {
      await this.runAppleScript(script);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully saved layout: ${layoutName}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error saving layout: ${error.message}`,
          },
        ],
      };
    }
  }
  async triggerMoomAction(action) {
    // Map actions to Moom keyboard shortcuts
    const shortcuts = {
      'grow': { key: '=', modifiers: 'control down, option down' },
      'shrink': { key: '-', modifiers: 'control down, option down' },
      'move-left': { key: '123', modifiers: 'control down, option down' }, // left arrow
      'move-right': { key: '124', modifiers: 'control down, option down' }, // right arrow
      'move-up': { key: '126', modifiers: 'control down, option down' }, // up arrow
      'move-down': { key: '125', modifiers: 'control down, option down' }, // down arrow
      'center': { key: 'c', modifiers: 'control down, option down' },
      'fill-screen': { key: 'return', modifiers: 'control down, option down' },
    };

    const shortcut = shortcuts[action];
    if (!shortcut) {
      return {
        content: [
          {
            type: 'text',
            text: `Unknown action: ${action}`,
          },
        ],
      };
    }

    const script = `
      tell application "System Events"
        ${shortcut.key.length > 1 
          ? `key code ${shortcut.key} using {${shortcut.modifiers}}`
          : `keystroke "${shortcut.key}" using {${shortcut.modifiers}}`}
      end tell
    `;

    try {
      await this.runAppleScript(script);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully triggered Moom action: ${action}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,          },
        ],
      };
    }
  }

  async showMoomMenu() {
    const script = `
      tell application "System Events"
        tell process "Moom"
          try
            -- Click on the Moom menu bar icon
            click menu bar item 1 of menu bar 2
            return "Moom menu is now visible"
          on error errMsg
            return "Error showing Moom menu: " & errMsg
          end try
        end tell
      end tell
    `;

    try {
      const result = await this.runAppleScript(script);
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }

  async createQuadLayout(layoutName, display = 'main', apps) {
    if (apps.length !== 4) {
      return {
        content: [{
          type: 'text',
          text: 'Error: Quad layout requires exactly 4 apps'
        }]
      };
    }

    const script = `
      -- Rectangle shortcuts for quarters
      on topLeft()
        tell application "System Events"
          key code 32 using {control down, command down} -- U
        end tell
      end topLeft
      
      on topRight()
        tell application "System Events"
          key code 34 using {control down, command down} -- I
        end tell
      end topRight
      
      on bottomLeft()
        tell application "System Events"
          key code 38 using {control down, command down} -- J
        end tell
      end bottomLeft
      
      on bottomRight()
        tell application "System Events"
          key code 40 using {control down, command down} -- K
        end tell
      end bottomRight
      
      -- Position apps in quarters
      tell application "${apps[0]}" to activate
      delay 0.5
      topLeft()
      delay 0.5
      
      tell application "${apps[1]}" to activate
      delay 0.5
      topRight()
      delay 0.5
      
      tell application "${apps[2]}" to activate
      delay 0.5
      bottomLeft()
      delay 0.5
      
      tell application "${apps[3]}" to activate
      delay 0.5
      bottomRight()
      delay 0.5
      
      -- Save as Moom layout
      tell application "Moom"
        save layout and replace "${layoutName}"
      end tell
    `;

    try {
      await this.runAppleScript(script);
      return {
        content: [{
          type: 'text',
          text: `Successfully created quad layout: ${layoutName}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error creating quad layout: ${error.message}`
        }]
      };
    }
  }

  async createCustomGridLayout(layoutName, columns, rows) {
    const script = `
      tell application "Moom"
        -- This would require Moom's grid API or custom positioning
        -- For now, we'll create a notification
        display notification "Grid layout ${columns}x${rows} would be created here" with title "${layoutName}"
      end tell
    `;

    try {
      await this.runAppleScript(script);
      return {
        content: [{
          type: 'text',
          text: `Grid layout feature coming soon. For now, use Moom's built-in grid with ${columns}x${rows} dimensions.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }

  /**
   * Launch a specified application
   */
  async launchApplication(appName) {
    const script = `tell application "${appName}" to activate`;
    
    try {
      await this.runAppleScript(script);
      return {
        content: [{
          type: 'text',
          text: `Successfully launched ${appName}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error launching ${appName}: ${error.message}`
        }]
      };
    }
  }

  /**
   * Get monitor configuration using displayplacer
   */
  async getMonitors() {
    try {
      const output = execSync('displayplacer list', { encoding: 'utf8' });
      const displays = this.parseDisplayInfo(output);
      
      return {
        content: [{
          type: 'text',
          text: `Monitor Configuration:\n${displays.map((d, i) => 
            `Display ${i + 1}: ${d.width}x${d.height} at (${d.x}, ${d.y})${d.isMain ? ' [Main]' : ''}`
          ).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting monitor info: ${error.message}`
        }]
      };
    }
  }

  /**
   * Parse display information from displayplacer output
   */
  parseDisplayInfo(output) {
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
   * Set window position for precise control
   */
  async setWindowPosition(appName, x, y) {
    const processName = this.getProcessName(appName);
    const script = `
      tell application "${appName}" to activate
      delay 0.5
      tell application "System Events"
        tell process "${processName}"
          set frontmost to true
          set position of front window to {${x}, ${y}}
        end tell
      end tell
    `;

    try {
      await this.runAppleScript(script);
      return {
        content: [{
          type: 'text',
          text: `Successfully positioned ${appName} window at (${x}, ${y})`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error positioning ${appName}: ${error.message}`
        }]
      };
    }
  }

  /**
   * Set window size for precise control
   */
  async setWindowSize(appName, width, height) {
    const processName = this.getProcessName(appName);
    const script = `
      tell application "${appName}" to activate
      delay 0.5
      tell application "System Events"
        tell process "${processName}"
          set frontmost to true
          set size of front window to {${width}, ${height}}
        end tell
      end tell
    `;

    try {
      await this.runAppleScript(script);
      return {
        content: [{
          type: 'text',
          text: `Successfully resized ${appName} window to ${width}x${height}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error resizing ${appName}: ${error.message}`
        }]
      };
    }
  }

  /**
   * Get process name for different applications
   */
  getProcessName(appName) {
    const processMap = {
      "Visual Studio Code": "Code",
      "iTerm": "iTerm2",
      "Safari": "Safari",
      "Claude": "Claude",
      "Terminal": "Terminal",
      "Finder": "Finder",
      "Chrome": "Google Chrome",
      "Firefox": "Firefox"
    };
    return processMap[appName] || appName;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Moom MCP server started');
  }
}

const server = new MoomMCPServer();
server.start().catch(console.error);