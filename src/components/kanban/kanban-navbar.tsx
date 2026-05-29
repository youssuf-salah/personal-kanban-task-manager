'use client'

import { Upload, Plus, LayoutDashboard, Search, Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanNavbarProps {
  onNewTask: () => void
  onImport: () => void
  search: string
  onSearchChange: (q: string) => void
  compact: boolean
  onCompactToggle: () => void
}

export function KanbanNavbar({
  onNewTask,
  onImport,
  search,
  onSearchChange,
  compact,
  onCompactToggle,
}: KanbanNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-black/50 px-6 py-3 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="size-4 text-zinc-400" />
        <h1 className="text-sm font-semibold text-zinc-100">Task Board</h1>
      </div>

      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="h-8 w-full rounded-lg border border-white/[0.06] bg-white/[0.04] pl-8 pr-3 text-xs text-zinc-300 placeholder-zinc-600 outline-none transition-colors focus:border-white/[0.12] focus:bg-white/[0.06]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCompactToggle}
          className={`size-7 ${compact ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          aria-label="Toggle compact mode"
        >
          <Columns3 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          className="gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
        >
          <Upload className="size-3.5" />
          Import
        </Button>
        <Button size="sm" onClick={onNewTask} className="gap-1.5 text-xs">
          <Plus className="size-3.5" />
          New Task
        </Button>
      </div>
    </header>
  )
}
