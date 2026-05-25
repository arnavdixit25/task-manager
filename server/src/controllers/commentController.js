const { PrismaClient } = require('@prisma/client')
const { AppError } = require('../utils/errors')

const prisma = new PrismaClient()

// POST /api/tasks/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { id: taskId } = req.params
    const { content } = req.body

    if (!content || content.trim() === '') {
      throw new AppError('Comment content is required', 400)
    }

    // Check task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    res.status(201).json({ comment })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/tasks/:taskId/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params

    // Find comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    // Only author can delete
    if (comment.authorId !== req.user.id) {
      throw new AppError('You can only delete your own comments', 403)
    }

    await prisma.comment.delete({ where: { id: commentId } })

    res.json({ message: 'Comment deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { addComment, deleteComment }