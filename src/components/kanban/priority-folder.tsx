'use client'

import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { Task, Status, Priority } from '@/types'
import { KanbanCard } from './kanban-card'

interface PriorityFolderProps {
  status: Status
  priority: Priority
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  compact?: boolean
}

const FOLDER_LABELS: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const FOLDER_ACCENT: Record<Priority, {
  text: string
  border: string
  bg: string
  dot: string
  icon: typeof AlertCircle
}> = {
  critical: {
    text: 'text-red-400',
    border: 'border-red-500/15',
    bg: 'bg-red-500/[0.02]',
    dot: 'bg-red-400',
    icon: AlertCircle,
  },
  high: {
    text: 'text-orange-400',
    border: 'border-orange-500/15',
    bg: 'bg-orange-500/[0.02]',
    dot: 'bg-orange-400',
    icon: ArrowUp,
  },
  medium: {
    text: 'text-blue-400',
    border: 'border-blue-500/15',
    bg: 'bg-blue-500/[0.02]',
    dot: 'bg-blue-400',
    icon: Minus,
  },
  low: {
    text: 'text-zinc-400',
    border: 'border-zinc-500/15',
    bg: 'bg-zinc-500/[0.02]',
    dot: 'bg-zinc-400',
    icon: ArrowDown,
  },
}

export function PriorityFolder({
  status,
  priority,
  tasks,
  onEdit,
  onDelete,
  compact,
}: PriorityFolderProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: `${status}:${priority}` })
  const accent = FOLDER_ACCENT[priority]
  const Icon = accent.icon

  const itemIds = useMemo(() => tasks.map((t) => t.id), [tasks])

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border transition-all ${
        isOver ? `${accent.border} ${accent.bg}` : 'border-transparent'
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03] ${accent.text}`}
      >
        <Icon className="size-3 shrink-0" />
        <span className="text-[11px] font-medium">{FOLDER_LABELS[priority]}</span>
        <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded bg-white/[0.05] px-1 text-[9px] font-medium text-zinc-500 tabular-nums">
          {tasks.length}
        </span>
        <ChevronDown
          className={`size-3 text-zinc-600 transition-transform duration-150 ${
            collapsed ? '-rotate-90' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-150 ${
          collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        }`}
      >
        <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
          <div className="flex flex-col gap-1 px-1 pb-1.5">
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
                  compact={compact}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>
    </div>
  )
}
