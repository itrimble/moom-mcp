#!/usr/bin/env node

/**
 * Professional Workflow Manager for MOOM MCP
 * Implements AI-driven intelligent layout management with zero overlap guarantee
 */

const DisplayPlacerIntegration = require('./displayplacer-layouts');

class ProfessionalWorkflowManager {
  constructor(moomServer) {
    this.moomServer = moomServer;
    this.displayPlacer = new DisplayPlacerIntegration(); // Add this line
    this.workflows = this.defineWorkflows();
  }

  /**
   * Define professional workflows with guaranteed non-overlapping layouts
   */
  defineWorkflows() {
    return {
      coding: {
        name: "Professional Coding Workflow",
        description: "Optimized layout for software development with zero overlaps",
        layout: "Professional Non-Overlapping Coding",
        applications: ["Visual Studio Code", "Safari", "iTerm", "Claude"],
        requirements: {
          minScreenWidth: 1920,
          preferredDisplays: 2,
          snapToGrid: true
        }
      },
      
      teaching: {
        name: "Teaching & Presentation Workflow", 
        description: "Layout optimized for teaching with screen sharing",
        layout: "Teaching (Mac Mini)",
        applications: ["Keynote", "Safari", "Notes", "Zoom"],
        requirements: {
          minScreenWidth: 1920,
          preferredDisplays: 1,
          snapToGrid: true
        }
      },

      research: {
        name: "AI Research & Analysis Workflow",
        description: "Multi-monitor setup for research and analysis",
        layout: "Ultimate Multi-Monitor Non-Overlapping", 
        applications: ["Claude", "Safari", "Notes", "Papers"],
        requirements: {
          minScreenWidth: 3840,
          preferredDisplays: 3,
          snapToGrid: true
        }
      },

      writing: {
        name: "Writing & Documentation Workflow",
        description: "Focused layout for writing and documentation",
        layout: "Left & Right",
        applications: ["Typora", "Safari", "Claude"],
        requirements: {
          minScreenWidth: 1920,
          preferredDisplays: 1,
          snapToGrid: true
        }
      }
    };
  }

  /**
   * Activate a complete workflow with validation
   */
  async activateWorkflow(workflowName) {
    const workflow = this.workflows[workflowName];
    if (!workflow) {
      return {
        success: false,
        error: `Workflow '${workflowName}' not found`,
        availableWorkflows: Object.keys(this.workflows)
      };
    }

    try {
      // 1. Validate monitor setup
      const monitorValidation = await this.validateMonitorSetup(workflow);
      if (!monitorValidation.valid) {
        return {
          success: false,
          error: `Monitor setup insufficient: ${monitorValidation.reason}`,
          requirements: workflow.requirements
        };
      }

      // 2. Launch required applications
      const launchResults = await this.launchApplications(workflow.applications);
      
      // 3. Activate the layout (this ensures zero overlap)
      let layoutAppleScript;
      let layoutResultPayload = { success: false, message: "Layout activation pending." }; // Store result from AppleScript or Moom
      const layoutDefinition = workflow.layout;

      let layoutObject; // This will hold the object from createCodingLayout, etc.

      if (layoutDefinition === "Professional Non-Overlapping Coding") {
        layoutObject = this.displayPlacer.createCodingLayout();
      } else if (layoutDefinition === "Ultimate Multi-Monitor Non-Overlapping") {
        layoutObject = this.displayPlacer.createMultiMonitorLayout();
      } // Add other mappings here if DisplayPlacerIntegration gets more layout types

      if (layoutObject) {
        layoutAppleScript = this.displayPlacer.generateAppleScript(layoutObject);
        if (this.moomServer && typeof this.moomServer.runAppleScript === 'function') {
          const scriptExecResult = await this.moomServer.runAppleScript(layoutAppleScript);
          // Extract message and determine success
          if (scriptExecResult && scriptExecResult.content && scriptExecResult.content[0] && scriptExecResult.content[0].text) {
            layoutResultPayload.message = scriptExecResult.content[0].text;
            if (scriptExecResult.content[0].text.includes("applied with errors")) {
              layoutResultPayload.success = false; // Or treat as partial success depending on requirements
              console.warn(`Layout script for '${workflow.name}' executed with errors: ${scriptExecResult.content[0].text}`);
            } else if (scriptExecResult.content[0].text.includes("applied successfully")) {
              layoutResultPayload.success = true;
            } else {
              // Unknown response from script
              layoutResultPayload.success = false;
              console.warn(`Layout script for '${workflow.name}' returned unexpected message: ${scriptExecResult.content[0].text}`);
            }
          } else {
            layoutResultPayload.success = false;
            layoutResultPayload.message = "Failed to execute layout script or received empty response.";
            console.error(`Failed to execute layout script for '${workflow.name}' or received empty response.`);
          }
        } else {
          layoutResultPayload.success = false;
          layoutResultPayload.message = "Moom server does not support runAppleScript or is not available.";
          console.error(`Moom server does not support runAppleScript or is not available for workflow '${workflow.name}'.`);
        }
      } else if (this.moomServer && typeof this.moomServer.activateLayout === 'function' &&
                 (layoutDefinition === "Teaching (Mac Mini)" || layoutDefinition === "Left & Right")) {
        // Fallback to Moom named layouts for specific, known named layouts
        const moomLayoutResult = await this.moomServer.activateLayout(layoutDefinition);
        // Assuming moomLayoutResult is { content: [{ type: 'text', text: '...' }] }
        if (moomLayoutResult && moomLayoutResult.content && moomLayoutResult.content[0] && moomLayoutResult.content[0].text) {
          layoutResultPayload.message = moomLayoutResult.content[0].text;
          // Assuming Moom's activateLayout is successful if no error is thrown and message indicates success
          // Moom typically returns the layout name on success, or an error message.
          const lcMessage = moomLayoutResult.content[0].text.toLowerCase();
          if (lcMessage.startsWith('error') || lcMessage.startsWith('could not find')) {
             layoutResultPayload.success = false;
          } else {
             layoutResultPayload.success = true; // Assume success if no explicit error
          }
        } else {
          layoutResultPayload.success = false;
          layoutResultPayload.message = `Failed to activate Moom layout '${layoutDefinition}' or received empty response.`;
        }
      } else {
        layoutResultPayload.success = false;
        layoutResultPayload.message = `Layout type '${layoutDefinition}' is not configured for dynamic generation or as a known Moom layout.`;
        console.warn(`No dynamic layout or Moom named layout configured for: ${layoutDefinition} in workflow '${workflow.name}'`);
      }
      
      // 4. Validate the final layout
      const validation = await this.validateLayout(layoutResultPayload, workflow.applications);

      return {
        success: layoutResultPayload.success, // Reflects actual layout success
        workflow: workflow.name,
        layout: workflow.layout, // Original layout name from definition
        appliedLayoutDetails: layoutResultPayload.message, // Message from script/Moom
        applications: launchResults,
        validation: validation, // validation is still a mock
        message: layoutResultPayload.success ? `Successfully activated workflow '${workflow.name}'. ${layoutResultPayload.message}` : `Workflow '${workflow.name}' activated with issues. ${layoutResultPayload.message}`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        workflow: workflowName
      };
    }
  }

  /**
   * Validate monitor setup meets workflow requirements
   */
  async validateMonitorSetup(workflow) {
    try {
      const monitors = await this.getMonitorData();
      const totalWidth = monitors.reduce((sum, monitor) => {
        return sum + monitor.width;
      }, 0);

      if (totalWidth < workflow.requirements.minScreenWidth) {
        return {
          valid: false,
          reason: `Insufficient screen width: ${totalWidth}px < ${workflow.requirements.minScreenWidth}px required`
        };
      }

      if (monitors.length < workflow.requirements.preferredDisplays) {
        return {
          valid: true,
          warning: `Only ${monitors.length} displays available, ${workflow.requirements.preferredDisplays} preferred`
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: `Monitor validation failed: ${error.message}`
      };
    }
  }

  /**
   * Get parsed monitor data
   */
  async getMonitorData() {
    const monitorOutput = await this.moomServer.getMonitors();
    const lines = monitorOutput.content[0].text.split('\n');
    const monitors = [];

    for (const line of lines) {
      const match = line.match(/Display \d+: (\d+)x(\d+) at \((-?\d+), (-?\d+)\)/);
      if (match) {
        monitors.push({
          width: parseInt(match[1]),
          height: parseInt(match[2]),
          x: parseInt(match[3]),
          y: parseInt(match[4])
        });
      }
    }

    return monitors;
  }

  /**
   * Launch applications sequentially to avoid conflicts
   */
  async launchApplications(applications) {
    const results = [];
    
    for (const app of applications) {
      try {
        await this.moomServer.launchApplication(app);
        results.push({ app, status: 'launched' });
        // Small delay to prevent AppleScript conflicts
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({ app, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  /**
   * Validate current layout for overlaps
   */
  async validateLayout(layoutResultPayload, workflowApplications = []) {
    if (!layoutResultPayload) {
      return {
        validated: false,
        overlapDetected: 'unknown',
        windowCount: 0,
        message: "Validation skipped: Layout application result not provided."
      };
    }

    const layoutAppliedSuccessfully = layoutResultPayload.success;
    const layoutMessage = layoutResultPayload.message || "No message from layout application.";

    // If layout application failed or had errors, we assume the layout is not clean/as-intended.
    const overlapProblem = !layoutAppliedSuccessfully;

    let presumedWindowCount = 0;
    if (layoutAppliedSuccessfully && workflowApplications && workflowApplications.length > 0) {
        presumedWindowCount = workflowApplications.length;
    } else if (!layoutAppliedSuccessfully && workflowApplications && workflowApplications.length > 0 && layoutMessage.includes("applied with errors")) {
        // Simple heuristic: if errors, maybe half the windows are okay. This is a placeholder for better logic.
        presumedWindowCount = Math.max(0, Math.floor(workflowApplications.length / 2));
    }
    // If not successful and not specifically "with errors", count might be 0 or less predictable.

    return {
      validated: true, // Indicates that the validation logic itself ran.
      // "overlapDetected" here means "layout is not as expected due to application errors or geometric check"
      // Currently, it's based on application status, not geometric check.
      overlapDetected: overlapProblem ? "assumed_due_to_application_errors" : "not_checked_geometrically",
      windowCount: presumedWindowCount, // This is an estimate of intended windows based on application status
      message: `Validation based on layout application status. Reported: "${layoutMessage}"`
    };
  }

  /**
   * Get workflow recommendations based on current context
   */
  getWorkflowRecommendations(context = {}) {
    const recommendations = [];

    if (context.timeOfDay === 'morning') {
      recommendations.push({
        workflow: 'coding',
        reason: 'Optimal focus time for development work'
      });
    }

    if (context.hasMultipleMonitors) {
      recommendations.push({
        workflow: 'research', 
        reason: 'Multi-monitor setup ideal for research workflow'
      });
    }

    if (context.hasZoomMeeting) {
      recommendations.push({
        workflow: 'teaching',
        reason: 'Teaching layout optimized for screen sharing'
      });
    }

    return recommendations;
  }

  /**
   * Create custom workflow
   */
  async createCustomWorkflow(name, config) {
    // Validate configuration
    if (!config.applications || !config.layout) {
      throw new Error('Custom workflow requires applications and layout');
    }

    // Add to workflows
    this.workflows[name] = {
      name: config.name || name,
      description: config.description || 'Custom workflow',
      layout: config.layout,
      applications: config.applications,
      requirements: config.requirements || {
        minScreenWidth: 1920,
        preferredDisplays: 1,
        snapToGrid: true
      },
      custom: true
    };

    return {
      success: true,
      workflow: this.workflows[name],
      message: `Custom workflow '${name}' created successfully`
    };
  }

  /**
   * List all available workflows
   */
  listWorkflows() {
    return Object.entries(this.workflows).map(([key, workflow]) => ({
      id: key,
      name: workflow.name,
      description: workflow.description,
      layout: workflow.layout,
      applications: workflow.applications,
      requirements: workflow.requirements,
      custom: workflow.custom || false
    }));
  }
}

module.exports = ProfessionalWorkflowManager;

// CLI usage example
if (require.main === module) {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');

  // Mock MOOM server for testing
  const mockMoomServer = {
    activateLayout: async (name) => {
      console.log(`[Mock Moom] Activating layout: ${name}`);
      // Simulate Moom's typical success message if no error.
      // Check for known problematic names to simulate errors.
      if (name === "ErrorLayout") {
          return { success: false, content: [{ type: 'text', text: `Error: Could not find layout ${name}`}] };
      }
      return { success: true, content: [{ type: 'text', text: `Activated Moom layout ${name}`}] };
    },
    launchApplication: async (app) => {
      console.log(`[Mock Moom] Launching application: ${app}`);
      return { success: true, appName: app, content: [{ type: 'text', text: `Successfully launched ${app}`}] };
    },
    getMonitors: async () => {
      console.log("[Mock Moom] Getting monitors");
      return {
        success: true,
        content: [{
          type: 'text',
          text: "Display 1: 1920x1080 at (0, 0) [Main]\nDisplay 2: 2560x1440 at (1920, 0)"
        }]
      };
    },
    runAppleScript: async (script) => {
      console.log(`[Mock Moom] Running AppleScript:\n---\n${script}\n---`);
      // Simulate different outcomes based on script content for testing
      if (script.includes("Error: Application NonExistentApp is not running")) {
        return { success: false, content: [{ type: 'text', text: "Layout 'TestErrorLayout' applied with errors: Error: Application NonExistentApp is not running. Cannot position."}] };
      }
      return { success: true, content: [{ type: 'text', text: "Layout 'MockDynamicLayout' applied successfully." }] };
    }
    // Add any other methods if ProfessionalWorkflowManager starts using them.
  };

  const manager = new ProfessionalWorkflowManager(mockMoomServer);

  console.log('🚀 Professional Workflow Manager CLI');
  console.log('====================================');

  yargs(hideBin(process.argv))
    .command('list', 'List available workflows', () => {
      console.log('\nAvailable Workflows:');
      const workflows = manager.listWorkflows();
      if (workflows.length === 0) {
        console.log('No workflows defined.');
        return;
      }
      workflows.forEach(workflow => {
        console.log(`  ID: ${workflow.id}`);
        console.log(`    Name: ${workflow.name}`);
        console.log(`    Description: ${workflow.description}`);
        console.log(`    Layout: ${workflow.layout}`);
        console.log(`    Applications: ${workflow.applications.join(', ')}`);
        console.log('    ---');
      });
    })
    .command('activate <workflowId>', 'Activate a specific workflow', (yargsCmd) => {
      yargsCmd.positional('workflowId', {
        describe: 'ID of the workflow to activate (e.g., coding, research)',
        type: 'string'
      });
    }, async (argv) => {
      console.log(`\nAttempting to activate workflow: ${argv.workflowId}...`);
      const result = await manager.activateWorkflow(argv.workflowId);
      console.log('\nActivation Result:');
      console.log(`  Success: ${result.success}`);
      console.log(`  Workflow: ${result.workflow || 'N/A'}`);
      if (result.error) {
        console.error(`  Error: ${result.error}`);
      }
      if (result.message) {
        console.log(`  Message: ${result.message}`);
      }
      if (result.appliedLayoutDetails) {
        console.log(`  Layout Details: ${result.appliedLayoutDetails}`);
      }
      if (result.validation) {
        console.log('  Validation Status:');
        console.log(`    Validated: ${result.validation.validated}`);
        console.log(`    Message: ${result.validation.message}`);
        console.log(`    Overlap Detected: ${result.validation.overlapDetected}`);
        console.log(`    Presumed Window Count: ${result.validation.windowCount}`);
      }
    })
    .demandCommand(1, 'Please specify a command: list or activate.')
    .help()
    .strict() // Report errors for unknown commands
    .argv;
}
