import 'dotenv/config'
import { buildApp } from './app'
import { env } from './config/env'
import { prisma } from './lib/prisma'
import { logger } from './middleware/requestLogger'

const app = buildApp()

const server = app.listen(env.port, () => {
  logger.info(`ShopLite API running on http://localhost:${env.port}`)
  logger.info(`Swagger docs at http://localhost:${env.port}/api-docs`)
})

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — shutting down gracefully`)
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
