import { Flame } from 'lucide-react'
import { useT } from '../i18n'
import Sparkles from './Sparkles'

const KitchenClosed = () => {
  const t = useT()
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-stage px-8 text-center">
      <Sparkles />
      <div className="relative animate-pop">
        <span className="mx-auto flex size-24 animate-float items-center justify-center rounded-[32px] bg-sun-400 text-grape-950 shadow-[0_8px_0_var(--color-sun-700),0_30px_60px_-20px_rgb(255_209_46/0.6)]">
          <Flame size={48} strokeWidth={2} />
        </span>
        <h1 className="mt-10 font-display text-5xl font-bold leading-tight text-puffy">{t('closed.title')}</h1>
        <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-grape-200">{t('closed.text')}</p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-grape-200 ring-1 ring-white/10">
          <span className="size-2 animate-pulse rounded-full bg-sun-400" />
          {t('closed.checking')}
        </div>
      </div>
    </div>
  )
}

export default KitchenClosed
