import { useDroppable } from '@dnd-kit/core'
import type { LucideIcon } from 'lucide-react'
import type { OrderStatus } from '../api/orders'

type Tone = 'sun' | 'red'

type Props = { status: OrderStatus; label: string; icon: LucideIcon; tone: Tone }

const tones: Record<Tone, { idle: string; over: string }> = {
    sun: { idle: 'border-sun-400/50 text-sun-300', over: 'scale-[1.03] border-sun-400 bg-sun-400 text-grape-950' },
    red: { idle: 'border-red-400/50 text-red-300', over: 'scale-[1.03] border-red-400 bg-red-500 text-white' },
}

const DropZone = ({ status, label, icon: Icon, tone }: Props) => {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <div
            ref={setNodeRef}
            className={`flex h-24 flex-1 items-center justify-center gap-3 rounded-[28px] border-[3px] border-dashed font-display text-2xl font-semibold transition duration-200 ${isOver ? tones[tone].over : tones[tone].idle}`}
        >
            <Icon size={28} strokeWidth={2.5} />
            {label}
        </div>
    )
}

export default DropZone
