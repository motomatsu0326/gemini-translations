import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { app, clipboard } from 'electron'

const execAsync = promisify(exec)

/**
 * Get selected text by simulating Cmd+C and retrieving clipboard content
 * @returns The selected text or null if no text is selected
 */
export async function getSelectedText(): Promise<string | null> {
  try {
    // Save current clipboard content
    const oldClipboard = clipboard.readText()

    // Clear clipboard to detect if new content is copied
    clipboard.clear()

    // Get the path to the AppleScript file
    const isDev = !app.isPackaged
    const scriptPath = isDev
      ? path.join(process.cwd(), 'scripts', 'copyText.scpt')
      : path.join(process.resourcesPath, 'scripts', 'copyText.scpt')

    // Execute AppleScript to simulate Cmd+C
    await execAsync(`osascript "${scriptPath}"`)

    // Wait a bit for clipboard to update
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get the new clipboard content
    const newClipboard = clipboard.readText()

    // If clipboard is empty or unchanged, no text was selected
    if (!newClipboard || newClipboard === oldClipboard) {
      // Restore old clipboard
      if (oldClipboard) {
        clipboard.writeText(oldClipboard)
      }
      return null
    }

    return newClipboard
  } catch (error) {
    console.error('Error getting selected text:', error)
    return null
  }
}

/**
 * Check if the app has accessibility permissions
 * This is required for AppleScript to simulate keyboard events
 */
export async function checkAccessibilityPermissions(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      'osascript -e \'tell application "System Events" to keystroke ""\''
    )
    return true
  } catch (error: any) {
    // If error message contains "not allowed assistive access", permissions are missing
    if (error.message.includes('not allowed assistive access')) {
      return false
    }
    return true
  }
}
