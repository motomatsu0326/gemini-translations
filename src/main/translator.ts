import { clipboard, Notification } from 'electron'
import { getSelectedText } from './applescript'
import { getTranslationDirection, type TranslationDirection } from './language'
import { getTranslator } from './gemini'
import { showStatusNearCursor, hideStatusWindow } from './statusWindow'

export interface TranslationResult {
  success: boolean
  originalText?: string
  translatedText?: string
  error?: string
}

/**
 * Main translation workflow orchestrator
 * 1. Get selected text via AppleScript
 * 2. Detect language and translation direction
 * 3. Translate using Gemini API
 * 4. Copy result to clipboard
 *
 * @param translationPreference User's translation direction preference
 * @returns Translation result
 */
export async function translateSelectedText(
  translationPreference: TranslationDirection = 'auto'
): Promise<TranslationResult> {
  try {
    // Step 1: Get selected text
    const selectedText = await getSelectedText()

    if (!selectedText || selectedText.trim().length === 0) {
      return {
        success: false,
        error: 'No text selected'
      }
    }

    // Step 2: Detect language and determine translation direction
    const { source, target } = getTranslationDirection(selectedText, translationPreference)

    console.log(`Translating from ${source} to ${target}`)
    console.log(`Original text: ${selectedText.substring(0, 50)}...`)

    // Show "translating" status near cursor
    const sourceLang = source === 'japanese' ? 'JP' : 'EN'
    const targetLang = target === 'japanese' ? 'JP' : 'EN'
    showStatusNearCursor(`Translating ${sourceLang} → ${targetLang}...`, 'translating')

    // Step 3: Translate using Gemini API
    const translator = getTranslator()

    if (!translator.isInitialized()) {
      showStatusNearCursor('Please set API key', 'error')
      return {
        success: false,
        originalText: selectedText,
        error: 'Gemini API not initialized. Please set your API key in settings.'
      }
    }

    const translatedText = await translator.translate(selectedText, target)

    console.log(`Translated text: ${translatedText.substring(0, 50)}...`)

    // Step 4: Copy to clipboard
    clipboard.writeText(translatedText)

    // Show success status near cursor
    showStatusNearCursor('✓ Copied to clipboard', 'success')

    return {
      success: true,
      originalText: selectedText,
      translatedText
    }
  } catch (error: any) {
    console.error('Translation error:', error)

    const errorMessage = error.message || 'Unknown error occurred'

    // Show error status near cursor
    showStatusNearCursor('Translation failed', 'error')

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Show a native macOS notification
 * @param title Notification title
 * @param body Notification body
 */
function showNotification(title: string, body: string): void {
  try {
    const notification = new Notification({
      title,
      body,
      silent: false
    })
    notification.show()
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}
