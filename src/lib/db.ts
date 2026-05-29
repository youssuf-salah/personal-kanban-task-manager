import { z } from "zod"
import { getPrisma } from "./prisma"
import type { Task, CreateTaskInput, UpdateTaskInput, Status } from "@/types"

export const createTaskSchema = z.object({
  task: z.string().min(1, "Task is required").max(500),
  priority: z.enum(["critical", "high", "medium", "low"]).optional().default("medium"),
  difficulty: z.enum(["hard", "medium", "easy"]).optional().default("medium"),
  estimated_minutes: z.coerce.number().int().min(1).max(1440).optional().default(30),
  status: z.enum(["backlog", "todo", "in_progress", "done"]).optional(),
})

export const updateTaskSchema = z.object({
  task: z.string().min(1).max(500).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  difficulty: z.enum(["hard", "medium", "easy"]).optional(),
  estimated_minutes: z.coerce.number().int().min(1).max(1440).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done"]).optional(),
})

function toPrismaEnum(value: string) {
  return value.toUpperCase().replace(/-/g, "_")
}

function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    task: row.task as string,
    priority: (row.priority as string).toLowerCase() as Task["priority"],
    difficulty: (row.difficulty as string).toLowerCase() as Task["difficulty"],
    estimated_minutes: row.estimated_minutes as number,
    status: (row.status as string).toLowerCase() as Status,
    created_at: (row.created_at as Date).toISOString(),
    updated_at: (row.updated_at as Date).toISOString(),
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
      priority: toPrismaEnum(input.priority ?? "medium"),
      difficulty: toPrismaEnum(input.difficulty ?? "medium"),
      estimatedMinutes: input.estimated_minutes ?? 30,
      status: input.status ? toPrismaEnum(input.status) : "BACKLOG",
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
          priority: toPrismaEnum(item.priority ?? "medium"),
          difficulty: toPrismaEnum(item.difficulty ?? "medium"),
          estimatedMinutes: item.estimated_minutes ?? 30,
          status: item.status ? toPrismaEnum(item.status) : "BACKLOG",
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
  if (input.priority !== undefined) data.priority = toPrismaEnum(input.priority)
  if (input.difficulty !== undefined) data.difficulty = toPrismaEnum(input.difficulty)
  if (input.estimated_minutes !== undefined) data.estimatedMinutes = input.estimated_minutes
  if (input.status !== undefined) data.status = toPrismaEnum(input.status)

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
