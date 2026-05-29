'use client'

import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Clock } from 'lucide-react'
import type { Task } from '@/types'
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export const KanbanCard = memo(function KanbanCard({
  task,
  onEdit,
  onDelete,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-sm shadow-sm transition-colors hover:border-zinc-700"
    >
      <button
        className="mt-0.5 cursor-grab touch-none text-zinc-600 hover:text-zinc-300"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1" onClick={() => onEdit(task)}>
        <p className="truncate font-medium text-zinc-100">{task.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={`h-5 px-1.5 text-[10px] font-medium uppercase leading-none ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </Badge>
          <Badge
            variant="outline"
            className={`h-5 px-1.5 text-[10px] font-medium uppercase leading-none ${DIFFICULTY_COLORS[task.difficulty]}`}
          >
            {task.difficulty}
          </Badge>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500">
            <Clock className="size-3" />
            {task.estimatedMinutes}m
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="mt-0.5 size-6 shrink-0 text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        aria-label="Delete task"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
})
