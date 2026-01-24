-- Save current clipboard content
set oldClipboard to the clipboard

-- Simulate Cmd+C to copy selected text
tell application "System Events"
    keystroke "c" using {command down}
end tell

-- Wait for clipboard to update
delay 0.2

-- Get new clipboard content
set newClipboard to the clipboard

-- Return the copied text
return newClipboard
