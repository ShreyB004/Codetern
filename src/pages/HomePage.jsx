import { Page } from '../components/layout/Page.jsx'
import { Hero } from '../components/home/Hero.jsx'
import { MetricsBar } from '../components/home/MetricsBar.jsx'
import { DurationGrid } from '../components/home/DurationGrid.jsx'
import { RealWorkSection } from '../components/home/RealWorkSection.jsx'
import { ProgrammeShowcase } from '../components/home/ProgrammeShowcase.jsx'
import { Testimonials } from '../components/home/Testimonials.jsx'
import { CTABand } from '../components/home/CTABand.jsx'

export default function HomePage() {
  return (
    <Page>
      <Hero />
      <MetricsBar />
      <DurationGrid />
      <RealWorkSection />
      <ProgrammeShowcase />
      <Testimonials />
      <CTABand />
    </Page>
  )
}