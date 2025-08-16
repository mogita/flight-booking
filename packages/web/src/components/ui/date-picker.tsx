import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
	value?: Date
	onChange?: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	minDate?: Date
	maxDate?: Date
	id?: string
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
	(
		{
			value,
			onChange,
			placeholder = "Pick a date",
			disabled = false,
			className,
			minDate,
			maxDate,
			...props
		},
		ref,
	) => {
		const [inputValue, setInputValue] = React.useState(
			value ? format(value, "yyyy-MM-dd") : "",
		)

		React.useEffect(() => {
			if (value) {
				setInputValue(format(value, "yyyy-MM-dd"))
			} else {
				setInputValue("")
			}
		}, [value])

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const dateValue = e.target.value
			setInputValue(dateValue)

			if (dateValue) {
				const date = new Date(dateValue + "T00:00:00") // Add time to avoid timezone issues
				if (!Number.isNaN(date.getTime())) {
					// Check date constraints
					if (minDate && date < minDate) return
					if (maxDate && date > maxDate) return

					console.log("📅 DatePicker onChange triggered with date:", date)
					onChange?.(date)
				}
			} else {
				onChange?.(undefined)
			}
		}

		const formatMinDate = minDate ? format(minDate, "yyyy-MM-dd") : undefined
		const formatMaxDate = maxDate ? format(maxDate, "yyyy-MM-dd") : undefined

		return (
			<div className={cn("relative", className)}>
				<Input
					ref={ref}
					type="date"
					value={inputValue}
					onChange={handleInputChange}
					disabled={disabled}
					min={formatMinDate}
					max={formatMaxDate}
					className={cn("pl-10", !inputValue && "text-muted-foreground")}
					{...props}
				/>
				<CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
			</div>
		)
	},
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
