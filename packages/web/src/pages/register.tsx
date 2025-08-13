import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Eye, EyeOff, Lock, Mail, Shield, User, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormError, InlineError } from "@/components/ui/error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

// Security: Strong password requirements
const registerSchema = z
	.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(50, "Username must be less than 50 characters")
			.regex(
				/^[a-zA-Z0-9_-]+$/,
				"Username can only contain letters, numbers, hyphens, and underscores",
			),
		email: z
			.string()
			.email("Please enter a valid email address")
			.min(1, "Email is required"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^A-Za-z0-9]/,
				"Password must contain at least one special character",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

type RegisterFormData = z.infer<typeof registerSchema>

// Security: Password strength checker
const checkPasswordStrength = (password: string) => {
	const checks = [
		{ label: "At least 8 characters", test: password.length >= 8 },
		{ label: "Contains uppercase letter", test: /[A-Z]/.test(password) },
		{ label: "Contains lowercase letter", test: /[a-z]/.test(password) },
		{ label: "Contains number", test: /[0-9]/.test(password) },
		{
			label: "Contains special character",
			test: /[^A-Za-z0-9]/.test(password),
		},
	]

	const score = checks.filter((check) => check.test).length
	return { checks, score }
}

export function RegisterPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const watchedPassword = watch("password")
	const passwordStrength = checkPasswordStrength(watchedPassword || "")

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true })
		}
	}, [isAuthenticated, navigate])

	// Security: Input sanitization
	const sanitizeInput = (value: string): string => {
		return value.replace(/[<>"'&]/g, "").trim()
	}

	const handleInputChange =
		(field: keyof RegisterFormData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const sanitized = sanitizeInput(e.target.value)
			setValue(field, sanitized)
			setError(null)
		}

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			// Security: Additional client-side validation
			if (passwordStrength.score < 5) {
				setError("Password does not meet security requirements")
				return
			}

			// Simulate registration API call (in real app, this would call the backend)
			await new Promise((resolve) => setTimeout(resolve, 2000))

			// For demo purposes, we'll show success and redirect to login
			navigate("/login", {
				state: {
					message:
						"Registration successful! Please log in with your new account.",
				},
			})
		} catch (error) {
			setError("Registration failed. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	const getPasswordStrengthColor = (score: number) => {
		if (score < 2) return "bg-red-500"
		if (score < 4) return "bg-yellow-500"
		return "bg-green-500"
	}

	const getPasswordStrengthText = (score: number) => {
		if (score < 2) return "Weak"
		if (score < 4) return "Medium"
		return "Strong"
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-md mx-auto">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<User className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-2xl">Create Account</CardTitle>
						<p className="text-muted-foreground">
							Sign up to start booking flights
						</p>
					</CardHeader>
					<CardContent>
						{/* Security Notice */}
						<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex items-center gap-2 text-blue-800">
								<Shield className="h-5 w-5" />
								<span className="font-semibold">Demo Registration</span>
							</div>
							<p className="text-sm text-blue-700 mt-1">
								This is a demo. No real account will be created.
							</p>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							{/* Username */}
							<div className="space-y-2">
								<Label htmlFor="username" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									Username
								</Label>
								<Input
									id="username"
									{...register("username")}
									onChange={handleInputChange("username")}
									placeholder="Choose a username"
									className={errors.username ? "border-destructive" : ""}
									autoComplete="username"
								/>
								{errors.username && (
									<InlineError
										message={errors.username.message || "Invalid username"}
									/>
								)}
							</div>

							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email" className="flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									{...register("email")}
									onChange={handleInputChange("email")}
									placeholder="Enter your email address"
									className={errors.email ? "border-destructive" : ""}
									autoComplete="email"
								/>
								{errors.email && (
									<InlineError
										message={errors.email.message || "Invalid email"}
									/>
								)}
							</div>

							{/* Password */}
							<div className="space-y-2">
								<Label htmlFor="password" className="flex items-center gap-2">
									<Lock className="h-4 w-4" />
									Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										{...register("password")}
										onChange={handleInputChange("password")}
										placeholder="Create a strong password"
										className={cn(
											"pr-10",
											errors.password ? "border-destructive" : "",
										)}
										autoComplete="new-password"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>

								{/* Password Strength Indicator */}
								{watchedPassword && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<div className="flex-1 bg-gray-200 rounded-full h-2">
												<div
													className={cn(
														"h-2 rounded-full transition-all",
														getPasswordStrengthColor(passwordStrength.score),
													)}
													style={{
														width: `${(passwordStrength.score / 5) * 100}%`,
													}}
												/>
											</div>
											<span className="text-sm font-medium">
												{getPasswordStrengthText(passwordStrength.score)}
											</span>
										</div>

										<div className="space-y-1">
											{passwordStrength.checks.map((check, index) => (
												<div
													key={index}
													className="flex items-center gap-2 text-xs"
												>
													{check.test ? (
														<Check className="h-3 w-3 text-green-500" />
													) : (
														<X className="h-3 w-3 text-red-500" />
													)}
													<span
														className={
															check.test ? "text-green-700" : "text-red-700"
														}
													>
														{check.label}
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								{errors.password && (
									<InlineError
										message={errors.password.message || "Invalid password"}
									/>
								)}
							</div>

							{/* Confirm Password */}
							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="flex items-center gap-2"
								>
									<Lock className="h-4 w-4" />
									Confirm Password
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										{...register("confirmPassword")}
										onChange={handleInputChange("confirmPassword")}
										placeholder="Confirm your password"
										className={cn(
											"pr-10",
											errors.confirmPassword ? "border-destructive" : "",
										)}
										autoComplete="new-password"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{errors.confirmPassword && (
									<InlineError
										message={
											errors.confirmPassword.message || "Passwords do not match"
										}
									/>
								)}
							</div>

							{/* Form Errors */}
							{Object.keys(errors).length > 0 && (
								<FormError
									errors={Object.values(errors).map(
										(error) => error?.message || "Invalid input",
									)}
								/>
							)}

							{/* API Error */}
							{error && <InlineError message={error} />}

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || passwordStrength.score < 5}
								size="lg"
							>
								{isLoading ? (
									<>
										<LoadingSpinner size="sm" className="mr-2" />
										Creating Account...
									</>
								) : (
									"Create Account"
								)}
							</Button>
						</form>

						{/* Footer */}
						<div className="mt-6 text-center text-sm text-muted-foreground">
							<p>
								Already have an account?{" "}
								<Link to="/login" className="text-primary hover:underline">
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
