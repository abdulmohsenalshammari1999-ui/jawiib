import { useEffect, useRef, useState } from 'react'
import { IrisMark } from './IrisMark'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#studio', label: 'Studio' },
  { href: '#journal', label: 'Testimonials' },
]

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const marker = useRef(0)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > marker.current + 40)
    marker.current = window.innerHeight * 0.7
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        solid ? 'bg-paper/90 backdrop-blur-md border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className="flex items-center gap-2.5 font-display text-lg tracking-[0.08em] text-ink">
          <IrisMark className="h-5 w-5 text-accent" />
          HALIDE
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-[0.72rem] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#enquire"
            className="border border-ink px-5 py-2 font-sans text-[0.72rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper"
          >
            Enquire
          </a>
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-6 bg-ink" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-paper px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-sans text-sm tracking-[0.12em] text-ink-soft uppercase"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#enquire"
              onClick={() => setOpen(false)}
              className="font-sans text-sm tracking-[0.12em] text-ink uppercase"
            >
              Enquire →
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
