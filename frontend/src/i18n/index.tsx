import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentEvent } from '../api/events'
import { createTranslate, isLanguage, setActiveTranslate, type Language, type Translate } from './translate'

export { languageNames, isLanguage, type Language, type Translate } from './translate'

const CHEF_LANGUAGE_KEY = 'chefie.chefLanguage'

const browserLanguage = (): Language => {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const candidate of candidates) {
        const code = candidate?.slice(0, 2).toLowerCase()
        if (isLanguage(code)) return code
    }
    return 'en'
}

const readChefLanguage = (): Language => {
    try {
        const stored = localStorage.getItem(CHEF_LANGUAGE_KEY)
        return isLanguage(stored) ? stored : browserLanguage()
    } catch {
        return browserLanguage()
    }
}

type Scope = { language: Language; t: Translate }

type ChefLanguage = { chefLanguage: Language; setChefLanguage: (language: Language) => void }

const ScopeContext = createContext<Scope | null>(null)

const ChefLanguageContext = createContext<ChefLanguage | null>(null)

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const { data: event } = useQuery({ queryKey: ['current-event'], queryFn: fetchCurrentEvent, refetchInterval: 30000 })
    const [chefLanguage, setChefLanguageState] = useState<Language>(readChefLanguage)
    const eventLanguage: Language = isLanguage(event?.language) ? event.language : chefLanguage

    const setChefLanguage = useCallback((language: Language) => {
        try {
            localStorage.setItem(CHEF_LANGUAGE_KEY, language)
        } catch {
            return setChefLanguageState(language)
        }
        setChefLanguageState(language)
    }, [])

    const guestScope = useMemo<Scope>(() => {
        const t = createTranslate(eventLanguage)
        setActiveTranslate(t)
        return { language: eventLanguage, t }
    }, [eventLanguage])

    useEffect(() => {
        document.documentElement.lang = guestScope.language
    }, [guestScope])

    const chefValue = useMemo(() => ({ chefLanguage, setChefLanguage }), [chefLanguage, setChefLanguage])

    return (
        <ChefLanguageContext.Provider value={chefValue}>
            <ScopeContext.Provider value={guestScope}>{children}</ScopeContext.Provider>
        </ChefLanguageContext.Provider>
    )
}

export const useChefLanguage = () => {
    const context = useContext(ChefLanguageContext)
    if (!context) throw new Error('useChefLanguage must be used inside I18nProvider')
    return context
}

export const ChefScope = ({ children }: { children: ReactNode }) => {
    const { chefLanguage } = useChefLanguage()
    const parent = useContext(ScopeContext)
    const scope = useMemo<Scope>(() => ({ language: chefLanguage, t: createTranslate(chefLanguage) }), [chefLanguage])

    useEffect(() => {
        setActiveTranslate(scope.t)
        document.documentElement.lang = scope.language
        return () => {
            if (!parent) return
            setActiveTranslate(parent.t)
            document.documentElement.lang = parent.language
        }
    }, [scope, parent])

    return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
}

const useScope = () => {
    const context = useContext(ScopeContext)
    if (!context) throw new Error('useT must be used inside I18nProvider')
    return context
}

export const useT = () => useScope().t

export const useLanguage = () => useScope().language

export const useChefT = () => {
    const { chefLanguage } = useChefLanguage()
    return useMemo(() => createTranslate(chefLanguage), [chefLanguage])
}
