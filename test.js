const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testMoomIntegration() {
  console.log('Testing Moom AppleScript integration...\n');

  // Test 1: List layouts
  console.log('1. Listing Moom layouts:');
  try {
    const listScript = `
      tell application "Moom"
        set layoutNames to name of every snapshot
        return layoutNames
      end tell
    `;
    const { stdout } = await execAsync(`osascript -e '${listScript}'`);
    console.log('Available layouts:', stdout.trim());
  } catch (error) {
    console.error('Error listing layouts:', error.message);
  }

  console.log('\n2. Testing if Moom is running:');
  try {
    const checkScript = `
      tell application "System Events"
        return exists (processes where name is "Moom")
      end tell
    `;
    const { stdout } = await execAsync(`osascript -e '${checkScript}'`);
    console.log('Moom is running:', stdout.trim());
  } catch (error) {
    console.error('Error checking Moom status:', error.message);
  }
}

testMoomIntegration();