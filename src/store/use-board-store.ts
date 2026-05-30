'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import type { Task, CreateTaskInput, UpdateTaskInput, Status, Priority } from '@/types'

interface BoardState {
  tasks: Task[]
  isLoading: boolean
  error: string | null

  fetchTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, status: Status, priority?: Priority) => Promise<void>
  bulkImport: (inputs: CreateTaskInput[]) => Promise<{ created: number; failed: number }>
}

async function getErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.error || body.details?.[0]?.message || `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error(await getErrorMessage(res))
      const tasks = await res.json()
      set({ tasks, isLoading: false })
    } catch (err) {
      const msg = (err as Error).message
      set({ error: msg, isLoading: false })
      toast.error(msg)
    }
  },

  createTask: async (input) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await getErrorMessage(res))
    const task = await res.json()
    set((state) => ({ tasks: [...state.tasks, task] }))
    toast.success('Task created')
  },

  updateTask: async (id, input) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await getErrorMessage(res))
    const updated = await res.json()
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
    toast.success('Task updated')
  },

  deleteTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await getErrorMessage(res))
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
    toast.success(`"${task?.task ?? 'Task'}" deleted`)
  },

  moveTask: async (id, status, priority) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const oldStatus = task.status
    const oldPriority = task.priority

    const patch: Record<string, unknown> = { status }
    if (priority !== undefined) patch.priority = priority

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    }))

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })

    if (!res.ok) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: oldStatus, priority: oldPriority } : t
        ),
      }))
      const msg = await getErrorMessage(res)
      toast.error(msg)
    }
  },

  bulkImport: async (inputs) => {
    const res = await fetch('/api/tasks/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    })
    if (!res.ok) throw new Error(await getErrorMessage(res))
    const result = await res.json()
    set((state) => ({
      tasks: [...state.tasks, ...result.tasks],
      error: result.failed > 0 ? `${result.failed} task(s) failed validation` : null,
    }))
    toast.success(`Imported ${result.created} task(s)`)
    if (result.failed > 0) {
      toast.error(`${result.failed} task(s) failed validation`)
    }
    return result
  },
}))
