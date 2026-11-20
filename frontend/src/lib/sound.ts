type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

let context: AudioContext | null = null

export function unlockAudio() {
  try {
    const Ctx = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
    if (!Ctx) return
    context ??= new Ctx()
    if (context.state === 'suspended') void context.resume()
  } catch {
    context = null
  }
}

export function playChime() {
  unlockAudio()
  const ctx = context
  if (!ctx) return
  try {
    const start = ctx.currentTime
    const notes = [659.25, 987.77, 1318.51]
    notes.forEach((frequency, index) => {
      const at = start + index * 0.14
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.7)
      oscillator.connect(gain).connect(ctx.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.75)
    })
  } catch {
    return
  }
}

export function vibrate(pattern: number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    return
  }
}
