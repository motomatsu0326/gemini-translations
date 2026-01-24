import { useState, useEffect } from 'react'

type TranslationDirection = 'auto' | 'en-to-ja' | 'ja-to-en'

interface SettingsData {
  apiKey: string
  translationDirection: TranslationDirection
  shortcut: string
}

function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [translationDirection, setTranslationDirection] = useState<TranslationDirection>('auto')
  const [shortcut, setShortcut] = useState('Command+Option+T')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved settings
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((settings: SettingsData) => {
        if (settings.apiKey) setApiKey(settings.apiKey)
        if (settings.translationDirection) setTranslationDirection(settings.translationDirection)
        if (settings.shortcut) setShortcut(settings.shortcut)
      })
    }
  }, [])

  // Convert shortcut string to macOS symbols
  const formatShortcut = (shortcutStr: string): string => {
    return shortcutStr
      .replace(/Command/g, '⌘')
      .replace(/Cmd/g, '⌘')
      .replace(/Option/g, '⌥')
      .replace(/Alt/g, '⌥')
      .replace(/Shift/g, '⇧')
      .replace(/Control/g, '⌃')
      .replace(/Ctrl/g, '⌃')
      .replace(/\+/g, '')
  }

  const handleSave = async () => {
    if (window.electronAPI) {
      await window.electronAPI.saveSettings({
        apiKey,
        translationDirection,
        shortcut
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Translation Settings</h1>

        {/* API Key Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Translation Direction */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Translation Direction
          </label>
          <select
            value={translationDirection}
            onChange={(e) => setTranslationDirection(e.target.value as TranslationDirection)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="auto">Auto Detect (Recommended)</option>
            <option value="en-to-ja">English → Japanese</option>
            <option value="ja-to-en">Japanese → English</option>
          </select>
        </div>

        {/* Shortcut */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keyboard Shortcut
          </label>
          <input
            type="text"
            value={shortcut}
            onChange={(e) => setShortcut(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p className="mt-2 text-sm text-gray-500">
            Default: <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘⌥T</kbd>
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">
              Settings saved successfully!
            </span>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Select any text in any application</li>
            <li>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{formatShortcut(shortcut)}</kbd></li>
            <li>Translated text will be copied to clipboard</li>
            <li>Paste it anywhere with <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘V</kbd></li>
          </ol>
          <p className="mt-4 text-sm text-gray-500">
            Note: This app requires Accessibility permissions. Grant access in System Preferences → Security & Privacy → Accessibility
          </p>
        </div>
      </div>
    </div>
  )
}

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      getSettings: () => Promise<SettingsData>
      saveSettings: (settings: SettingsData) => Promise<void>
      openExternal: (url: string) => void
    }
  }
}

export default Settings
