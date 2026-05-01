#!/bin/bash
# CursorEye Agent Launcher v2
# Opens dedicated Terminal windows: Agent Server + Worker (black bg, purple branding)
# Does NOT take over your current terminal

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_SCRIPT="$SCRIPT_DIR/agent.py"
TMPFILE=$(mktemp /tmp/cursoreye_launch_XXXXXX.scpt)

# Write AppleScript to temp file to avoid shell escaping nightmares
cat > "$TMPFILE" << 'SCRIPTEOF'
on run argv
	set agentScript to item 1 of argv
	
	tell application "Terminal"
		activate
		
		-- Agent server window
		set agentWin to do script "echo '🔴 CursorEye Agent Server' && echo '=============================' && echo '' && python3 \"" & agentScript & "\" && echo '' && echo 'Agent stopped. Close this window when done.'"
		set custom title of front window to "🔴 CursorEye Agent"
		
		-- Worker window with custom branding (black bg, purple text)
		set workerWin to do script "printf '\\033]1337;SetColors=bg=#000000,fg=#d4b8ff\\007' && clear && echo '' && echo '  ██████╗██╗   ██╗██████╗ ███████╗██████╗ ███████╗██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗' && echo ' ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗██║   ██║████╗  ██║██║ ██╔╝' && echo ' ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝█████╗  ██║  ██║██║   ██║██╔██╗ ██║█████╔╝ ' && echo ' ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██╔══╝  ██║  ██║██║   ██║██║╚██╗██║██╔═██╗ ' && echo ' ╚██████╗   ██║   ██████╔╝███████╗██║  ██║███████╗██████╔╝╚██████╔╝██║ ╚████║██║  ██╗' && echo '  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝' && echo '' && echo '  ────────────────────────────────────────' && echo '  AI Workspace • Autonomous Terminal' && echo '  ────────────────────────────────────────' && echo '' && bash"
		set custom title of front window to "🔴 CursorEye Worker"
	end tell
end run
SCRIPTEOF

osascript "$TMPFILE" "$AGENT_SCRIPT"
rm -f "$TMPFILE"

echo ""
echo "✅ CursorEye Agent launched in dedicated windows."
echo "   Agent server: ws://localhost:8765"
echo "   Worker window: black bg + purple CURSOR EYE branding"
