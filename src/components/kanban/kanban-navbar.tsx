'use client'

import { Upload, Plus, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanNavbarProps {
  onNewTask: () => void
  onImport: () => void
}

export function KanbanNavbar({ onNewTask, onImport }: KanbanNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-black/50 px-6 py-3 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="size-4 text-zinc-400" />
        <h1 className="text-sm font-semibold text-zinc-100">Task Board</h1>
      </div>
      <div className="flex items-center gap-2">
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
