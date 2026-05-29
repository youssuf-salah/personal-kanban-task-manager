'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
      <div className="flex size-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <span className="text-lg text-red-400">!</span>
      </div>
      <h2 className="text-sm font-medium text-zinc-300">Something went wrong</h2>
      <p className="max-w-md text-center text-xs text-zinc-500">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button size="sm" onClick={reset} className="gap-1.5 text-xs">
        Try again
      </Button>
    </div>
  )
}
