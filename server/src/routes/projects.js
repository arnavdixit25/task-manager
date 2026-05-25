const express = require('express')
const router = express.Router()

const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
} = require('../controllers/projectController')

const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.get('/', getProjects)
router.post('/', createProject)
router.get('/:id', getProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)
router.post('/:id/members', addMember)

module.exports = router