import { NextRequest } from 'next/server'
import { updateTask, deleteTask, updateTaskSchema } from '@/lib/db'
import { z } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateTaskSchema.parse(body)
    const task = await updateTask(id, parsed)
    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }
    return Response.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error(`PATCH /api/tasks/${request.url.split('/').pop()} error:`, error)
    return Response.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteTask(id)
    if (!deleted) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks error:', error)
    return Response.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
