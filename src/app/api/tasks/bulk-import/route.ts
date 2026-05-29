import { NextRequest } from 'next/server'
import { createTaskSchema, bulkCreateTasks } from '@/lib/db'
import { z } from 'zod'
import type { CreateTaskInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return Response.json({ error: 'Expected an array of task objects' }, { status: 400 })
    }

    const valid: CreateTaskInput[] = []
    const errors: Array<{ index: number; issues: z.ZodIssue[] }> = []

    for (const [index, item] of body.entries()) {
      const parsed = createTaskSchema.safeParse(item)
      if (parsed.success) {
        valid.push(parsed.data)
      } else {
        errors.push({ index, issues: parsed.error.issues })
      }
    }

    const tasks = valid.length > 0 ? await bulkCreateTasks(valid) : []

    return Response.json({ created: tasks.length, failed: errors.length, errors, tasks })
  } catch (error) {
    console.error('POST /api/tasks/bulk-import error:', error)
    return Response.json({ error: 'Failed to process bulk import' }, { status: 500 })
  }
}
