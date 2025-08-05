import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/use-theme'
import { AuthProvider } from '@/hooks/use-auth'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'
import { DemoFlightsPage } from '@/pages/demo-flights'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="flight-booking-ui-theme">
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo-flights" element={<DemoFlightsPage />} />
              <Route path="/book" element={
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">Book Flight</h1>
                  <p className="text-muted-foreground mt-2">Booking page coming soon...</p>
                </div>
              } />
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
