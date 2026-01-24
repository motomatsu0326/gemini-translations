import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import path from 'path'
import { setupIpcHandlers, getSavedApiKey, getSavedShortcut } from './ipc'
import { registerTranslationShortcut, unregisterAllShortcuts, setTranslationCallbacks } from './shortcut'
import { initializeTranslator } from './gemini'
import { checkAccessibilityPermissions } from './applescript'
import { destroyStatusWindow } from './statusWindow'

let tray: Tray | null = null
let settingsWindow: BrowserWindow | null = null

/**
 * Create tray icon
 * @param isTranslating Whether the app is currently translating
 * @returns NativeImage for the icon
 */
function createTrayIcon(isTranslating: boolean = false): Electron.NativeImage {
  // Load icon from resources directory
  const isDev = !app.isPackaged
  const iconPath = isDev
    ? path.join(process.cwd(), 'resources', 'icon.png')
    : path.join(process.resourcesPath, 'resources', 'icon.png')

  let icon = nativeImage.createFromPath(iconPath)

  // Resize to appropriate size for menu bar (16x16 for normal, 32x32 for Retina)
  icon = icon.resize({ width: 16, height: 16 })

  // If translating, overlay a small indicator
  if (isTranslating) {
    // Add a small overlay or modify the icon to show it's translating
    // For now, we'll use the same icon but could add an overlay in the future
  }

  // Template images automatically adapt to light/dark mode on macOS
  icon.setTemplateImage(true)

  return icon
}

/**
 * Set tray icon to "translating" state
 */
export function setTrayTranslating(): void {
  if (tray) {
    tray.setImage(createTrayIcon(true))
  }
}

/**
 * Set tray icon to normal state
 */
export function setTrayNormal(): void {
  if (tray) {
    tray.setImage(createTrayIcon(false))
  }
}

/**
 * Create the settings window
 */
function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 700,
    resizable: false,
    title: 'Gemini Translation Settings',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false // Disable sandbox for better compatibility
    }
  })

  // Load the renderer
  const isDev = !app.isPackaged

  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173')
    // Open DevTools in development mode
    settingsWindow.webContents.openDevTools({ mode: 'detach' })
    console.log('Loading dev server at http://localhost:5173')
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Log any console errors
  settingsWindow.webContents.on('console-message', (_event, _level, message) => {
    console.log('Renderer log:', message)
  })

  // Log load failures
  settingsWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

/**
 * Create the menu bar tray icon
 */
function createTray(): void {
  const icon = createTrayIcon(false)
  tray = new Tray(icon)
  tray.setToolTip('Gemini Translation')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Open settings on tray icon click
  tray.on('click', () => {
    createSettingsWindow()
  })
}

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  // Setup IPC handlers
  setupIpcHandlers()

  // Create tray icon
  createTray()

  // Set up translation state callbacks
  setTranslationCallbacks(
    () => setTrayTranslating(),
    () => setTrayNormal()
  )

  // Check for accessibility permissions
  const hasPermissions = await checkAccessibilityPermissions()
  if (!hasPermissions) {
    console.warn('Accessibility permissions not granted. AppleScript may not work.')
  }

  // Initialize translator with saved API key
  const apiKey = getSavedApiKey()
  if (apiKey) {
    initializeTranslator(apiKey)
  }

  // Register global shortcut
  const shortcut = getSavedShortcut()
  const registered = registerTranslationShortcut(shortcut)

  if (!registered) {
    console.error('Failed to register global shortcut')
  }
}

// App lifecycle events
app.whenReady().then(async () => {
  await initializeApp()
})

// Quit when all windows are closed (but keep tray running)
app.on('window-all-closed', () => {
  // Don't quit the app - keep running in background
})

// Clean up before quit
app.on('will-quit', () => {
  unregisterAllShortcuts()
  destroyStatusWindow()
})

// macOS specific: Don't show in Dock
if (process.platform === 'darwin') {
  app.dock?.hide()
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // If someone tries to run a second instance, show settings window
    createSettingsWindow()
  })
}
