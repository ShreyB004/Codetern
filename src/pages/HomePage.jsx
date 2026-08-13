import { Page } from '../components/layout/Page.jsx'
import { Hero } from '../components/home/Hero.jsx'
import { MarqueeStrip } from '../components/home/MarqueeStrip.jsx'
import { MetricsBar } from '../components/home/MetricsBar.jsx'
import { DurationGrid } from '../components/home/DurationGrid.jsx'
import { RealWorkSection } from '../components/home/RealWorkSection.jsx'
import { Journey3D } from '../components/home/Journey3D.jsx'
import { ProgrammeShowcase } from '../components/home/ProgrammeShowcase.jsx'
import { Testimonials } from '../components/home/Testimonials.jsx'
import { CTABand } from '../components/home/CTABand.jsx'

export default function HomePage() {
  return (
    <Page>
      <Hero />
      <MarqueeStrip />
      <MetricsBar />
      <DurationGrid />
      <RealWorkSection />
      <Journey3D />
      <ProgrammeShowcase />
      <Testimonials />
      <CTABand />
    </Page>
  )
}