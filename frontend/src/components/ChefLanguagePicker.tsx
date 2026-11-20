import { Languages } from 'lucide-react'
import { isLanguage, languageNames, useChefLanguage, useChefT, type Language } from '../i18n'

const options = Object.entries(languageNames) as [Language, string][]

const ChefLanguagePicker = () => {
    const { chefLanguage, setChefLanguage } = useChefLanguage()
    const t = useChefT()

    return (
        <label className="flex items-center gap-1.5 rounded-full bg-white/[0.06] py-1 pl-3 pr-1 text-grape-200 ring-1 ring-white/10">
            <Languages size={16} strokeWidth={2.4} aria-hidden="true" />
            <span className="sr-only">{t('nav.uiLanguage')}</span>
            <select
                value={chefLanguage}
                onChange={(e) => {
                    if (isLanguage(e.target.value)) setChefLanguage(e.target.value)
                }}
                className="rounded-full bg-transparent py-1 pl-1 pr-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sun-400/50"
            >
                {options.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                ))}
            </select>
        </label>
    )
}

export default ChefLanguagePicker
