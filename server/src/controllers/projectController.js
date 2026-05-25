const { PrismaClient } = require('@prisma/client')
const { AppError } = require('../utils/errors')

const prisma = new PrismaClient()

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ projects })
  } catch (err) {
    next(err)
  }
}

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, color, status } = req.body

    if (!name) {
      throw new AppError('Project name is required', 400)
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        status: status || 'ACTIVE',
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'OWNER',
          },
        },
      },
    })

    res.status(201).json({ project })
  } catch (err) {
    next(err)
  }
}

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if user is a member or owner
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
        },
      },
    })

    if (!membership) {
      throw new AppError('Project not found or access denied', 404)
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    res.json({ project })
  } catch (err) {
    next(err)
  }
}

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, color, status } = req.body

    // Check membership and role
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
        },
      },
    })

    if (!membership) {
      throw new AppError('Project not found or access denied', 404)
    }

    if (!['OWNER', 'EDITOR'].includes(membership.role)) {
      throw new AppError('You do not have permission to update this project', 403)
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(status && { status }),
      },
    })

    res.json({ project })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params

    // Only OWNER can delete
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
        },
      },
    })

    if (!membership) {
      throw new AppError('Project not found or access denied', 404)
    }

    if (membership.role !== 'OWNER') {
      throw new AppError('Only the project owner can delete this project', 403)
    }

    await prisma.project.delete({ where: { id } })

    res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const { email, role } = req.body

    if (!email) {
      throw new AppError('Email is required', 400)
    }

    if (!['EDITOR', 'VIEWER'].includes(role)) {
      throw new AppError('Role must be EDITOR or VIEWER', 400)
    }

    // Only OWNER can add members
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
        },
      },
    })

    if (!membership || membership.role !== 'OWNER') {
      throw new AppError('Only the project owner can add members', 403)
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({ where: { email } })

    if (!userToAdd) {
      throw new AppError('User with that email not found', 404)
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    res.status(201).json({ member: newMember })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
}