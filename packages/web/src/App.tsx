import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/use-theme'
import { AuthProvider } from '@/hooks/use-auth'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="flight-booking-ui-theme">
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bookings" element={
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">My Bookings</h1>
                  <p className="text-muted-foreground mt-2">Coming soon...</p>
                </div>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
