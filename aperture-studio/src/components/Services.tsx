import { useEffect, useRef } from 'react'
import { revealUp } from '../lib/reveal'

const SERVICES = [
  {
    n: '01',
    title: 'Weddings',
    copy: 'Full-day coverage that favours honest moments over posed ones — quiet mornings, long tables, first dances.',
  },
  {
    n: '02',
    title: 'Portraits',
    copy: 'Individual and family sittings shaped around natural light, shot on location or in the studio.',
  },
  {
    n: '03',
    title: 'Editorial & Commercial',
    copy: 'Campaign, lookbook, and brand work for labels and publications who care about the frame as much as the product.',
  },
]

export function Services() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) revealUp(Array.from(ref.current.children), { stagger: 0.1 })
  }, [])

  return (
    <section id="services" className="border-y border-line bg-paper-deep">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-16 flex flex-col gap-4 md:max-w-xl">
          <span className="eyebrow reveal">Services</span>
          <h2 className="font-display reveal text-4xl leading-[1.05] text-ink md:text-5xl">
            Three ways to work together.
          </h2>
        </div>

        <div ref={ref} className="grid gap-0 border-t border-line md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.n}
              className="reveal flex flex-col gap-6 border-b border-line px-1 py-10 md:border-b-0 md:border-r md:px-8 md:py-2 md:pt-10 last:md:border-r-0"
            >
              <span className="font-display text-sm text-accent">{s.n}</span>
              <h3 className="font-display text-2xl text-ink">{s.title}</h3>
              <p className="max-w-xs font-sans text-[0.95rem] leading-relaxed text-ink-soft">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
