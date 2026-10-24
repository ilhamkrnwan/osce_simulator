// Efek suara sintetis (Web Audio) — bel stasiun, pintu, kertas + ambience.
// Mute global via setMuted(); ambience berusaha file pub/audio/ambience.mp3 (CC0),
// bila belum ada → degradasi ke ambience sintetis (hum klinis).
let ctx: AudioContext | null = null
let muted = false

export function setMuted(m: boolean) {
  muted = m
  if (m) stopAmbience()
}

export function isMuted() {
  return muted
}

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, t0: number, dur: number, gain = 0.2, type: OscillatorType = 'sine') {
  if (muted) return
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
    if (muted) return
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
  stepOk() {
    tone(1040, ac().currentTime, 0.12, 0.12, 'triangle')
  },
  stepWrong() {
    tone(180, ac().currentTime, 0.2, 0.2, 'square')
  },
  stepDone() {
    const t = ac().currentTime
    tone(880, t, 0.15, 0.14, 'triangle')
    tone(1320, t + 0.12, 0.25, 0.14, 'triangle')
  },
  paperFlip() {
    if (muted) return
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

// ===== ambience rumah sakit =====
// prioritas: file pub/audio/ambience.mp3 (CC0). Bila 404 / gagal decode → hum klinis sintetis.
export const AMBIENCE_URL = '/audio/ambience.mp3'

let ambienceNodes: { src:AudioBufferSourceNode | null, gain: GainNode, beepTimer: ReturnType<typeof setInterval> | null, url: string, synth: boolean } | null = null

async function tryLoadAmbienceFile(): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(AMBIENCE_URL)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return await ac().decodeAudioData(buf)
  } catch {
    return null
  }
}

// hum klinis sintetis: derau rendah + beep distant tiap ~8 s (fallback, tanpa file)
function startSynthAmbience() {
  const a = ac()
  const g = a.createGain()
  g.gain.value = 0.018
  const filter = a.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 220
  const buf = a.createBuffer(1, a.sampleRate * 3, a.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  const src = a.createBufferSource()
  src.buffer = buf
  src.loop = true
  src.connect(filter).connect(g).connect(a.destination)
  src.start()
  const beepTimer = setInterval(() => {
    if (!muted) {
      const t = ac().currentTime
      tone(1046, t, 0.08, 0.02, 'sine')
      tone(1046, t + 0.25, 0.08, 0.015, 'sine')
    }
  }, 8000)
  ambienceNodes = { src, gain: g, beepTimer, url: AMBIENCE_URL, synth: true }
}

async function startFileAmbience(buffer: AudioBuffer) {
  const a = ac()
  const g = a.createGain()
  g.gain.value = 0.14
  const src = a.createBufferSource()
  src.buffer = buffer
  src.loop = true
  src.connect(g).connect(a.destination)
  src.start()
  ambienceNodes = { src, gain: g, beepTimer: null, url: AMBIENCE_URL, synth: false }
}

export async function startAmbience() {
  if (muted || ambienceNodes) return
  const buffer = await tryLoadAmbienceFile()
  if (muted || ambienceNodes) return
  if (buffer) await startFileAmbience(buffer)
  else startSynthAmbience()
}

export function stopAmbience() {
  if (!ambienceNodes) return
  const { src, gain, beepTimer } = ambienceNodes
  if (beepTimer) clearInterval(beepTimer)
  try {
    gain.gain.setTargetAtTime(0, ac().currentTime, 0.4)
    setTimeout(() => src?.stop(), 900)
  } catch {
    src?.stop()
  }
  ambienceNodes = null
}
