export const formatDate = (date: string | Date): string => {
	const d = new Date(date)
	return d.toISOString().split("T")[0]
}

export const formatDateTime = (date: string | Date): string => {
	const d = new Date(date)
	return d.toLocaleString()
}

export const formatTime = (date: string | Date): string => {
	const d = new Date(date)
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export const isValidDate = (date: string): boolean => {
	const d = new Date(date)
	return d instanceof Date && !isNaN(d.getTime())
}

export const isFutureDate = (date: string): boolean => {
	const d = new Date(date)
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	return d >= today
}
