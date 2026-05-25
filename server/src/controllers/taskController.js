const { PrismaClient } = require('@prisma/client')
const { AppError } = require('../utils/errors')

const prisma = new PrismaClient()

// GET /api/tasks?projectId=xxx&status=xxx
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status } = req.query

    if (!projectId) {
      throw new AppError('projectId query param is required', 400)
    }


    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(status && { status }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ tasks })
  } catch (err) {
    next(err)
  }
}

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      projectId,
    } = req.body

    if (!title) {
      throw new AppError('Task title is required', 400)
    }

    if (!projectId) {
      throw new AppError('projectId is required', 400)
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    res.status(201).json({ task })
  } catch (err) {
    next(err)
  }
}

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    res.json({ task })
  } catch (err) {
    next(err)
  }
}

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, dueDate, assigneeId } = req.body

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    res.json({ task })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.task.delete({ where: { id } })

    res.json({ message: 'Task deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

    if (!status || !validStatuses.includes(status)) {
      throw new AppError(
        'Valid status is required: TODO, IN_PROGRESS, IN_REVIEW, DONE',
        400
      )
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    })

    res.json({ task })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
}