// CanvasTexture generator: tulisan kertas, plang stasiun, layar — tanpa aset gambar
import * as THREE from 'three'

export function makeTextTexture(
  lines: string[],
  opts: {
    width?: number
    height?: number
    bg?: string
    color?: string
    fontSize?: number
    align?: 'center' | 'left'
    lineHeight?: number
    mono?: boolean
  } = {},
): THREE.CanvasTexture {
  const width = opts.width ?? 512
  const height = opts.height ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = opts.bg ?? '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = opts.color ?? '#111827'
  const fs = opts.fontSize ?? 40
  ctx.font = `${fs}px ${opts.mono ? '"JetBrains Mono", monospace' : '"Plus Jakarta Sans", system-ui, sans-serif'}`
  ctx.textAlign = opts.align ?? 'center'
  ctx.textBaseline = 'middle'
  const align = opts.align ?? 'center'
  const x = align === 'center' ? width / 2 : 16
  const lh = opts.lineHeight ?? fs * 1.35
  const startY = (height - lines.length * lh + lh) / 2
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lh))

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Plang ungu gantung dua sisi: STATION xx | xx
export function makeSignTexture(id: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 512, 160)
  grad.addColorStop(0, '#7c3aed')
  grad.addColorStop(1, '#a78bfa')
  ctx.fillStyle = grad
  ctx.roundRect(0, 0, 512, 160, 18)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`STATION ${id}`, 36, 80)
  ctx.font = 'bold 48px "JetBrains Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`${id} | ${id}`, 476, 80)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
