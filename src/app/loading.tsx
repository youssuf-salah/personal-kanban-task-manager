export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center gap-6 p-6">
      {['backlog', 'todo', 'in_progress', 'done'].map((_, i) => (
        <div key={i} className="flex h-full w-72 shrink-0 flex-col gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-white/[0.06]" />
          <div className="flex flex-1 flex-col gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-24 animate-pulse rounded-lg border border-white/[0.04] bg-white/[0.03]"
                style={{ animationDelay: `${(i * 3 + j) * 100}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
