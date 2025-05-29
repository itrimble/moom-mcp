const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { exec } = require('child_process');
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
          name: 'list_layouts',
          description: 'List all available Moom layouts',
          inputSchema: {
            type: 'object',
            properties: {},
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

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Moom MCP server started');
  }
}

const server = new MoomMCPServer();
server.start().catch(console.error);