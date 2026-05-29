'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (tasks: any[]) => void
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
}: BulkImportDialogProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    setError(null)
    try {
      const parsed = JSON.parse(jsonInput)
      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        if (!item.task || typeof item.task !== 'string') {
          setError('Each item must have a "task" field with a string value')
          return
        }
      }

      const normalized = items.map((item: any) => ({
        task: item.task,
        priority: (item.priority || 'medium').toLowerCase(),
        difficulty: (item.difficulty || 'medium').toLowerCase(),
        estimated_minutes: item.estimated_minutes ?? 30,
      }))

      onImport(normalized)
      setJsonInput('')
      onOpenChange(false)
    } catch {
      setError('Invalid JSON format. Please check your input.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Tasks</DialogTitle>
          <DialogDescription>
            Paste a JSON array of tasks. Each object needs at least a `task`
            field.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={JSON.stringify(
              [
                {
                  task: 'Learn React Server Components',
                  priority: 'high',
                  difficulty: 'medium',
                  estimated_minutes: 60,
                },
                {
                  task: 'Read Next.js docs',
                  priority: 'medium',
                  difficulty: 'easy',
                  estimated_minutes: 30,
                },
              ],
              null,
              2
            )}
            className="min-h-[200px] font-mono text-xs"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!jsonInput.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
