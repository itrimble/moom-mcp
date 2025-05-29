const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Moom MCP Configuration Validator');
console.log('================================\n');

// Check Claude Desktop config
const configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'mcp-settings.json');

console.log('1. Checking Claude Desktop configuration...');
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.mcpServers && config.mcpServers.moom) {
      console.log('✅ Moom MCP is configured in Claude Desktop');
      console.log('   Command:', config.mcpServers.moom.command);
      console.log('   Args:', config.mcpServers.moom.args.join(' '));
    } else {
      console.log('❌ Moom MCP not found in configuration');
      console.log('   Please add it to your Claude Desktop settings');
    }
  } catch (error) {
    console.log('⚠️  Error reading config:', error.message);
  }
} else {
  console.log('❌ Claude Desktop config not found at expected location');
  console.log('   You may need to configure it manually in Claude Desktop');
}

// Check if Moom is running
console.log('\n2. Checking if Moom is running...');
const { exec } = require('child_process');
exec('pgrep -x Moom', (error, stdout, stderr) => {
  if (stdout.trim()) {
    console.log('✅ Moom is running (PID:', stdout.trim() + ')');
  } else {
    console.log('❌ Moom is not running - please start it');
  }
  
  // Test AppleScript access
  console.log('\n3. Testing AppleScript access...');
  const testScript = `
    tell application "System Events"
      return exists (processes where name is "Moom")
    end tell
  `;
  
  exec(`osascript -e '${testScript}'`, (error, stdout, stderr) => {
    if (stdout.trim() === 'true') {
      console.log('✅ AppleScript can access Moom');
    } else {
      console.log('❌ AppleScript cannot access Moom');
      console.log('   Check accessibility permissions for Terminal');
    }
    
    console.log('\n✅ Validation complete!');
  });
});