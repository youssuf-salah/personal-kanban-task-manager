'use client'

import { useEffect, useCallback, useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useBoardStore } from '@/store/use-board-store'
import type { Task, Status, Priority, Difficulty } from '@/types'
import { COLUMNS } from '@/types'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { KanbanNavbar } from './kanban-navbar'
import { TaskDialog } from './task-dialog'
import { BulkImportDialog } from './bulk-import-dialog'
import { Search } from 'lucide-react'
import { sortByPriority, filterTasks } from '@/lib/utils'

export function KanbanBoard() {
  const tasks = useBoardStore((s) => s.tasks)
  const isLoading = useBoardStore((s) => s.isLoading)
  const fetchTasks = useBoardStore((s) => s.fetchTasks)
  const createTask = useBoardStore((s) => s.createTask)
  const updateTask = useBoardStore((s) => s.updateTask)
  const deleteTask = useBoardStore((s) => s.deleteTask)
  const moveTask = useBoardStore((s) => s.moveTask)

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [createStatus, setCreateStatus] = useState<Status | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredTasks = useMemo(
    () => filterTasks(tasks, search),
    [tasks, search]
  )

  const columns = useMemo(
    () =>
      COLUMNS.map((status) => ({
        status,
        tasks: sortByPriority(
          filteredTasks.filter((t) => t.status === status)
        ),
      })),
    [filteredTasks]
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
      if (COLUMNS.includes(overId as Status)) {
        const newStatus = overId as Status
        if (newStatus !== task.status) {
          moveTask(taskId, newStatus)
        }
      }
    },
    [tasks, moveTask, setActiveDragId]
  )

  const handleDragCancel = useCallback(
    () => {
      setActiveDragId(null)
    },
    [setActiveDragId]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id)
    },
    [deleteTask]
  )

  const handleCreate = useCallback(
    async (data: { task: string; priority: string; difficulty: string; estimated_minutes: number }) => {
      await createTask({
        task: data.task,
        priority: data.priority as Priority,
        difficulty: data.difficulty as Difficulty,
        estimated_minutes: data.estimated_minutes,
        status: createStatus ?? undefined,
      })
      setCreateStatus(null)
    },
    [createTask, createStatus]
  )

  const handleUpdate = useCallback(
    async (data: { task: string; priority: string; difficulty: string; estimated_minutes: number }) => {
      if (!editTask) return
      await updateTask(editTask.id, {
        task: data.task,
        priority: data.priority as Priority,
        difficulty: data.difficulty as Difficulty,
        estimated_minutes: data.estimated_minutes,
      })
      setEditTask(null)
    },
    [updateTask, editTask]
  )

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="size-1.5 animate-pulse rounded-full bg-zinc-500" />
          Loading...
        </div>
      </div>
    )
  }

  const hasResults = columns.some((c) => c.tasks.length > 0)

  return (
    <>
      <div className="flex h-full flex-col">
        <KanbanNavbar
          onNewTask={() => setCreateStatus('backlog')}
          onImport={() => setBulkOpen(true)}
          search={search}
          onSearchChange={setSearch}
          compact={compact}
          onCompactToggle={() => setCompact((v) => !v)}
        />

        <div className="flex-1 p-6 pt-4 scrollbar-thin">
          {!hasResults && search.trim() ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <Search className="size-8 text-zinc-600" />
              <p className="text-sm text-zinc-500">No tasks match &quot;{search}&quot;</p>
              <button
                onClick={() => setSearch('')}
                className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
              >
                Clear search
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="grid h-full grid-cols-2 gap-5 2xl:grid-cols-4">
                {columns.map(({ status, tasks: columnTasks }) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={columnTasks}
                    onEdit={setEditTask}
                    onDelete={handleDelete}
                    onAdd={setCreateStatus}
                    compact={compact}
                  />
                ))}
              </div>

              <DragOverlay
                dropAnimation={null}
                modifiers={[restrictToWindowEdges]}
                className="z-50"
              >
                {activeTask ? (
                  <div className="w-72 scale-105 shadow-2xl">
                    <KanbanCard
                      task={activeTask}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
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
      />
    </>
  )
}
