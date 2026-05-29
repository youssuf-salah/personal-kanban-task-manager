import { NextRequest } from 'next/server'
import { getAllTasks, createTask, bulkCreateTasks } from '@/lib/db'

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
      const tasks = await bulkCreateTasks(body)
      return Response.json(tasks, { status: 201 })
    }

    const task = await createTask(body)
    return Response.json(task, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
