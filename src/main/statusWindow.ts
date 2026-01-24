import { BrowserWindow, screen } from 'electron'

let statusWindow: BrowserWindow | null = null
let hideTimer: NodeJS.Timeout | null = null

/**
 * Create a small status window near the cursor
 * @param message Message to display
 * @param type Type of message (translating, success, error)
 */
export function showStatusNearCursor(message: string, type: 'translating' | 'success' | 'error' = 'translating'): void {
  // Get cursor position
  const cursorPosition = screen.getCursorScreenPoint()

  // Clear existing timer
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  // If window already exists, update it
  if (statusWindow && !statusWindow.isDestroyed()) {
    statusWindow.webContents.send('update-status', { message, type })
    statusWindow.setPosition(cursorPosition.x + 20, cursorPosition.y + 20)
    statusWindow.show()
  } else {
    // Create new status window
    statusWindow = new BrowserWindow({
      width: 200,
      height: 60,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      focusable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    // Position near cursor
    statusWindow.setPosition(cursorPosition.x + 20, cursorPosition.y + 20)

    // Load HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: transparent;
            overflow: hidden;
          }

          .status-container {
            background: rgba(30, 30, 30, 0.95);
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
          }

          .status-text {
            color: white;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
          }

          .translating {
            border-left: 3px solid #3b82f6;
          }

          .success {
            border-left: 3px solid #10b981;
          }

          .error {
            border-left: 3px solid #ef4444;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .status-container {
            animation: fadeIn 0.2s ease-out;
          }
        </style>
      </head>
      <body>
        <div class="status-container translating" id="status">
          <div class="status-text" id="message">Translating...</div>
        </div>

        <script>
          const { ipcRenderer } = require('electron');

          ipcRenderer.on('update-status', (event, data) => {
            const statusEl = document.getElementById('status');
            const messageEl = document.getElementById('message');

            messageEl.textContent = data.message;
            statusEl.className = 'status-container ' + data.type;
          });
        </script>
      </body>
      </html>
    `

    statusWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    statusWindow.once('ready-to-show', () => {
      statusWindow?.show()

      // Send initial status
      statusWindow?.webContents.send('update-status', { message, type })
    })
  }

  // Auto-hide after delay (except for translating state)
  if (type !== 'translating') {
    hideTimer = setTimeout(() => {
      hideStatusWindow()
    }, 2000)
  }
}

/**
 * Hide the status window
 */
export function hideStatusWindow(): void {
  if (statusWindow && !statusWindow.isDestroyed()) {
    statusWindow.hide()
  }

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

/**
 * Destroy the status window
 */
export function destroyStatusWindow(): void {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  if (statusWindow && !statusWindow.isDestroyed()) {
    statusWindow.close()
    statusWindow = null
  }
}
