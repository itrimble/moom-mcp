#!/usr/bin/env node

// Moom MCP Demo - Shows available commands

console.log(`
🖼️  Moom MCP - Available Commands
================================

📌 Layout Management:
   • activate_layout - Switch to a saved layout
     Example: "Activate my Teaching (Mac Mini) layout"
   
   • save_current_layout - Save current window arrangement
     Example: "Save this as Development Setup"

🔧 Window Actions:
   • trigger_moom_action - Control window size/position
     Actions: grow, shrink, move-left, move-right, 
              move-up, move-down, center, fill-screen
     Example: "Make the window bigger"

📋 Menu Control:
   • show_moom_menu - Display the Moom popup
     Example: "Show the Moom menu"

💡 Pro Tips:
   - Layout names are case-sensitive
   - Create layouts for different contexts (work, personal, teaching)
   - Combine with other commands for workflows
   
🚀 Quick Start:
   1. "Show Moom menu" - See your layouts
   2. "Activate [layout name]" - Switch layouts
   3. "Save current as [name]" - Create new layouts

Need help? Check examples.md for more usage examples!
`);