const express = require('express')
const Joi = require('joi')
const router = express.Router()

const { signup, login, getMe } = require('../controllers/authController')
const { verifyToken } = require('../middleware/auth')
const validate = require('../middleware/validate')

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Routes
router.post('/signup', validate(signupSchema), signup)
router.post('/login', validate(loginSchema), login)
router.get('/me', verifyToken, getMe)

module.exports = router