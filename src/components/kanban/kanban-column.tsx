'use client'

import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Inbox, CircleDot, Loader, CheckCircle2 } from 'lucide-react'
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

const STATUS_ICONS: Record<Status, typeof Inbox> = {
  backlog: Inbox,
  todo: CircleDot,
  in_progress: Loader,
  done: CheckCircle2,
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onAdd,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const Icon = STATUS_ICONS[status]

  const itemIds = useMemo(() => tasks.map((t) => t.id), [tasks])

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-zinc-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {STATUS_LABELS[status]}
          </h2>
        </div>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-zinc-500 tabular-nums">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border p-2 transition-all scrollbar-thin ${
          isOver
            ? 'border-blue-500/40 bg-blue-500/[0.04] shadow-[0_0_24px_-8px_rgba(59,130,246,0.15)]'
            : 'border-white/[0.04] bg-white/[0.02]'
        }`}
      >
        <SortableContext
          items={itemIds}
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
}, (prev, next) => {
  if (prev.status !== next.status) return false
  if (prev.tasks.length !== next.tasks.length) return false
  return prev.tasks.every((t, i) => {
    const n = next.tasks[i]
    return t.id === n.id && t.task === n.task && t.priority === n.priority &&
      t.difficulty === n.difficulty && t.estimated_minutes === n.estimated_minutes
  })
})
