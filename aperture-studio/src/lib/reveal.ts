import { gsap, ScrollTrigger } from './gsap'

type Targets = string | Element | Element[] | NodeListOf<Element> | HTMLCollection | null

export function revealUp(targets: Targets, opts: { stagger?: number; start?: string } = {}) {
  if (!targets) return
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 46, clipPath: 'inset(18% 0 0 0)' },
    {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.1,
      ease: 'power3.out',
      stagger: opts.stagger ?? 0,
      scrollTrigger: {
        trigger: targets as Element,
        start: opts.start ?? 'top 85%',
        once: true,
      },
    },
  )
}

export { gsap, ScrollTrigger }
