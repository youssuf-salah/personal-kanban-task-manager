'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import type { Task, CreateTaskInput, UpdateTaskInput, Status } from '@/types'

interface BoardState {
  tasks: Task[]
  isLoading: boolean
  error: string | null

  fetchTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, status: Status) => Promise<void>
  bulkImport: (inputs: CreateTaskInput[]) => Promise<{ created: number; failed: number }>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('Failed to fetch')
      const tasks = await res.json()
      set({ tasks, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
      toast.error('Failed to load tasks')
    }
  },

  createTask: async (input) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('Failed to create')
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
    if (!res.ok) throw new Error('Failed to update')
    const updated = await res.json()
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
    toast.success('Task updated')
  },

  deleteTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
    toast.success(`"${task?.task ?? 'Task'}" deleted`)
  },

  moveTask: async (id, status) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const oldStatus = task.status
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }))

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: oldStatus } : t
        ),
      }))
      toast.error('Failed to move task')
    }
  },

  bulkImport: async (inputs) => {
    const res = await fetch('/api/tasks/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    })
    if (!res.ok) throw new Error('Failed to bulk import')
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
