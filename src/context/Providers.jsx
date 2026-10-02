import { ThemeProvider } from './ThemeContext.jsx'
import { ToastProvider } from './ToastContext.jsx'
import { AnalyticsProvider } from './AnalyticsContext.jsx'
import { AuthProvider } from './AuthContext.jsx'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}