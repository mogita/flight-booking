import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/use-theme'
import { AuthProvider } from '@/hooks/use-auth'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'
import { DemoFlightsPage } from '@/pages/demo-flights'
import { BookingPage } from '@/pages/booking'
import { BookingsPage } from '@/pages/bookings'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="flight-booking-ui-theme">
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo-flights" element={<DemoFlightsPage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
