import { ToastProvider } from './ToastContext.jsx'
import { SeatsProvider } from './SeatsContext.jsx'
import { AppProvider } from './AppContext.jsx'
import { LoginModalProvider } from '../components/ui/LoginModal.jsx'

export function Providers({ children }) {
  return (
    <ToastProvider>
      <AppProvider>
        <SeatsProvider>
          <LoginModalProvider>{children}</LoginModalProvider>
        </SeatsProvider>
      </AppProvider>
    </ToastProvider>
  )
}