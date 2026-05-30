'use client'

import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus, Inbox, CircleDot, Loader, CheckCircle2, Clock } from 'lucide-react'
import type { Task, Status, Priority } from '@/types'
import { STATUS_LABELS } from '@/types'
import { Button } from '@/components/ui/button'
import { formatMinutes, totalMinutes } from '@/lib/utils'
import { PriorityFolder } from './priority-folder'

interface KanbanColumnProps {
  status: Status
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAdd: (status: Status) => void
  compact?: boolean
}

const STATUS_ICONS: Record<Status, typeof Inbox> = {
  backlog: Inbox,
  todo: CircleDot,
  in_progress: Loader,
  done: CheckCircle2,
}

const COLUMN_THEME: Record<Status, {
  icon: string
  title: string
  count: string
  accentVar: string
  borderOver: string
  bgOver: string
  glowOver: string
}> = {
  backlog: {
    icon: 'text-zinc-400',
    title: 'text-zinc-300',
    count: 'bg-zinc-500/20 text-zinc-400',
    accentVar: '--column-accent: rgb(161 161 170)',
    borderOver: 'border-zinc-500/30',
    bgOver: 'bg-zinc-500/[0.04]',
    glowOver: 'shadow-[0_0_24px_-8px_rgba(161,161,170,0.15)]',
  },
  todo: {
    icon: 'text-blue-400',
    title: 'text-blue-300',
    count: 'bg-blue-500/20 text-blue-400',
    accentVar: '--column-accent: rgb(96 165 250)',
    borderOver: 'border-blue-500/30',
    bgOver: 'bg-blue-500/[0.04]',
    glowOver: 'shadow-[0_0_24px_-8px_rgba(96,165,250,0.15)]',
  },
  in_progress: {
    icon: 'text-amber-400',
    title: 'text-amber-300',
    count: 'bg-amber-500/20 text-amber-400',
    accentVar: '--column-accent: rgb(251 191 36)',
    borderOver: 'border-amber-500/30',
    bgOver: 'bg-amber-500/[0.04]',
    glowOver: 'shadow-[0_0_24px_-8px_rgba(251,191,36,0.15)]',
  },
  done: {
    icon: 'text-emerald-400',
    title: 'text-emerald-300',
    count: 'bg-emerald-500/20 text-emerald-400',
    accentVar: '--column-accent: rgb(52 211 153)',
    borderOver: 'border-emerald-500/30',
    bgOver: 'bg-emerald-500/[0.04]',
    glowOver: 'shadow-[0_0_24px_-8px_rgba(52,211,153,0.15)]',
  },
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onAdd,
  compact,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const Icon = STATUS_ICONS[status]
  const theme = COLUMN_THEME[status]

  const priorities: Priority[] = ['critical', 'high', 'medium', 'low']

  const grouped = useMemo(() => {
    const groups: Record<Priority, Task[]> = {
      critical: [], high: [], medium: [], low: [],
    }
    for (const t of tasks) {
      if (groups[t.priority]) groups[t.priority].push(t)
    }
    return groups
  }, [tasks])

  const totalEstimate = useMemo(
    () => formatMinutes(totalMinutes(tasks.map((t) => t.estimated_minutes))),
    [tasks]
  )

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ [theme.accentVar.split(':')[0] as string]: theme.accentVar.split(':')[1] } as React.CSSProperties}>
      <div className="mb-3 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${theme.icon}`} />
          <h2 className={`text-xs font-semibold uppercase tracking-wider ${theme.title}`}>
            {STATUS_LABELS[status]}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock className="size-3" />
              {totalEstimate}
            </span>
          )}
          <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium tabular-nums ${theme.count}`}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        style={{ '--column-accent': `var(--column-accent)` } as React.CSSProperties}
        className={`column-accent flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border p-2 transition-all scrollbar-thin ${
          isOver
            ? `${theme.borderOver} ${theme.bgOver} ${theme.glowOver}`
            : 'border-white/[0.04] bg-white/[0.02]'
        }`}
      >
        {priorities.map((priority) => (
          <PriorityFolder
            key={priority}
            status={status}
            priority={priority}
            tasks={grouped[priority]}
            onEdit={onEdit}
            onDelete={onDelete}
            compact={compact}
          />
        ))}
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
  if (prev.compact !== next.compact) return false
  if (prev.tasks.length !== next.tasks.length) return false
  return prev.tasks.every((t, i) => {
    const n = next.tasks[i]
    return t.id === n.id && t.task === n.task && t.priority === n.priority &&
      t.difficulty === n.difficulty && t.estimated_minutes === n.estimated_minutes
  })
})
