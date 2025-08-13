import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()

	const toggleTheme = () => {
		if (theme === "light") {
			setTheme("dark")
		} else {
			setTheme("light")
		}
	}

	const getIcon = () => {
		if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />
		return <Moon className="h-[1.2rem] w-[1.2rem]" />
	}

	const getTitle = () => {
		if (theme === "light") return "Switch to dark mode"
		return "Switch to light mode"
	}

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			title={getTitle()}
		>
			{getIcon()}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
