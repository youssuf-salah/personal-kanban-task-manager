'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task, Status, Priority, Difficulty } from '@/types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  difficulty: z.enum(['hard', 'medium', 'easy']),
  estimatedMinutes: z.coerce.number().int().min(1).max(1440),
})

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    priority: string
    difficulty: string
    estimatedMinutes: number
  }) => void
  task?: Task
  defaultStatus?: Status
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
}: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title)
        setPriority(task.priority)
        setDifficulty(task.difficulty)
        setEstimatedMinutes(task.estimatedMinutes)
      } else {
        setTitle('')
        setPriority('medium')
        setDifficulty('medium')
        setEstimatedMinutes(30)
      }
      setErrors({})
    }
  }, [open, task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = taskSchema.safeParse({ title, priority, difficulty, estimatedMinutes })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    onSubmit(result.data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutes">Estimated minutes</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              max={1440}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
            {errors.estimatedMinutes && (
              <p className="text-xs text-red-400">
                {errors.estimatedMinutes}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{task ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
