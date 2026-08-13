import { ToastProvider } from './ToastContext.jsx'
import { SeatsProvider } from './SeatsContext.jsx'
import { AppProvider } from './AppContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { LoginModalProvider } from '../components/ui/LoginModal.jsx'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <SeatsProvider>
            <LoginModalProvider>{children}</LoginModalProvider>
          </SeatsProvider>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}