export function HabitSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-zinc-700 flex-shrink-0" />
      <div className="w-8 h-8 rounded-lg bg-zinc-700 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-zinc-700 rounded-full w-32 mb-2" />
        <div className="h-2.5 bg-zinc-800 rounded-full w-20" />
      </div>
      <div className="w-7 h-7 rounded-lg bg-zinc-700" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 text-center animate-pulse">
      <div className="h-8 bg-zinc-700 rounded-full w-12 mx-auto mb-2" />
      <div className="h-2.5 bg-zinc-800 rounded-full w-10 mx-auto" />
    </div>
  )
}
