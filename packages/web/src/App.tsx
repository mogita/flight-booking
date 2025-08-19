import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { Layout } from "@/components/layout/layout"
import { AuthProvider } from "@/hooks/use-auth"

import { ThemeProvider } from "@/hooks/use-theme"
import { BookingPage } from "@/pages/booking"
import { BookingsPage } from "@/pages/bookings"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"

function App() {
	return (
		<ThemeProvider defaultTheme="light" storageKey="flight-booking-ui-theme">
			<Router>
				<AuthProvider>
					<Layout>
						<Routes>
							<Route path="/" element={<HomePage />} />

							<Route path="/book" element={<BookingPage />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/register" element={<RegisterPage />} />
							<Route path="/bookings" element={<BookingsPage />} />
						</Routes>
					</Layout>
				</AuthProvider>
			</Router>
		</ThemeProvider>
	)
}

export default App
