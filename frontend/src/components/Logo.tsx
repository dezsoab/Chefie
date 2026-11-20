import { ChefHat } from 'lucide-react'

type Props = { size?: 'sm' | 'lg' }

const Logo = ({ size = 'sm' }: Props) => {
  const large = size === 'lg'
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex animate-float items-center justify-center bg-sun-400 text-grape-950 shadow-[0_4px_0_var(--color-sun-700)] ${large ? 'size-14 rounded-[20px]' : 'size-11 rounded-2xl'}`}
      >
        <ChefHat size={large ? 30 : 24} strokeWidth={2.2} />
      </span>
      <span className={`font-display font-bold tracking-tight text-white ${large ? 'text-4xl' : 'text-2xl'}`}>Chefie</span>
    </div>
  )
}

export default Logo
