import { createApp } from "./app"
import { env } from "./config/env"
import { logger } from "./utils/logger"

async function startServer() {
	try {
		const app = createApp()

		const server = app.listen(env.PORT, () => {
			logger.info(`🚀 Server running on port ${env.PORT}`)
			logger.info(`📊 Environment: ${env.NODE_ENV}`)
			logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`)
		})

		// Graceful shutdown
		const gracefulShutdown = (signal: string) => {
			logger.info(`Received ${signal}. Shutting down gracefully...`)
			server.close(() => {
				logger.info("Server closed")
				process.exit(0)
			})
		}

		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
		process.on("SIGINT", () => gracefulShutdown("SIGINT"))
	} catch (error) {
		logger.error("Failed to start server:", error)
		process.exit(1)
	}
}

startServer()
