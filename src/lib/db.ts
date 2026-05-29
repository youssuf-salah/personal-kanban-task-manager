import { getPrisma } from "./prisma"
import type { Task, CreateTaskInput, UpdateTaskInput, Status } from "@/types"
import { Priority as PrismaPriority, Difficulty as PrismaDifficulty, Status as PrismaStatus } from "@/generated/prisma/enums"

export { createTaskSchema, updateTaskSchema } from "./schemas"

function toPrismaPriority(value: string): typeof PrismaPriority[keyof typeof PrismaPriority] {
  return value.toUpperCase().replace(/-/g, "_") as typeof PrismaPriority[keyof typeof PrismaPriority]
}

function toPrismaDifficulty(value: string): typeof PrismaDifficulty[keyof typeof PrismaDifficulty] {
  return value.toUpperCase().replace(/-/g, "_") as typeof PrismaDifficulty[keyof typeof PrismaDifficulty]
}

function toPrismaStatus(value: string): typeof PrismaStatus[keyof typeof PrismaStatus] {
  return value.toUpperCase().replace(/-/g, "_") as typeof PrismaStatus[keyof typeof PrismaStatus]
}

function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    task: row.task as string,
    priority: (row.priority as string).toLowerCase() as Task["priority"],
    difficulty: (row.difficulty as string).toLowerCase() as Task["difficulty"],
    estimated_minutes: (row.estimatedMinutes ?? row.estimated_minutes) as number,
    status: (row.status as string).toLowerCase() as Status,
    created_at: ((row.createdAt ?? row.created_at) as Date).toISOString(),
    updated_at: ((row.updatedAt ?? row.updated_at) as Date).toISOString(),
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const prisma = await getPrisma()
  const rows = await prisma.task.findMany({
    orderBy: [{ createdAt: "desc" }],
  })
  return rows.map(toTask)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const prisma = await getPrisma()
  const row = await prisma.task.create({
    data: {
      task: input.task,
      priority: toPrismaPriority(input.priority ?? "medium"),
      difficulty: toPrismaDifficulty(input.difficulty ?? "medium"),
      estimatedMinutes: input.estimated_minutes ?? 30,
      status: input.status ? toPrismaStatus(input.status) : PrismaStatus.BACKLOG,
    },
  })
  return toTask(row)
}

export async function bulkCreateTasks(inputs: CreateTaskInput[]): Promise<Task[]> {
  const prisma = await getPrisma()
  const rows = await prisma.$transaction(
    inputs.map((item) =>
      prisma.task.create({
        data: {
          task: item.task,
          priority: toPrismaPriority(item.priority ?? "medium"),
          difficulty: toPrismaDifficulty(item.difficulty ?? "medium"),
          estimatedMinutes: item.estimated_minutes ?? 30,
          status: item.status ? toPrismaStatus(item.status) : PrismaStatus.BACKLOG,
        },
      })
    )
  )
  return rows.map(toTask)
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const prisma = await getPrisma()
  const data: Record<string, unknown> = {}
  if (input.task !== undefined) data.task = input.task
  if (input.priority !== undefined) data.priority = toPrismaPriority(input.priority)
  if (input.difficulty !== undefined) data.difficulty = toPrismaDifficulty(input.difficulty)
  if (input.estimated_minutes !== undefined) data.estimatedMinutes = input.estimated_minutes
  if (input.status !== undefined) data.status = toPrismaStatus(input.status)

  try {
    const row = await prisma.task.update({ where: { id }, data })
    return toTask(row)
  } catch {
    return null
  }
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
