import { useEffect, useRef, useState } from 'react'
import { revealUp } from '../lib/reveal'

export function Booking() {
  const ref = useRef<HTMLDivElement>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (ref.current) revealUp(Array.from(ref.current.children), { stagger: 0.1 })
  }, [])

  return (
    <section id="enquire" className="bg-ink">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2 md:gap-24 md:px-10 md:py-36"
      >
        <div className="reveal flex flex-col gap-6">
          <span className="eyebrow text-paper/60">Enquire</span>
          <h2 className="font-display text-4xl leading-[1.06] text-paper md:text-5xl">
            Let's create something
            <br />
            <span className="italic text-accent-soft">timeless.</span>
          </h2>
          <p className="max-w-sm font-sans text-[0.95rem] leading-relaxed text-paper/70">
            Tell us about your day, your brand, or your family — we reply to
            every enquiry within two business days.
          </p>
          <div className="mt-6 flex flex-col gap-2 font-sans text-sm text-paper/70">
            <span>hello@aperture-studio.example</span>
            <span>+44 20 7946 0958</span>
            <span>Amalfi · London</span>
          </div>
        </div>

        <form
          className="reveal flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[0.68rem] tracking-[0.16em] text-paper/50 uppercase">Name</span>
            <input
              required
              type="text"
              className="border-b border-paper/25 bg-transparent py-2 font-sans text-paper outline-none placeholder:text-paper/30 focus:border-accent-soft"
              placeholder="Your full name"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[0.68rem] tracking-[0.16em] text-paper/50 uppercase">Email</span>
            <input
              required
              type="email"
              className="border-b border-paper/25 bg-transparent py-2 font-sans text-paper outline-none placeholder:text-paper/30 focus:border-accent-soft"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[0.68rem] tracking-[0.16em] text-paper/50 uppercase">
              What are we shooting?
            </span>
            <select className="border-b border-paper/25 bg-transparent py-2 font-sans text-paper outline-none focus:border-accent-soft">
              <option className="bg-ink">Wedding</option>
              <option className="bg-ink">Portrait</option>
              <option className="bg-ink">Editorial / Commercial</option>
              <option className="bg-ink">Something else</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[0.68rem] tracking-[0.16em] text-paper/50 uppercase">Message</span>
            <textarea
              rows={3}
              className="resize-none border-b border-paper/25 bg-transparent py-2 font-sans text-paper outline-none placeholder:text-paper/30 focus:border-accent-soft"
              placeholder="Date, location, a little about you"
            />
          </label>

          <button
            type="submit"
            className="mt-4 w-fit border border-paper px-7 py-3 font-sans text-[0.72rem] tracking-[0.18em] text-paper uppercase transition-colors hover:bg-paper hover:text-ink"
          >
            {sent ? 'Sent — thank you' : 'Send Enquiry'}
          </button>
        </form>
      </div>
    </section>
  )
}
