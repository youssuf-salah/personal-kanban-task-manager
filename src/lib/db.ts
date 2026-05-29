import { getPrisma } from './prisma'
import type { Task, CreateTaskInput, UpdateTaskInput, Status } from '@/types'

function toTask(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    priority: t.priority.toLowerCase() as Task['priority'],
    difficulty: t.difficulty.toLowerCase() as Task['difficulty'],
    estimatedMinutes: t.estimatedMinutes,
    status: t.status.toLowerCase().replace(/_/g, '_') as Status,
    position: t.position,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

function toPrismaStatus(status: string) {
  return status.toUpperCase().replace(/-/g, '_')
}

export async function getAllTasks(): Promise<Task[]> {
  const prisma = await getPrisma()
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  })
  return tasks.map(toTask)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const prisma = await getPrisma()
  const status = toPrismaStatus(input.status || 'backlog')
  const result = await prisma.task.aggregate({
    where: { status },
    _max: { position: true },
  })
  const task = await prisma.task.create({
    data: {
      title: input.title,
      priority: (input.priority?.toUpperCase() || 'MEDIUM'),
      difficulty: (input.difficulty?.toUpperCase() || 'MEDIUM'),
      estimatedMinutes: input.estimatedMinutes || 30,
      status,
      position: (result._max.position ?? 0) + 1,
    },
  })
  return toTask(task)
}

export async function bulkCreateTasks(inputs: CreateTaskInput[]): Promise<Task[]> {
  const prisma = await getPrisma()
  const tasks = []
  for (const input of inputs) {
    const status = toPrismaStatus(input.status || 'backlog')
    const task = await prisma.task.create({
      data: {
        title: input.title,
        priority: (input.priority?.toUpperCase() || 'MEDIUM'),
        difficulty: (input.difficulty?.toUpperCase() || 'MEDIUM'),
        estimatedMinutes: input.estimatedMinutes || 30,
        status,
        position: 0,
      },
    })
    tasks.push(task)
  }

  const byStatus: Record<string, typeof tasks> = {}
  for (const t of tasks) {
    const s = t.status
    if (!byStatus[s]) byStatus[s] = []
    byStatus[s].push(t)
  }

  for (const [status, group] of Object.entries(byStatus)) {
    for (let i = 0; i < group.length; i++) {
      await prisma.task.update({
        where: { id: group[i].id },
        data: { position: i + 1 },
      })
    }
  }

  const all = await prisma.task.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  })
  return all.map(toTask)
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const prisma = await getPrisma()
  const data: any = {}
  if (input.title !== undefined) data.title = input.title
  if (input.priority !== undefined) data.priority = input.priority.toUpperCase()
  if (input.difficulty !== undefined) data.difficulty = input.difficulty.toUpperCase()
  if (input.estimatedMinutes !== undefined) data.estimatedMinutes = input.estimatedMinutes
  if (input.status !== undefined) data.status = toPrismaStatus(input.status)
  if (input.position !== undefined) data.position = input.position

  const task = await prisma.task.update({ where: { id }, data })
  return toTask(task)
}

export async function deleteTask(id: string): Promise<boolean> {
  const prisma = await getPrisma()
  try {
    await prisma.task.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

export async function normalizePositions(status: Status): Promise<void> {
  const prisma = await getPrisma()
  const tasks = await prisma.task.findMany({
    where: { status: toPrismaStatus(status) },
    orderBy: { position: 'asc' },
  })
  for (let i = 0; i < tasks.length; i++) {
    await prisma.task.update({
      where: { id: tasks[i].id },
      data: { position: (i + 1) * 1000 },
    })
  }
}
