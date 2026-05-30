'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { z } from 'zod'
import { createTaskSchema } from '@/lib/schemas'
import { useBoardStore } from '@/store/use-board-store'
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from '@/types'

type ParsedTask = z.infer<typeof createTaskSchema>

interface ParsedItem {
  index: number
  valid: true
  data: ParsedTask
}

interface FailedItem {
  index: number
  valid: false
  title: string
  issues: Array<{ message: string; path: readonly (string | number | symbol)[]; code: string }>
}

type ParseResult = ParsedItem | FailedItem

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [step, setStep] = useState<'paste' | 'preview'>('paste')
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [results, setResults] = useState<ParseResult[] | null>(null)
  const [importing, setImporting] = useState(false)

  const handleParse = useCallback(() => {
    setParseError(null)

    if (!jsonInput.trim()) {
      setParseError('Paste a JSON array of tasks first')
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonInput)
    } catch {
      setParseError('Invalid JSON — check for syntax errors')
      return
    }

    const items = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[]

    if (items.length === 0) {
      setParseError('Array is empty — include at least one task')
      return
    }

    const parsedResults: ParseResult[] = items.map((item, index) => {
      const check = createTaskSchema.safeParse(item)
      if (check.success) {
        return { index, valid: true as const, data: check.data }
      }
      const guessed = typeof item?.task === 'string' ? item.task : `Item #${index + 1}`
      return {
        index,
        valid: false as const,
        title: guessed,
        issues: check.error.issues.map((i) => ({
          message: i.message,
          path: i.path,
          code: i.code,
        })),
      }
    })

    setResults(parsedResults)
    setStep('preview')
  }, [jsonInput])

  const handleImport = useCallback(async () => {
    if (!results) return

    const valid = results.filter((r): r is ParsedItem => r.valid)
    if (valid.length === 0) return

    setImporting(true)
    try {
      const res = await fetch('/api/tasks/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valid.map((r) => r.data)),
      })

      if (!res.ok) throw new Error('Server error')

      const result = await res.json()

      useBoardStore.getState().bulkImport(valid.map((r) => r.data))

      if (result.failed === 0) {
        toast.success(`Created ${result.created} task${result.created > 1 ? 's' : ''}`)
      } else if (result.created > 0) {
        toast.warning(`Created ${result.created}, ${result.failed} skipped`)
      } else {
        toast.error('All tasks failed validation on the server')
      }

      onOpenChange(false)
    } catch {
      toast.error('Import failed — check your connection and try again')
    } finally {
      setImporting(false)
    }
  }, [results, onOpenChange])

  const validCount = results?.filter((r): r is ParsedItem => r.valid).length ?? 0
  const invalidCount = results ? results.length - validCount : 0

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (step === 'paste') handleParse()
        else if (step === 'preview' && !importing && validCount > 0) handleImport()
      }
    },
    [step, handleParse, handleImport, importing, validCount]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/6 bg-black/60 backdrop-blur-2xl sm:max-w-2xl"
        onKeyDown={handleKeyDown}
      >
        <div key={String(open)} className="flex flex-col max-h-[80vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Bulk Import Tasks</DialogTitle>
          {step === 'paste' && (
            <DialogDescription>
              Paste a JSON array of tasks. Each object needs at least a{' '}
              <code className="text-[11px] text-zinc-300">task</code> field.
            </DialogDescription>
          )}
          {step === 'preview' && (
            <DialogDescription>
              Review the parsed tasks before importing.{' '}
              <span className="text-zinc-400">(Ctrl+Enter to confirm)</span>
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'paste' && (
          <div className="flex flex-col gap-4 overflow-hidden min-h-0">
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                if (parseError) setParseError(null)
              }}
              placeholder='[{ "task": "Learn vector embeddings", "priority": "high", "difficulty": "medium", "estimated_minutes": 90 }]'
              className="min-h-50 max-h-75 w-full font-mono text-xs resize-none overflow-y-auto"
              spellCheck={false}
              autoFocus
            />

            {parseError && (
              <div className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <XCircle className="size-3.5 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={!jsonInput.trim()}>
                Parse JSON
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && results && (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0">
            <div className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2 text-xs shrink-0">
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="size-3.5" />
                {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="size-3.5" />
                  {invalidCount} invalid
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 min-h-0">
              {results.map((item) => (
                <div
                  key={item.index}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-sm ${
                    item.valid
                      ? 'border-white/4 bg-white/2'
                      : 'border-red-500/15 bg-red-500/3'
                  }`}
                >
                  {item.valid ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-words text-sm font-medium text-zinc-100">
                      {item.valid ? item.data.task : item.title}
                    </p>

                    {item.valid ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`h-5 border px-1.5 text-[10px] font-medium uppercase leading-none ${PRIORITY_COLORS[item.data.priority]}`}
                        >
                          {item.data.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`h-5 border px-1.5 text-[10px] font-medium uppercase leading-none ${DIFFICULTY_COLORS[item.data.difficulty]}`}
                        >
                          {item.data.difficulty}
                        </Badge>
                        <span className="text-[10px] text-zinc-500">
                          {item.data.estimated_minutes}m
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 space-y-0.5">
                        {item.issues.map((issue, i) => (
                          <p key={i} className="text-[11px] leading-tight text-red-400">
                            {issue.path.length > 0
                              ? `${issue.path.join('.')}: ${issue.message}`
                              : issue.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
              <p className="text-[11px] text-zinc-500">
                Invalid items will be skipped during import.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('paste')}
                  className="gap-1"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={importing || validCount === 0}
                >
                  {importing
                    ? 'Importing...'
                    : `Import ${validCount} task${validCount > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
