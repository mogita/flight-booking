import { ChevronDown, MapPin } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface City {
	code: string
	name: string
	city: string
}

interface CitySelectorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	cities: City[]
	className?: string
	error?: boolean
	id?: string
}

export function CitySelector({
	value,
	onChange,
	placeholder = "Select city",
	cities,
	className,
	error = false,
	id,
}: CitySelectorProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Filter cities based on search term
	const filteredCities = cities.filter(
		(city) =>
			city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
			city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			city.code.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setSearchTerm(newValue)
		onChange(newValue)
		setIsOpen(true)
		setHighlightedIndex(-1)
	}

	// Handle city selection
	const handleCitySelect = (city: City) => {
		onChange(city.name)
		setSearchTerm("")
		setIsOpen(false)
		setHighlightedIndex(-1)
	}

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				setIsOpen(true)
				return
			}
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault()
				setHighlightedIndex((prev) =>
					prev < filteredCities.length - 1 ? prev + 1 : 0,
				)
				break
			case "ArrowUp":
				e.preventDefault()
				setHighlightedIndex((prev) =>
					prev > 0 ? prev - 1 : filteredCities.length - 1,
				)
				break
			case "Enter":
				e.preventDefault()
				if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
					handleCitySelect(filteredCities[highlightedIndex])
				}
				break
			case "Escape":
				setIsOpen(false)
				setHighlightedIndex(-1)
				inputRef.current?.blur()
				break
		}
	}

	// Handle input focus
	const handleFocus = () => {
		setIsOpen(true)
	}

	// Handle click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
				setHighlightedIndex(-1)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	// Get display value
	const displayValue = value || searchTerm

	return (
		<div className={cn("relative", className)}>
			<div className="relative">
				<Input
					ref={inputRef}
					id={id}
					value={displayValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					placeholder={placeholder}
					className={cn("pr-8", error && "border-destructive")}
				/>
				<ChevronDown
					className={cn(
						"absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
						isOpen && "rotate-180",
					)}
				/>
			</div>

			{isOpen && (
				<div
					ref={dropdownRef}
					className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
				>
					{filteredCities.length > 0 ? (
						filteredCities.map((city, index) => (
							<div
								key={city.code}
								className={cn(
									"flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors",
									index === highlightedIndex && "bg-muted",
								)}
								onClick={() => handleCitySelect(city)}
								onMouseEnter={() => setHighlightedIndex(index)}
							>
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<div className="flex-1">
									<div className="font-medium">{city.city}</div>
									<div className="text-sm text-muted-foreground">
										{city.name}
									</div>
								</div>
							</div>
						))
					) : (
						<div className="px-3 py-2 text-sm text-muted-foreground">
							No cities found
						</div>
					)}
				</div>
			)}
		</div>
	)
}
