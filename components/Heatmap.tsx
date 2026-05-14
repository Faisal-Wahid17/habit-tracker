'use client'

interface Log {
  habitId: string
  date: string
}

interface Props {
  logs: Log[]
  totalHabits: number
}

export default function Heatmap({ logs, totalHabits }: Props) {
  const weeks = 15
  const days = 7
  const cells: { date: Date; count: number }[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build last 15 weeks of days
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (weeks * 7 - 1))

  for (let i = 0; i < weeks * days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const count = logs.filter(l =>
      new Date(l.date).toDateString() === date.toDateString()
    ).length
    cells.push({ date, count })
  }

  // Group into weeks
  const weekGroups: { date: Date; count: number }[][] = []
  for (let i = 0; i < weeks; i++) {
    weekGroups.push(cells.slice(i * 7, i * 7 + 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-zinc-800'
    if (totalHabits === 0) return 'bg-indigo-900'
    const pct = count / totalHabits
    if (pct <= 0.25) return 'bg-indigo-900'
    if (pct <= 0.5) return 'bg-indigo-700'
    if (pct <= 0.75) return 'bg-indigo-500'
    return 'bg-indigo-400'
  }

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAY_LABELS = ['S','M','T','W','T','F','S']

  return (
    <div className="bg-zinc-900 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
        Activity — last 15 weeks
      </h3>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
          <div className="h-4" /> {/* spacer for month row */}
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-zinc-600 text-[9px]">
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weekGroups.map((week, wi) => {
          const firstDay = week[0].date
          const showMonth = firstDay.getDate() <= 7
          return (
            <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
              {/* Month label */}
              <div className="h-4 flex items-center">
                {showMonth && (
                  <span className="text-[9px] text-zinc-500">
                    {MONTH_LABELS[firstDay.getMonth()]}
                  </span>
                )}
              </div>
              {/* Day cells */}
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-colors`}
                  title={`${cell.date.toDateString()}: ${cell.count} check-ins`}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-zinc-600">Less</span>
        <div className="w-3 h-3 rounded-sm bg-zinc-800" />
        <div className="w-3 h-3 rounded-sm bg-indigo-900" />
        <div className="w-3 h-3 rounded-sm bg-indigo-700" />
        <div className="w-3 h-3 rounded-sm bg-indigo-500" />
        <div className="w-3 h-3 rounded-sm bg-indigo-400" />
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  )
}
