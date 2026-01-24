import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Language } from './language'

export class GeminiTranslator {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey)
    }
  }

  /**
   * Initialize the Gemini API client with an API key
   * @param apiKey The Gemini API key
   */
  initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  }

  /**
   * Check if the translator is initialized
   * @returns true if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.model !== null
  }

  /**
   * Translate text using Gemini API
   * @param text The text to translate
   * @param targetLanguage The target language
   * @returns The translated text
   * @throws Error if API call fails or translator is not initialized
   */
  async translate(text: string, targetLanguage: Language): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Gemini translator is not initialized. Please set an API key.')
    }

    const targetLangName = targetLanguage === 'japanese' ? 'Japanese' : 'English'

    const prompt = `You are a professional translator.
Translate the following text to ${targetLangName}.
Output only the translated text without any explanations or additional comments.

SOURCE:
${text}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const translatedText = response.text()

      // Remove any leading/trailing whitespace
      return translatedText.trim()
    } catch (error: any) {
      console.error('Gemini API error:', error)

      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.')
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Gemini API usage.')
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your internet connection.')
      } else {
        throw new Error(`Translation failed: ${error.message || 'Unknown error'}`)
      }
    }
  }
}

// Export a singleton instance
let translatorInstance: GeminiTranslator | null = null

/**
 * Get the singleton translator instance
 * @returns The translator instance
 */
export function getTranslator(): GeminiTranslator {
  if (!translatorInstance) {
    translatorInstance = new GeminiTranslator()
  }
  return translatorInstance
}

/**
 * Initialize the translator with an API key
 * @param apiKey The Gemini API key
 */
export function initializeTranslator(apiKey: string): void {
  const translator = getTranslator()
  translator.initialize(apiKey)
}
