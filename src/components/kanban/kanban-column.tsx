'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Task, Status } from '@/types'
import { STATUS_LABELS } from '@/types'
import { KanbanCard } from './kanban-card'
import { Button } from '@/components/ui/button'

interface KanbanColumnProps {
  status: Status
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAdd: (status: Status) => void
}

export function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onAdd,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {STATUS_LABELS[status]}
          <span className="ml-2 text-zinc-600">{tasks.length}</span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed p-2 transition-colors ${
          isOver
            ? 'border-indigo-500/50 bg-indigo-500/10'
            : 'border-transparent bg-zinc-900/30'
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-zinc-600">No tasks</p>
          </div>
        )}
      </div>

      {status !== 'done' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 justify-start gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          onClick={() => onAdd(status)}
        >
          <Plus className="size-3.5" />
          Add task
        </Button>
      )}
    </div>
  )
}
