#!/bin/bash

# Moom MCP Installation Helper

echo "Moom MCP Installation Helper"
echo "==========================="
echo ""

# Get the current user
USER=$(whoami)
MCP_PATH="/Users/$USER/Desktop/moom-mcp"

# Check if Moom is installed
if ! pgrep -x "Moom" > /dev/null; then
    echo "⚠️  Warning: Moom doesn't appear to be running."
    echo "   Please start Moom before using the MCP."
    echo ""
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if already in the correct directory
if [ "$PWD" != "$MCP_PATH" ]; then
    echo "❌ Error: Please run this script from the moom-mcp directory:"
    echo "   cd ~/Desktop/moom-mcp && ./install.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Open Claude Desktop"
echo "2. Go to Settings > Developer > Edit Config"
echo "3. Add the following to your mcpServers section:"
echo ""
echo '  "moom": {'
echo '    "command": "node",'
echo "    \"args\": [\"$MCP_PATH/src/index.js\"]"
echo '  }'
echo ""
echo "4. Restart Claude Desktop"
echo "5. Test with: 'Show the Moom menu'"