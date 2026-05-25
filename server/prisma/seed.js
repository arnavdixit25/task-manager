const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Clean existing data (order matters for FK constraints) ───
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // ─── Create Users ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@demo.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@demo.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  console.log('✅ Users created')

  // ─── Create Projects ──────────────────────────────────────────
  const websiteProject = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and better UX.',
      color: '#3B82F6',
      status: 'ACTIVE',
      ownerId: admin.id,
    },
  })

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'Build a cross-platform mobile app for iOS and Android.',
      color: '#8B5CF6',
      status: 'ACTIVE',
      ownerId: admin.id,
    },
  })

  console.log('✅ Projects created')

  // ─── Add Project Members ──────────────────────────────────────

  // Admin is OWNER of both projects
  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: websiteProject.id, role: 'OWNER' },
      { userId: admin.id, projectId: mobileProject.id,  role: 'OWNER' },

      // Alice is EDITOR on both
      { userId: alice.id, projectId: websiteProject.id, role: 'EDITOR' },
      { userId: alice.id, projectId: mobileProject.id,  role: 'EDITOR' },

      // Bob is VIEWER on both
      { userId: bob.id,   projectId: websiteProject.id, role: 'VIEWER' },
      { userId: bob.id,   projectId: mobileProject.id,  role: 'VIEWER' },
    ],
  })

  console.log('✅ Project members added')

  // ─── Create Tasks ─────────────────────────────────────────────

  // Website Redesign tasks (one per status column)
  const task1 = await prisma.task.create({
    data: {
      title: 'Design new homepage mockup',
      description: 'Create Figma mockups for the new homepage layout.',
      status: 'TODO',
      priority: 'HIGH',
      projectId: websiteProject.id,
      assigneeId: alice.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Set up Tailwind CSS framework',
      description: 'Install and configure Tailwind CSS with the new design tokens.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      projectId: websiteProject.id,
      assigneeId: admin.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Review navigation structure',
      description: 'Review and approve the new site navigation proposed by the design team.',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      projectId: websiteProject.id,
      assigneeId: bob.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    },
  })

  const task4 = await prisma.task.create({
    data: {
      title: 'Audit current website content',
      description: 'Go through all existing pages and document what needs to be updated.',
      status: 'DONE',
      priority: 'LOW',
      projectId: websiteProject.id,
      assigneeId: alice.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
    },
  })

  // Mobile App tasks
  const task5 = await prisma.task.create({
    data: {
      title: 'Define app architecture',
      description: 'Choose tech stack, folder structure, and state management approach.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      projectId: mobileProject.id,
      assigneeId: admin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  })

  const task6 = await prisma.task.create({
    data: {
      title: 'Design onboarding screens',
      description: 'Create user-friendly onboarding flow for new app users.',
      status: 'TODO',
      priority: 'HIGH',
      projectId: mobileProject.id,
      assigneeId: alice.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  })

  console.log('✅ Tasks created')

  // ─── Create Comments ──────────────────────────────────────────
  await prisma.comment.create({
    data: {
      content: 'I have started working on the Figma file. Should have a draft ready by tomorrow!',
      taskId: task1.id,
      authorId: alice.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Looks good so far. Make sure to follow the new brand guidelines document.',
      taskId: task1.id,
      authorId: admin.id,
    },
  })

  console.log('✅ Comments created')
  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('─────────────────────────────────')
  console.log('Demo accounts:')
  console.log('  admin@demo.com  / password123  (ADMIN)')
  console.log('  alice@demo.com  / password123  (MEMBER)')
  console.log('  bob@demo.com    / password123  (MEMBER)')
  console.log('─────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

