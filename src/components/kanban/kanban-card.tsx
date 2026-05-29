'use client'

import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Clock } from 'lucide-react'
import type { Task } from '@/types'
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PRIORITY_ACCENT: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#71717a',
}

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
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition,
    '--card-accent': PRIORITY_ACCENT[task.priority],
  }

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      className={`card-accent group flex items-start gap-3 rounded-lg border p-3 text-sm shadow-sm backdrop-blur-2xl transition-all ${
        isDragging
          ? 'border-white/[0.04] bg-white/[0.02] opacity-30'
          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]'
      }`}
    >
      <button
        className={`mt-0.5 touch-none transition-colors ${
          isDragging ? 'cursor-grabbing text-zinc-500' : 'cursor-grab text-zinc-600 hover:text-zinc-400'
        }`}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-3.5" />
      </button>

      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(task)}>
        <p className="truncate text-sm font-medium text-zinc-100">{task.task}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={`h-5 border px-1.5 text-[10px] font-medium uppercase leading-none ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </Badge>
          <Badge
            variant="outline"
            className={`h-5 border px-1.5 text-[10px] font-medium uppercase leading-none ${DIFFICULTY_COLORS[task.difficulty]}`}
          >
            {task.difficulty}
          </Badge>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500">
            <Clock className="size-3" />
            {task.estimated_minutes}m
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
