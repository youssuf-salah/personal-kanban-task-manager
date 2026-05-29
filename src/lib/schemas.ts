import { z } from "zod"

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
