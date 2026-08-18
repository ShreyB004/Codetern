import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DomainsPage from './pages/DomainsPage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import CertificationPage from './pages/CertificationPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/domains" element={<DomainsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/certification" element={<CertificationPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}