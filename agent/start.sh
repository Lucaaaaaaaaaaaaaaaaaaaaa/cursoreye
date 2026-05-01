#!/bin/bash
# CursorEye Agent Launcher v4
# Creates a dedicated macOS Space for AI using fullscreen trick
# User can 4-finger swipe between their Space and AI's Space

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_SCRIPT="$SCRIPT_DIR/agent.py"

CURSOREYE_DIR="$HOME/.cursoreye"
mkdir -p "$CURSOREYE_DIR"

# Step 1: Generate wallpaper
python3 << 'PYEOF'
import os, subprocess
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    subprocess.run(["pip3", "install", "--break-system-packages", "Pillow", "-q"], timeout=30)
    from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGB', (1920, 1080), (0, 0, 0))
draw = ImageDraw.Draw(img)

try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 120)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

draw.text((960, 440), "CURSOR EYE", fill=(108, 92, 231), font=font_large, anchor="mm")
draw.text((960, 540), "AI Workspace - Autonomous Desktop", fill=(160, 140, 220), font=font_small, anchor="mm")

path = os.path.expanduser("~/.cursoreye/wallpaper.png")
img.save(path)
print(f"Wallpaper saved to {path}")
PYEOF

# Step 2: Open Agent server in Terminal
AGENT_SCPT=$(mktemp /tmp/cursoreye_agent_XXXXXX.scpt)
cat > "$AGENT_SCPT" << 'SCRIPTEOF'
on run argv
    set agentScript to item 1 of argv
    tell application "Terminal"
        activate
        set agentWin to do script "echo '🔴 CursorEye Agent Server' && echo '=============================' && echo '' && python3 \"" & agentScript & "\" && echo '' && echo 'Agent stopped.'"
        set custom title of front window to "🔴 CursorEye Agent"
    end tell
end run
SCRIPTEOF
osascript "$AGENT_SCPT" "$AGENT_SCRIPT"
rm -f "$AGENT_SCPT"

sleep 2

# Step 3: Open Worker Terminal window
WORKER_SCPT=$(mktemp /tmp/cursoreye_worker_XXXXXX.scpt)
cat > "$WORKER_SCPT" << 'SCRIPTEOF'
on run
    tell application "Terminal"
        activate
        set workerWin to do script "printf '\\033]1337;SetColors=bg=#000000,fg=#d4b8ff\\007' && clear && echo '' && echo ' ██████╗██╗ ██╗██████╗ ███████╗██████╗ ███████╗██████╗ ██╗ ██╗███╗ ██╗██╗ ██╗' && echo ' ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗██║ ██║████╗ ██║██║ ██╔╝' && echo ' ██║ ╚████╔╝ ██████╔╝█████╗ ██████╔╝█████╗ ██║ ██║██║ ██║██╔██╗ ██║█████╔╝ ' && echo ' ██║ ╚██╔╝ ██╔══██╗██╔══╝ ██╔══██╗██╔══╝ ██║ ██║██║ ██║██║╚██╗██║██╔═██╗ ' && echo ' ╚██████╗ ██║ ██████╔╝███████╗██║ ██║███████╗██████╔╝╚██████╔╝██║ ╚████║██║ ██╗' && echo ' ╚═════╝ ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═╝╚══════╝╚═════╝ ╚═════╝ ╚═╝ ╚═══╝╚═╝ ╚═╝' && echo '' && echo ' ────────────────────────────────────────' && echo ' AI Workspace • Autonomous Terminal' && echo ' ────────────────────────────────────────' && echo '' && bash"
        set custom title of front window to "🔴 CursorEye Worker"
    end tell
end run
SCRIPTEOF
osascript "$WORKER_SCPT"
rm -f "$WORKER_SCPT"

sleep 1

# Step 4: Move Worker window to its own Desktop Space via fullscreen trick
# Ctrl+Cmd+F enters fullscreen, which macOS auto-creates a new Space for.
# Then we exit fullscreen — window stays in that Space as a normal window.
SPACE_SCPT=$(mktemp /tmp/cursoreye_space_XXXXXX.scpt)
cat > "$SPACE_SCPT" << 'SPACEEOF'
on run
    tell application "Terminal"
        activate
        -- Bring Worker window to front
        set index of every window whose custom title contains "CursorEye Worker" to 1
        delay 0.5
    end tell

    tell application "System Events"
        -- Enter fullscreen (creates new Space)
        keystroke "f" using {control down, command down}
        delay 2.5

        -- Exit fullscreen (window stays in the new Space)
        keystroke "f" using {control down, command down}
        delay 1.5
    end tell

    -- Now move Agent window to the same Space as Worker
    tell application "Terminal"
        activate
        set index of every window whose custom title contains "CursorEye Agent" to 1
        delay 0.3
    end tell

    tell application "System Events"
        -- Use Mission Control to drag Agent window to Desktop 2
        -- Method: Ctrl+1 to go to Desktop 1, then we use the assignment menu
        -- Actually, just use Ctrl+2 after the fullscreen trick created Desktop 2
        -- The fullscreen trick already moved Worker to a new Desktop
        -- Let's just bring Agent to the same desktop via keyboard
        -- Unfortunately macOS doesn't have a simple keyboard shortcut for this
        -- The Worker window is already in its own Space, which is what matters
    end tell
end run
SPACEEOF
osascript "$SPACE_SCPT" 2>/dev/null
rm -f "$SPACE_SCPT"

echo ""
echo "✅ CursorEye Agent launched!"
echo ""
echo "📌 AI Desktop Space:"
echo " The Worker Terminal is now in its own Desktop Space."
echo " Swipe with 4 fingers left/right to switch between your Space and AI's Space."
echo ""
echo "🎨 Wallpaper: ~/.cursoreye/wallpaper.png"
echo "   In AI's Space: right-click Desktop → Change Wallpaper → select this file"
echo ""
echo "🖱️ AI Purple Cursor:"
echo " When AI clicks in the Worker window, a purple dot shows where it clicked."
echo " The purple cursor does NOT move your real mouse cursor."
