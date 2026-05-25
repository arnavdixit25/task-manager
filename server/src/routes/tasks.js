const express = require('express')
const router = express.Router()

const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController')

const { addComment, deleteComment } = require('../controllers/commentController')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.get('/', getTasks)
router.post('/', createTask)
router.get('/:id', getTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)
router.patch('/:id/status', updateTaskStatus)
router.post('/:id/comments', addComment)
router.delete('/:taskId/comments/:commentId', deleteComment)

module.exports = router