// Efek suara sintetis (Web Audio) — bel stasiun, pintu, kertas. Tanpa file mp3.
let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, t0: number, dur: number, gain = 0.2, type: OscillatorType = 'sine') {
  const a = ac()
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur)
}

export const sfx = {
  bellStart() {
    const t = ac().currentTime
    tone(880, t, 1.2, 0.25)
    tone(1320, t + 0.15, 1.0, 0.18)
  },
  bellEnd() {
    const t = ac().currentTime
    tone(1320, t, 0.9, 0.22)
    tone(880, t + 0.18, 0.8, 0.2)
  },
  doorOpen() {
    const t = ac().currentTime
    const a = ac()
    const osc = a.createOscillator()
    const g = a.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(70, t)
    osc.frequency.linearRampToValueAtTime(110, t + 0.5)
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    osc.connect(g).connect(a.destination)
    osc.start(t)
    osc.stop(t + 0.55)
  },
  doorLocked() {
    tone(140, ac().currentTime, 0.12, 0.25, 'square')
  },
  paperFlip() {
    const t = ac().currentTime
    const a = ac()
    const buf = a.createBuffer(1, a.sampleRate * 0.18, a.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = a.createBufferSource()
    const g = a.createGain()
    g.gain.value = 0.12
    src.buffer = buf
    src.connect(g).connect(a.destination)
    src.start(t)
  },
  click() {
    tone(1200, ac().currentTime, 0.05, 0.1, 'square')
  },
}
