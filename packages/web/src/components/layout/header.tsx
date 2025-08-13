import { Plane } from "lucide-react"
import { useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
	const location = useLocation()
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<a className="mr-6 flex items-center space-x-2" href="/">
						<Plane className="h-6 w-6" />
						<span className="hidden font-bold sm:inline-block">
							Flight Booking
						</span>
					</a>
				</div>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<a
							className={`transition-colors hover:text-foreground/80 ${
								location.pathname === "/"
									? "text-foreground"
									: "text-foreground/60"
							}`}
							href="/"
						>
							Search Flights
						</a>
						<a
							className={`transition-colors hover:text-foreground/80 ${
								location.pathname === "/bookings"
									? "text-foreground"
									: "text-foreground/60"
							}`}
							href="/bookings"
						>
							My Bookings
						</a>
					</nav>
					<div className="flex items-center space-x-2">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	)
}
