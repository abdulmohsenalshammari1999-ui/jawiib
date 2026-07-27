import { useLenis } from './lib/useLenis'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Portfolio } from './components/Portfolio'
import { Services } from './components/Services'
import { About } from './components/About'
import { Testimonials } from './components/Testimonials'
import { Booking } from './components/Booking'
import { Footer } from './components/Footer'

export default function App() {
  useLenis()

  return (
    <div className="bg-paper">
      <Nav />
      <main>
        <Hero />
        <Portfolio />
        <Services />
        <About />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
    </div>
  )
}
