import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
    </AuthProvider>
  )
}

export default App