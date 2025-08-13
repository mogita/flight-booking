import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
	title?: string
	message?: string
	onRetry?: () => void
	className?: string
}

export function ErrorState({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
	className,
}: ErrorStateProps) {
	return (
		<div className={cn("flex items-center justify-center p-8", className)}>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-6 w-6 text-destructive" />
					</div>
					<CardTitle className="text-lg">{title}</CardTitle>
					<CardDescription>{message}</CardDescription>
				</CardHeader>
				{onRetry && (
					<CardContent className="text-center">
						<Button onClick={onRetry} variant="outline" className="w-full">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					</CardContent>
				)}
			</Card>
		</div>
	)
}

interface InlineErrorProps {
	message: string
	className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
	return (
		<div
			className={cn(
				"flex items-center space-x-2 text-sm text-destructive",
				className,
			)}
		>
			<AlertCircle className="h-4 w-4" />
			<span>{message}</span>
		</div>
	)
}

interface FormErrorProps {
	errors: string[]
	className?: string
}

export function FormError({ errors, className }: FormErrorProps) {
	if (errors.length === 0) return null

	return (
		<div className={cn("space-y-1", className)}>
			{errors.map((error, index) => (
				<InlineError key={index} message={error} />
			))}
		</div>
	)
}

// Network error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
	return (
		<ErrorState
			title="Connection Error"
			message="Unable to connect to the server. Please check your internet connection and try again."
			onRetry={onRetry}
		/>
	)
}

// Not found component
export function NotFound({
	title = "Not Found",
	message = "The page or resource you are looking for could not be found.",
	onGoHome,
}: {
	title?: string
	message?: string
	onGoHome?: () => void
}) {
	return (
		<ErrorState
			title={title}
			message={message}
			onRetry={onGoHome ? () => onGoHome() : undefined}
		/>
	)
}
