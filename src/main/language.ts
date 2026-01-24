export type Language = 'japanese' | 'english'
export type TranslationDirection = 'auto' | 'en-to-ja' | 'ja-to-en'

/**
 * Detect if text contains Japanese characters
 * @param text The text to analyze
 * @returns true if Japanese is detected, false otherwise
 */
export function containsJapanese(text: string): boolean {
  // Regex pattern for Japanese characters:
  // ぁ-ん: Hiragana
  // ァ-ン: Katakana
  // 一-龥: Common Kanji
  const japanesePattern = /[ぁ-んァ-ン一-龥]/
  return japanesePattern.test(text)
}

/**
 * Detect the language of the given text
 * @param text The text to analyze
 * @returns The detected language
 */
export function detectLanguage(text: string): Language {
  return containsJapanese(text) ? 'japanese' : 'english'
}

/**
 * Determine translation direction based on source text and user preference
 * @param text The source text
 * @param preference User's translation direction preference
 * @returns Object with source and target languages
 */
export function getTranslationDirection(
  text: string,
  preference: TranslationDirection = 'auto'
): { source: Language; target: Language } {
  // If user has a preference, use it
  if (preference === 'en-to-ja') {
    return { source: 'english', target: 'japanese' }
  }
  if (preference === 'ja-to-en') {
    return { source: 'japanese', target: 'english' }
  }

  // Auto-detect based on text content
  const detectedLanguage = detectLanguage(text)

  if (detectedLanguage === 'japanese') {
    return { source: 'japanese', target: 'english' }
  } else {
    return { source: 'english', target: 'japanese' }
  }
}

/**
 * Get human-readable language name
 * @param lang The language code
 * @returns The language name in English
 */
export function getLanguageName(lang: Language): string {
  return lang === 'japanese' ? 'Japanese' : 'English'
}
