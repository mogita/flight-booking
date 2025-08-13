import { Header } from "./header"

interface LayoutProps {
	children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="relative flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<footer className="border-t py-6 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
						<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
							Built for Flight Booking Demo. Powered by React, Vite, and
							TailwindCSS.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
