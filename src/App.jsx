import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { PublicLayout } from './components/layout/Layout.jsx'
import { useApp } from './context/AppContext.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DomainsPage from './pages/DomainsPage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import CertificationPage from './pages/CertificationPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

function StudentGate() {
  const { isAuthenticated, isAdmin } = useApp()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return <Outlet />
}

function AdminGate() {
  const { isAdmin } = useApp()
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

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

      <Route element={<StudentGate />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      <Route element={<AdminGate />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}