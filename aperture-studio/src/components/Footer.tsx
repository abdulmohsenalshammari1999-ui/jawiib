import { IrisMark } from './IrisMark'

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-paper/10 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <span className="flex items-center gap-2.5 font-display text-base tracking-[0.06em] text-paper/80">
          <IrisMark className="h-4 w-4 text-accent-soft" />
          HALIDE
        </span>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {['Instagram', 'Pinterest', 'Journal'].map((l) => (
            <a
              key={l}
              href="#"
              className="font-sans text-[0.7rem] tracking-[0.14em] text-paper/50 uppercase transition-colors hover:text-paper"
            >
              {l}
            </a>
          ))}
        </div>

        <span className="font-sans text-[0.7rem] tracking-[0.08em] text-paper/35">
          © {new Date().getFullYear()} Halide Studio. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
