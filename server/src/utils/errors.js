class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

const globalErrorHandler = (err, req, res, next) => {
  console.error('ERROR:', err)

  // AppError (our own errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Email already exists' })
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' })
  }

  // JWT invalid
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  // Everything else
  return res.status(500).json({ message: 'Internal server error' })
}

module.exports = { AppError, globalErrorHandler }