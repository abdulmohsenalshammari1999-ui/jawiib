export type Tone = 'sand' | 'clay' | 'stone' | 'dusk' | 'brass'

const TONES: Record<Tone, [string, string, string]> = {
  sand: ['#eee3d1', '#cdb894', '#a98f66'],
  clay: ['#d8b79a', '#b8865f', '#8a5c3a'],
  stone: ['#dcd7ca', '#b3ab99', '#8a8272'],
  dusk: ['#8f8879', '#5c554a', '#332e27'],
  brass: ['#d9b688', '#a97a41', '#6e4a20'],
}

// Deterministic pseudo-random so the same tile always renders the same grain.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function drawPlate(
  canvas: HTMLCanvasElement,
  tone: Tone,
  seed: number,
  angleDeg = 125,
) {
  const ctx = canvas.getContext('2d')!
  const { width: w, height: h } = canvas
  const [c0, c1, c2] = TONES[tone]

  const rad = (angleDeg * Math.PI) / 180
  const x0 = w / 2 - (Math.cos(rad) * w) / 2
  const y0 = h / 2 - (Math.sin(rad) * h) / 2
  const x1 = w / 2 + (Math.cos(rad) * w) / 2
  const y1 = h / 2 + (Math.sin(rad) * h) / 2

  const grad = ctx.createLinearGradient(x0, y0, x1, y1)
  grad.addColorStop(0, c0)
  grad.addColorStop(0.55, c1)
  grad.addColorStop(1, c2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Soft vignette
  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.16)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)

  // Grain
  const rand = mulberry32(seed)
  const grainCanvas = document.createElement('canvas')
  const gw = 160
  const gh = 160
  grainCanvas.width = gw
  grainCanvas.height = gh
  const gctx = grainCanvas.getContext('2d')!
  const imgData = gctx.createImageData(gw, gh)
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = rand() * 255
    imgData.data[i] = v
    imgData.data[i + 1] = v
    imgData.data[i + 2] = v
    imgData.data[i + 3] = 22
  }
  gctx.putImageData(imgData, 0, 0)
  ctx.globalCompositeOperation = 'overlay'
  ctx.drawImage(grainCanvas, 0, 0, gw, gh, 0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

export function plateDataUrl(tone: Tone, seed: number, w = 640, h = 800) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  drawPlate(canvas, tone, seed)
  return canvas.toDataURL('image/png')
}
