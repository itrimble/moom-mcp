const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testMoomUIScripting() {
  console.log('Testing Moom UI Scripting...\n');

  // Test 1: Check if UI scripting can access Moom
  console.log('1. Checking UI access to Moom:');
  try {
    const script = `
      tell application "System Events"
        tell process "Moom"
          set windowCount to count of windows
          set menuCount to count of menu bars
          return "Windows: " & windowCount & ", Menu bars: " & menuCount
        end tell
      end tell
    `;
    const { stdout } = await execAsync(`osascript -e '${script}'`);
    console.log('UI Access result:', stdout.trim());
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Moom is running');
    console.log('2. Terminal has accessibility permissions');
    console.log('   (System Preferences > Security & Privacy > Privacy > Accessibility)');
  }

  // Test 2: Try to trigger Moom menu
  console.log('\n2. Testing Moom menu bar access:');
  try {
    const script = `
      tell application "System Events"
        tell process "Moom"
          -- Try to click the Moom menu bar icon
          try
            click menu bar item 1 of menu bar 2
            delay 0.5
            key code 53 -- ESC to close
            return "Successfully accessed Moom menu"
          on error
            return "Could not access Moom menu bar"
          end try
        end tell
      end tell
    `;
    const { stdout } = await execAsync(`osascript -e '${script}'`);
    console.log('Menu test:', stdout.trim());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMoomUIScripting();