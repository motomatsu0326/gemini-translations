import { globalShortcut } from 'electron'
import { translateSelectedText } from './translator'
import { getSavedTranslationDirection } from './ipc'

// Callbacks for UI state updates
let onTranslationStartCallback: (() => void) | null = null
let onTranslationEndCallback: (() => void) | null = null

/**
 * Set callbacks for translation state changes
 * @param onStart Called when translation starts
 * @param onEnd Called when translation ends
 */
export function setTranslationCallbacks(onStart: () => void, onEnd: () => void): void {
  onTranslationStartCallback = onStart
  onTranslationEndCallback = onEnd
}

/**
 * Register the global shortcut for translation
 * @param shortcut The keyboard shortcut (e.g., "Command+Option+T")
 * @returns true if registration was successful
 */
export function registerTranslationShortcut(shortcut: string): boolean {
  try {
    // Unregister existing shortcut if any
    globalShortcut.unregisterAll()

    // Register new shortcut
    const success = globalShortcut.register(shortcut, async () => {
      console.log(`Shortcut ${shortcut} triggered`)

      // Notify translation start
      onTranslationStartCallback?.()

      try {
        // Get user's translation direction preference
        const translationDirection = getSavedTranslationDirection()

        // Execute translation workflow
        await translateSelectedText(translationDirection)
      } finally {
        // Notify translation end (regardless of success/failure)
        onTranslationEndCallback?.()
      }
    })

    if (success) {
      console.log(`Global shortcut ${shortcut} registered successfully`)
    } else {
      console.error(`Failed to register global shortcut ${shortcut}`)
    }

    return success
  } catch (error) {
    console.error('Error registering shortcut:', error)
    return false
  }
}

/**
 * Unregister all global shortcuts
 */
export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
}

/**
 * Check if a shortcut is currently registered
 * @param shortcut The keyboard shortcut to check
 * @returns true if the shortcut is registered
 */
export function isShortcutRegistered(shortcut: string): boolean {
  return globalShortcut.isRegistered(shortcut)
}
