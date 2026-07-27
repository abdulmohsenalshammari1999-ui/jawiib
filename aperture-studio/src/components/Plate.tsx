import { useEffect, useRef } from 'react'
import { drawPlate, type Tone } from '../lib/texture'
import { rippleStage } from '../lib/rippleStage'
import { reticle } from '../lib/reticle'

interface PlateProps {
  tone: Tone
  seed: number
  className?: string
  interactive?: boolean
  caption?: string
}

export function Plate({ tone, seed, className = '', interactive = false, caption }: PlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      drawPlate(canvas, tone, seed)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [tone, seed])

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${interactive ? 'cursor-none' : ''} ${className}`}
      onPointerEnter={
        interactive
          ? (e) => {
              if (wrapRef.current) rippleStage.activate(wrapRef.current, tone, seed)
              reticle.show(e.clientX, e.clientY)
            }
          : undefined
      }
      onPointerMove={
        interactive
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              rippleStage.updatePointer(
                (e.clientX - rect.left) / rect.width,
                (e.clientY - rect.top) / rect.height,
              )
              reticle.move(e.clientX, e.clientY)
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? () => {
              rippleStage.deactivate()
              reticle.hide()
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {caption ? (
        <div className="pointer-events-none absolute bottom-4 left-4 font-sans text-[0.65rem] tracking-[0.16em] text-paper/80 uppercase">
          {caption}
        </div>
      ) : null}
    </div>
  )
}
