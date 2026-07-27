import * as THREE from 'three'
import { gsap } from './gsap'
import { drawPlate, type Tone } from './texture'

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uAspectFix;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - uMouse;
    centered.y *= uAspectFix;
    float dist = length(centered);
    float ripple = sin(dist * 26.0 - uTime * 3.2) * 0.5 + 0.5;
    float falloff = smoothstep(0.55, 0.0, dist);
    float strength = 0.028 * uHover * falloff * ripple;
    vec2 dir = normalize(centered + 0.0001);
    vec2 warpedUv = uv - dir * strength;

    vec3 color = texture2D(uTexture, warpedUv).rgb;
    float vignette = smoothstep(0.9, 0.15, dist * 1.05);
    gl_FragColor = vec4(color, 1.0);
  }
`

class RippleStage {
  private renderer: THREE.WebGLRenderer | null = null
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private mesh: THREE.Mesh | null = null
  private material: THREE.ShaderMaterial | null = null
  private container: HTMLDivElement | null = null
  private activeEl: HTMLElement | null = null
  private raf = 0
  private clock = new THREE.Clock()
  private hoverStrength = { value: 0 }
  private mouse = new THREE.Vector2(0.5, 0.5)

  private ensure() {
    if (this.renderer) return
    if (typeof window === 'undefined') return

    this.container = document.createElement('div')
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.pointerEvents = 'none'
    this.container.style.zIndex = '30'
    this.container.style.opacity = '0'
    this.container.style.borderRadius = 'inherit'
    this.container.style.overflow = 'hidden'
    document.body.appendChild(this.container)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTexture: { value: null },
        uMouse: { value: this.mouse },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uAspectFix: { value: 1 },
      },
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(this.mesh)

    this.loop()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.renderer?.dispose()
    this.container?.remove()
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (!this.renderer || !this.material) return
    this.material.uniforms.uTime.value = this.clock.getElapsedTime()
    this.material.uniforms.uHover.value = this.hoverStrength.value
    if (this.activeEl && this.hoverStrength.value > 0.001) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  activate(el: HTMLElement, tone: Tone, seed: number) {
    this.ensure()
    if (!this.renderer || !this.material || !this.container) return
    this.activeEl = el
    const rect = el.getBoundingClientRect()

    const texCanvas = document.createElement('canvas')
    texCanvas.width = 512
    texCanvas.height = Math.round((512 * rect.height) / rect.width)
    drawPlate(texCanvas, tone, seed)
    const texture = new THREE.CanvasTexture(texCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    this.material.uniforms.uTexture.value?.dispose()
    this.material.uniforms.uTexture.value = texture
    this.material.uniforms.uAspectFix.value = rect.width / rect.height

    this.container.style.width = `${rect.width}px`
    this.container.style.height = `${rect.height}px`
    this.container.style.transform = `translate(${rect.left}px, ${rect.top}px)`
    this.renderer.setSize(rect.width, rect.height, true)

    gsap.to(this.hoverStrength, { value: 1, duration: 0.6, ease: 'power2.out' })
    gsap.to(this.container, { opacity: 1, duration: 0.35, ease: 'power2.out' })
  }

  updatePointer(u: number, v: number) {
    this.mouse.set(u, 1 - v)
  }

  track(el: HTMLElement) {
    if (!this.container) return
    const rect = el.getBoundingClientRect()
    this.container.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  }

  deactivate() {
    if (!this.container) return
    gsap.to(this.hoverStrength, { value: 0, duration: 0.5, ease: 'power2.out' })
    gsap.to(this.container, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        this.activeEl = null
      },
    })
  }
}

export const rippleStage = new RippleStage()
