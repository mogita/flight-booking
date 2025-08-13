import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg"
	className?: string
}

export function LoadingSpinner({
	size = "md",
	className,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	}

	return (
		<Loader2
			className={cn(
				"animate-spin text-muted-foreground",
				sizeClasses[size],
				className,
			)}
		/>
	)
}

interface LoadingStateProps {
	message?: string
	className?: string
}

export function LoadingState({
	message = "Loading...",
	className,
}: LoadingStateProps) {
	return (
		<div className={cn("flex items-center justify-center p-8", className)}>
			<div className="flex flex-col items-center space-y-4">
				<LoadingSpinner size="lg" />
				<p className="text-muted-foreground">{message}</p>
			</div>
		</div>
	)
}

interface SkeletonProps {
	className?: string
}

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

// Skeleton components for different content types
export function FlightCardSkeleton() {
	return (
		<div className="border rounded-lg p-6 space-y-4">
			<div className="flex justify-between items-start">
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
				<Skeleton className="h-6 w-20" />
			</div>
			<div className="flex justify-between items-center">
				<div className="space-y-1">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="space-y-1">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
			<div className="flex justify-between items-center">
				<Skeleton className="h-3 w-24" />
				<Skeleton className="h-9 w-24" />
			</div>
		</div>
	)
}

export function BookingCardSkeleton() {
	return (
		<div className="border rounded-lg p-6 space-y-4">
			<div className="flex justify-between items-start">
				<div className="space-y-2">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-3 w-32" />
				</div>
				<Skeleton className="h-4 w-24" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-3/4" />
			</div>
			<div className="flex justify-between items-center">
				<Skeleton className="h-3 w-20" />
				<div className="flex space-x-2">
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-16" />
				</div>
			</div>
		</div>
	)
}
