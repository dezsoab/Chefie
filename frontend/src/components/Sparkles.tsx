import { Sparkle } from 'lucide-react'

type SparkleSpot = { top: string; left: string; size: number; delay: number }

const defaultSpots: SparkleSpot[] = [
  { top: '8%', left: '6%', size: 14, delay: 0 },
  { top: '18%', left: '88%', size: 18, delay: 0.8 },
  { top: '42%', left: '94%', size: 10, delay: 1.6 },
  { top: '64%', left: '3%', size: 12, delay: 2.2 },
  { top: '4%', left: '62%', size: 10, delay: 1.2 },
  { top: '33%', left: '12%', size: 9, delay: 2.8 },
  { top: '52%', left: '82%', size: 15, delay: 0.4 },
  { top: '84%', left: '90%', size: 11, delay: 1.9 },
]

const Sparkles = ({ spots = defaultSpots }: { spots?: SparkleSpot[] }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {spots.map((spot, index) => (
      <Sparkle
        key={index}
        size={spot.size}
        className="absolute animate-twinkle fill-sun-200 text-sun-200"
        style={{ top: spot.top, left: spot.left, animationDelay: `${spot.delay}s` }}
      />
    ))}
  </div>
)

export default Sparkles
