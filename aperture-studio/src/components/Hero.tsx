import { useEffect, useRef } from 'react'
import { AmbientField } from './AmbientField'
import { gsap } from '../lib/gsap'

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.3 },
      )

      gsap.to(fieldRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(headlineRef.current, {
        yPercent: 34,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={rootRef} className="relative h-svh min-h-[640px] w-full overflow-hidden bg-ink">
      <div ref={fieldRef} className="absolute inset-0 -top-[8%] h-[116%]">
        <AmbientField />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />

      <div
        ref={headlineRef}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-6 px-6 pb-16 md:px-10 md:pb-20"
      >
        <span className="eyebrow text-paper/70">Est. Editorial Photography Studio</span>
        <h1 className="font-display max-w-3xl text-[13vw] leading-[0.92] tracking-tight text-paper md:text-[6.4rem]">
          Halide
        </h1>
        <p className="max-w-md font-sans text-[0.95rem] leading-relaxed text-paper/80">
          Every photograph begins invisible — light held in silver, waiting.
          Weddings, portraits, and commercial work, developed with patience.
        </p>
      </div>

      <div className="absolute bottom-8 right-6 hidden flex-col items-center gap-3 text-paper/60 md:flex md:right-10">
        <span className="font-sans text-[0.62rem] tracking-[0.24em] uppercase [writing-mode:vertical-rl]">
          Scroll
        </span>
        <span className="h-14 w-px bg-paper/40" />
      </div>
    </section>
  )
}
