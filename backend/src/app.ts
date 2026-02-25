import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { prisma } from './lib/prisma'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/requestLogger'
import { ProductRepository } from './repositories/product.repository'
import { CartRepository } from './repositories/cart.repository'
import { ReviewRepository } from './repositories/review.repository'
import { ProductService } from './services/product.service'
import { CartService } from './services/cart.service'
import { ReviewService } from './services/review.service'
import { ProductController } from './controllers/product.controller'
import { CartController } from './controllers/cart.controller'
import { ReviewController } from './controllers/review.controller'
import { createRootRouter } from './routers/index'

export const buildApp = (): express.Application => {
  const app = express()

  // Security
  app.use(helmet())
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
      credentials: true,
    }),
  )
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  // Logging
  app.use(httpLogger)
  app.use(morgan('dev'))

  // Body parsing
  app.use(express.json())

  // Dependency injection
  const productRepo = new ProductRepository(prisma)
  const cartRepo = new CartRepository(prisma)
  const reviewRepo = new ReviewRepository(prisma)

  const productService = new ProductService(productRepo)
  const cartService = new CartService(cartRepo, productRepo)
  const reviewService = new ReviewService(reviewRepo, productRepo)

  const productController = new ProductController(productService)
  const cartController = new CartController(cartService)
  const reviewController = new ReviewController(reviewService)

  // Routes
  app.use(createRootRouter({ product: productController, cart: cartController, review: reviewController }))

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}
