'use client'

import { useEffect, useCallback, useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Plus, Upload } from 'lucide-react'
import { useBoardStore } from '@/store/use-board-store'
import type { Task, Status } from '@/types'
import { COLUMNS } from '@/types'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { TaskDialog } from './task-dialog'
import { BulkImportDialog } from './bulk-import-dialog'
import { Button } from '@/components/ui/button'

export function KanbanBoard() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    activeDragId,
    setActiveDragId,
  } = useBoardStore()

  const [editTask, setEditTask] = useState<Task | null>(null)
  const [createStatus, setCreateStatus] = useState<Status | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const columns = useMemo(
    () =>
      COLUMNS.map((status) => ({
        status,
        tasks: tasks
          .filter((t) => t.status === status)
          .sort((a, b) => a.position - b.position),
      })),
    [tasks]
  )

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeDragId) ?? null,
    [tasks, activeDragId]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveDragId(String(event.active.id))
    },
    [setActiveDragId]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      const { active, over } = event
      if (!over) return

      const taskId = String(active.id)
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const overId = String(over.id)
      const isOverColumn = COLUMNS.includes(overId as Status)

      if (isOverColumn) {
        const newStatus = overId as Status
        if (newStatus === task.status) return
        const columnTasks = tasks
          .filter((t) => t.status === newStatus)
          .sort((a, b) => a.position - b.position)
        const newPos = columnTasks.length > 0 ? columnTasks[columnTasks.length - 1].position + 1000 : 1000
        moveTask(taskId, newStatus, newPos)
      } else {
        const overTask = tasks.find((t) => t.id === overId)
        if (!overTask) return
        const newStatus = overTask.status
        const columnTasks = tasks
          .filter((t) => t.status === newStatus && t.id !== taskId)
          .sort((a, b) => a.position - b.position)

        const overIndex = columnTasks.findIndex((t) => t.id === overId)
        let newPos: number
        if (overIndex === -1) {
          newPos = columnTasks.length > 0 ? columnTasks[columnTasks.length - 1].position + 1000 : 1000
        } else {
          const before = columnTasks[overIndex - 1]
          const after = columnTasks[overIndex]
          if (!before && after) {
            newPos = after.position / 2
          } else if (before && !after) {
            newPos = before.position + 1000
          } else if (before && after) {
            newPos = (before.position + after.position) / 2
          } else {
            newPos = 1000
          }
        }
        moveTask(taskId, newStatus, newPos)
      }
    },
    [tasks, moveTask, setActiveDragId]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id)
    },
    [deleteTask]
  )

  const handleCreate = useCallback(
    async (data: { title: string; priority: string; difficulty: string; estimatedMinutes: number }) => {
      await createTask({
        title: data.title,
        priority: data.priority as any,
        difficulty: data.difficulty as any,
        estimatedMinutes: data.estimatedMinutes,
        status: createStatus ?? undefined,
      })
      setCreateStatus(null)
    },
    [createTask, createStatus]
  )

  const handleUpdate = useCallback(
    async (data: { title: string; priority: string; difficulty: string; estimatedMinutes: number }) => {
      if (!editTask) return
      await updateTask(editTask.id, {
        title: data.title,
        priority: data.priority as any,
        difficulty: data.difficulty as any,
        estimatedMinutes: data.estimatedMinutes,
      })
      setEditTask(null)
    },
    [updateTask, editTask]
  )

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
          <h1 className="text-lg font-bold text-zinc-100">Task Board</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Upload className="size-3.5" />
              Import JSON
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateStatus('backlog')}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              New Task
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full gap-4">
              {columns.map(({ status, tasks: columnTasks }) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={columnTasks}
                  onEdit={setEditTask}
                  onDelete={handleDelete}
                  onAdd={setCreateStatus}
                />
              ))}
            </div>

            <DragOverlay modifiers={[restrictToWindowEdges]}>
              {activeTask ? (
                <div className="w-72 opacity-90">
                  <KanbanCard
                    task={activeTask}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <TaskDialog
        open={createStatus !== null}
        onOpenChange={(open) => {
          if (!open) setCreateStatus(null)
        }}
        onSubmit={handleCreate}
        defaultStatus={createStatus ?? undefined}
      />

      <TaskDialog
        open={editTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditTask(null)
        }}
        onSubmit={handleUpdate}
        task={editTask ?? undefined}
      />

      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onImport={(tasks) => {
          useBoardStore.getState().bulkImport(tasks)
        }}
      />
    </>
  )
}
