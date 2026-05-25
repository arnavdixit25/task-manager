const { verifyToken } = require('../utils/jwt')
const { AppError } = require('../utils/errors')

const verifyTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to do this', 403))
    }
    next()
  }
}

module.exports = { verifyToken: verifyTokenMiddleware, requireRole }