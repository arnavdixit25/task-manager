const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// GET /api/dashboard
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get all project IDs this user belongs to
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    })

    const projectIds = memberships.map((m) => m.projectId)

    // Total projects
    const totalProjects = projectIds.length

    // Total tasks across all user's projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } },
    })

    // Completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
      },
    })

    // Overdue tasks (dueDate in the past and not DONE)
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    })

    // Tasks by status
    const [todo, inProgress, inReview, done] = await Promise.all([
      prisma.task.count({
        where: { projectId: { in: projectIds }, status: 'TODO' },
      }),
      prisma.task.count({
        where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' },
      }),
      prisma.task.count({
        where: { projectId: { in: projectIds }, status: 'IN_REVIEW' },
      }),
      prisma.task.count({
        where: { projectId: { in: projectIds }, status: 'DONE' },
      }),
    ])

    // Recent tasks (last 5)
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Active projects (last 4 with task counts)
    const activeProjects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus: {
        TODO: todo,
        IN_PROGRESS: inProgress,
        IN_REVIEW: inReview,
        DONE: done,
      },
      recentTasks,
      activeProjects,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats }