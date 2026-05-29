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

export const bulkImportSchema = z.array(createTaskSchema)

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
  const data = createTaskSchema.parse(input)
  const row = await prisma.task.create({
    data: {
      task: data.task,
      priority: toPrismaEnum(data.priority),
      difficulty: toPrismaEnum(data.difficulty),
      estimatedMinutes: data.estimated_minutes,
      status: data.status ? toPrismaEnum(data.status) : "BACKLOG",
    },
  })
  return toTask(row)
}

export async function bulkCreateTasks(inputs: CreateTaskInput[]): Promise<Task[]> {
  const prisma = await getPrisma()
  const items = bulkImportSchema.parse(inputs)
  const rows = await prisma.$transaction(
    items.map((item) =>
      prisma.task.create({
        data: {
          task: item.task,
          priority: toPrismaEnum(item.priority),
          difficulty: toPrismaEnum(item.difficulty),
          estimatedMinutes: item.estimated_minutes,
          status: item.status ? toPrismaEnum(item.status) : "BACKLOG",
        },
      })
    )
  )
  return rows.map(toTask)
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const prisma = await getPrisma()
  const parsed = updateTaskSchema.parse(input)
  const data: Record<string, unknown> = {}
  if (parsed.task !== undefined) data.task = parsed.task
  if (parsed.priority !== undefined) data.priority = toPrismaEnum(parsed.priority)
  if (parsed.difficulty !== undefined) data.difficulty = toPrismaEnum(parsed.difficulty)
  if (parsed.estimated_minutes !== undefined) data.estimatedMinutes = parsed.estimated_minutes
  if (parsed.status !== undefined) data.status = toPrismaEnum(parsed.status)

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
