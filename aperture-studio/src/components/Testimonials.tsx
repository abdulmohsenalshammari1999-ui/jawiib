import { useEffect, useRef } from 'react'
import { revealUp } from '../lib/reveal'

const QUOTES = [
  {
    quote: 'She photographed our wedding like she’d known us for years. Two years later, the pictures still make us cry — the good kind.',
    name: 'Elena & Marcus',
    role: 'Wedding, Amalfi Coast',
  },
  {
    quote: 'The campaign images ran across three markets without a single retouch beyond colour grading. That almost never happens.',
    name: 'Freya Lindqvist',
    role: 'Creative Director, Lindqvist Studio',
  },
  {
    quote: 'Our family portraits usually feel stiff. These felt like a Sunday afternoon someone happened to catch on film.',
    name: 'The Adeyemi Family',
    role: 'Family Portraits',
  },
]

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) revealUp(Array.from(ref.current.children), { stagger: 0.12 })
  }, [])

  return (
    <section id="journal" className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
      <div className="mb-16 flex flex-col gap-4 md:max-w-xl">
        <span className="eyebrow reveal">In Their Words</span>
        <h2 className="font-display reveal text-4xl leading-[1.05] text-ink md:text-5xl">
          Kind words, kept honest.
        </h2>
      </div>

      <div ref={ref} className="grid gap-10 md:grid-cols-3 md:gap-8">
        {QUOTES.map((q) => (
          <figure key={q.name} className="reveal flex flex-col gap-6 border-t border-line pt-8">
            <blockquote className="font-display text-xl leading-snug text-ink italic">
              "{q.quote}"
            </blockquote>
            <figcaption className="flex flex-col gap-1">
              <span className="font-sans text-sm text-ink">{q.name}</span>
              <span className="font-sans text-[0.72rem] tracking-[0.1em] text-ink-faint uppercase">
                {q.role}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
