#!/bin/bash
# CursorEye Agent Launcher
# Opens a dedicated Terminal window for the agent + a Worker window
# Does NOT take over your current terminal

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_SCRIPT="$SCRIPT_DIR/agent.py"

osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    
    -- Agent server window
    set agentWin to do script "echo '🔴 CursorEye Agent Server' && echo '=============================' && echo '' && python3 \"$AGENT_SCRIPT\" && echo '' && echo 'Agent stopped. Close this window when done.'"
    set custom title of front window to "🔴 CursorEye Agent"
    
    -- Worker window (AI's own computer)
    set workerWin to do script "echo '🔴 CursorEye Worker' && echo '=========================' && echo 'AI can type and run commands here.' && echo 'This is AI\\'s dedicated workspace.' && echo '' && bash"
    set custom title of front window to "🔴 CursorEye Worker"
end tell
APPLESCRIPT

echo "✅ CursorEye Agent launched in dedicated windows."
echo "   Agent server: ws://localhost:8765"
echo "   Worker window: separate Terminal window"
