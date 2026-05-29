import { NextRequest } from 'next/server'
import { getAllTasks, createTask, bulkCreateTasks, createTaskSchema, bulkImportSchema } from '@/lib/db'
import { z } from 'zod'

export async function GET() {
  try {
    const tasks = await getAllTasks()
    return Response.json(tasks)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (Array.isArray(body)) {
      const parsed = bulkImportSchema.parse(body)
      const tasks = await bulkCreateTasks(parsed)
      return Response.json(tasks, { status: 201 })
    }

    const parsed = createTaskSchema.parse(body)
    const task = await createTask(parsed)
    return Response.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return Response.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
