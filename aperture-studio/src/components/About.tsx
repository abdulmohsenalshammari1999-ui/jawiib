import { useEffect, useRef } from 'react'
import { Plate } from './Plate'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { revealUp } from '../lib/reveal'

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageColRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) revealUp(Array.from(textRef.current.children), { stagger: 0.1 })

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top+=88',
          end: 'bottom bottom',
          pin: imageColRef.current,
          pinSpacing: false,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="studio" ref={sectionRef} className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <div className="grid gap-14 md:grid-cols-2 md:gap-20">
        <div ref={imageColRef} className="md:self-start">
          <Plate tone="dusk" seed={7} className="aspect-[4/5] w-full" caption="Naomi Cole, Founder" />
        </div>

        <div ref={textRef} className="flex flex-col gap-7">
          <span className="eyebrow reveal">The Studio</span>
          <h2 className="font-display reveal text-4xl leading-[1.08] text-ink md:text-5xl">
            Photography, treated
            <br />
            like a craft — not content.
          </h2>
          <p className="reveal max-w-md font-sans text-[0.95rem] leading-relaxed text-ink-soft">
            Aperture was founded by Naomi Cole in 2014 on a simple premise:
            the best photographs disappear into the moment they hold. No
            forced direction, no over-processed colour — just patient
            observation and a very good eye for light.
          </p>
          <p className="reveal max-w-md font-sans text-[0.95rem] leading-relaxed text-ink-soft">
            Today the studio works with a small number of couples, families,
            and brands each year, based between Amalfi and London.
          </p>
          <blockquote className="reveal font-display max-w-md text-xl leading-snug text-ink italic">
            "We don't chase perfect. We chase true — and true is always more
            beautiful."
          </blockquote>
          <span className="reveal font-sans text-[0.72rem] tracking-[0.16em] text-ink-faint uppercase">
            — Naomi Cole, Founder &amp; Lead Photographer
          </span>
        </div>
      </div>
    </section>
  )
}
