import { gsap } from './gsap'

const SIZE = 52

class Reticle {
  private el: HTMLDivElement | null = null
  private moveX: ((value: number) => void) | null = null
  private moveY: ((value: number) => void) | null = null

  private ensure() {
    if (this.el) return
    if (typeof window === 'undefined') return

    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = `${SIZE}px`
    el.style.height = `${SIZE}px`
    el.style.marginLeft = `${-SIZE / 2}px`
    el.style.marginTop = `${-SIZE / 2}px`
    el.style.pointerEvents = 'none'
    el.style.zIndex = '50'
    el.style.opacity = '0'
    el.style.mixBlendMode = 'difference'
    el.innerHTML = /* html */ `
      <svg viewBox="0 0 52 52" width="52" height="52">
        <g fill="none" stroke="#F4EADA" stroke-width="1.1">
          <path d="M2 14 V4 H12" />
          <path d="M40 4 H50 V14" />
          <path d="M50 38 V48 H40" />
          <path d="M12 48 H2 V38" />
          <path d="M26 22 V30 M22 26 H30" stroke-width="0.9" />
        </g>
      </svg>
    `
    document.body.appendChild(el)
    this.el = el
    this.moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    this.moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
  }

  show(x: number, y: number) {
    this.ensure()
    if (!this.el) return
    gsap.set(this.el, { x, y })
    gsap.to(this.el, { opacity: 1, duration: 0.25, ease: 'power2.out' })
  }

  move(x: number, y: number) {
    this.moveX?.(x)
    this.moveY?.(y)
  }

  hide() {
    if (!this.el) return
    gsap.to(this.el, { opacity: 0, duration: 0.25, ease: 'power2.out' })
  }
}

export const reticle = new Reticle()
