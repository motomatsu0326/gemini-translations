import { ipcMain, shell } from 'electron'
import Store from 'electron-store'
import { initializeTranslator } from './gemini'
import type { TranslationDirection } from './language'

interface SettingsSchema {
  apiKey: string
  translationDirection: TranslationDirection
  shortcut: string
}

// Initialize electron-store for persistent settings
const store = new Store<SettingsSchema>({
  defaults: {
    apiKey: '',
    translationDirection: 'auto',
    shortcut: 'Command+Option+T'
  }
})

/**
 * Setup all IPC handlers
 */
export function setupIpcHandlers(): void {
  // Get settings
  ipcMain.handle('get-settings', () => {
    return {
      apiKey: store.get('apiKey', ''),
      translationDirection: store.get('translationDirection', 'auto'),
      shortcut: store.get('shortcut', 'Command+Option+T')
    }
  })

  // Save settings
  ipcMain.handle('save-settings', (_, settings: Partial<SettingsSchema>) => {
    if (settings.apiKey !== undefined) {
      store.set('apiKey', settings.apiKey)
      // Re-initialize translator with new API key
      if (settings.apiKey) {
        initializeTranslator(settings.apiKey)
      }
    }

    if (settings.translationDirection !== undefined) {
      store.set('translationDirection', settings.translationDirection)
    }

    if (settings.shortcut !== undefined) {
      store.set('shortcut', settings.shortcut)
    }

    return { success: true }
  })

  // Open external URL
  ipcMain.on('open-external', (_, url: string) => {
    shell.openExternal(url)
  })
}

/**
 * Get saved API key
 * @returns The saved API key
 */
export function getSavedApiKey(): string {
  return store.get('apiKey', '')
}

/**
 * Get saved translation direction preference
 * @returns The saved translation direction
 */
export function getSavedTranslationDirection(): TranslationDirection {
  return store.get('translationDirection', 'auto')
}

/**
 * Get saved keyboard shortcut
 * @returns The saved shortcut
 */
export function getSavedShortcut(): string {
  return store.get('shortcut', 'Command+Option+T')
}
