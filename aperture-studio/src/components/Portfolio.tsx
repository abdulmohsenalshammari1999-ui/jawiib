import { useEffect, useRef } from 'react'
import { Plate } from './Plate'
import { revealUp } from '../lib/reveal'
import type { Tone } from '../lib/texture'

interface Tile {
  tone: Tone
  seed: number
  caption: string
  span: string
  aspect: string
}

const TILES: Tile[] = [
  { tone: 'clay', seed: 11, caption: '01 — Wedding, Amalfi', span: 'col-span-12 md:col-span-7', aspect: 'aspect-[4/5] md:aspect-[16/11]' },
  { tone: 'stone', seed: 22, caption: '02 — Editorial, Milan', span: 'col-span-6 md:col-span-5', aspect: 'aspect-[4/5]' },
  { tone: 'brass', seed: 33, caption: '03 — Portrait Study', span: 'col-span-6 md:col-span-4', aspect: 'aspect-[4/5]' },
  { tone: 'dusk', seed: 44, caption: '04 — Commercial, Studio', span: 'col-span-6 md:col-span-4', aspect: 'aspect-[4/5]' },
  { tone: 'sand', seed: 55, caption: '05 — Portrait, Natural Light', span: 'col-span-12 md:col-span-4', aspect: 'aspect-[4/5]' },
  { tone: 'clay', seed: 66, caption: '06 — Wedding, Provence', span: 'col-span-12', aspect: 'aspect-[4/5] md:aspect-[21/8]' },
]

export function Portfolio() {
  const headingRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (headingRef.current) revealUp(Array.from(headingRef.current.children))
    if (gridRef.current) revealUp(Array.from(gridRef.current.children), { stagger: 0.12 })
  }, [])

  return (
    <section id="work" className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
      <div ref={headingRef} className="mb-14 flex flex-col gap-4 md:mb-20 md:max-w-xl">
        <span className="eyebrow reveal">Selected Work</span>
        <h2 className="font-display reveal text-4xl leading-[1.05] text-ink md:text-6xl">
          A considered frame,
          <br />
          <span className="italic text-ink-soft">every single time.</span>
        </h2>
      </div>

      <div ref={gridRef} className="grid grid-cols-12 gap-4 md:gap-6">
        {TILES.map((tile) => (
          <Plate
            key={tile.caption}
            tone={tile.tone}
            seed={tile.seed}
            caption={tile.caption}
            interactive
            className={`reveal cursor-pointer ${tile.aspect} ${tile.span}`}
          />
        ))}
      </div>
    </section>
  )
}
