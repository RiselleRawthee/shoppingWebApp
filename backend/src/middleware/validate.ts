import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { ZodSchema } from 'zod'
import { ZodError } from 'zod'

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          message: 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
        return
      }
      next(error)
    }
  }
