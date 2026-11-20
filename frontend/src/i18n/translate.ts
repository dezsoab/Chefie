import { en, type MessageKey, type Messages } from './en'
import { de } from './de'
import { hu } from './hu'

export const languageNames = { en: 'English', de: 'Deutsch', hu: 'Magyar' } as const

export type Language = keyof typeof languageNames

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

const dictionaries: Record<Language, Messages> = { en, de, hu }

export const isLanguage = (value: unknown): value is Language =>
    typeof value === 'string' && Object.hasOwn(dictionaries, value)

export const isMessageKey = (value: string): value is MessageKey => Object.hasOwn(en, value)

export const createTranslate = (language: Language): Translate => {
    const dictionary = dictionaries[language]
    return (key, vars) => {
        let text = dictionary[key] ?? en[key]
        if (vars) {
            for (const [name, replacement] of Object.entries(vars)) {
                text = text.replaceAll(`{${name}}`, String(replacement))
            }
        }
        return text
    }
}

let activeTranslate: Translate = createTranslate('en')

export const setActiveTranslate = (t: Translate) => {
    activeTranslate = t
}

export const translate: Translate = (key, vars) => activeTranslate(key, vars)
