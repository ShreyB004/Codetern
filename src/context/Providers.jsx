import { ThemeProvider } from './ThemeContext.jsx'
import { ToastProvider } from './ToastContext.jsx'
import { AnalyticsProvider } from './AnalyticsContext.jsx'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}