const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { generateToken } = require('../utils/jwt')
const { AppError } = require('../utils/errors')

const prisma = new PrismaClient()

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MEMBER',
      },
    })

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Return token + user without password
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      token,
      user: userWithoutPassword,
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401)
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Return token + user without password
    const { password: _, ...userWithoutPassword } = user

    res.json({
      token,
      user: userWithoutPassword,
    })
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const { password: _, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword })
  } catch (err) {
    next(err)
  }
}

module.exports = { signup, login, getMe }