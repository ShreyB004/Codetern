import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './components/layout/Layout.jsx'
import { RequireAuth, RequireAdmin } from './context/AuthContext.jsx'
import { SkeletonPage } from './components/ui/Skeleton.jsx'
import HomePage from './pages/HomePage.jsx'

const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'))
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const JoinPage = lazy(() => import('./pages/JoinPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const LearnPage = lazy(() => import('./pages/LearnPage.jsx'))
const TasksPage = lazy(() => import('./pages/TasksPage.jsx'))
const AttendancePage = lazy(() => import('./pages/AttendancePage.jsx'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage.jsx'))
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function Fallback() {
  return <SkeletonPage rows={3} />
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/fields" element={<Navigate to="/courses" replace />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<JoinPage />} />

          {/* legacy redirects */}
          <Route path="/apply" element={<Navigate to="/join" replace />} />
          <Route path="/enroll" element={<Navigate to="/join" replace />} />
          <Route path="/proof" element={<Navigate to="/courses" replace />} />
          <Route path="/certification" element={<Navigate to="/courses" replace />} />

          {/* student: login required */}
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
          <Route path="/learn/:courseId" element={<RequireAuth><LearnPage /></RequireAuth>} />
          <Route path="/tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
          <Route path="/attendance" element={<RequireAuth><AttendancePage /></RequireAuth>} />
          <Route path="/reviews" element={<RequireAuth><ReviewsPage /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

          {/* admin only */}
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="/admin/:tab" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
