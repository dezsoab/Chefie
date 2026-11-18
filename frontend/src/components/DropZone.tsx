import { useDroppable } from '@dnd-kit/core'
import type { OrderStatus } from '../api/orders'

type Props = { status: OrderStatus; label: string; tone: string }

const DropZone = ({ status, label, tone }: Props) => {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <div
            ref={setNodeRef}
            className={`flex h-24 flex-1 items-center justify-center rounded-2xl border-4 border-dashed text-2xl font-bold transition ${isOver ? 'scale-105 border-transparent bg-current/20' : 'border-current/40'
                } ${tone}`}
        >
            {label}
        </div>
    )
}

export default DropZone