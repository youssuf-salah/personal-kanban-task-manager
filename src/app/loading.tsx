export default function Loading() {
  return (
    <div className="grid h-full grid-cols-1 gap-5 p-6 md:grid-cols-2 2xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-4 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
          </div>
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
