'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import Heatmap from '@/components/Heatmap'

import type { Habit, Log } from '@/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null)

  const handleExport = async (type: 'pdf' | 'word') => {
    setExporting(type)
    const { exportPDF, exportWord } = await import('@/lib/report')
    if (type === 'pdf') await exportPDF(habits, logs)
    else await exportWord(habits, logs)
    setExporting(null)
  }

  useEffect(() => {
    fetch('/api/habits').then(r => r.json()).then(setHabits)
    fetch('/api/logs/all').then(r => r.json()).then(setLogs)
  }, [])

  const getStreak = (habitId: string) => {
    const habitLogs = logs
      .filter(l => l.habitId === habitId)
      .map(l => new Date(l.date).toDateString())

    let streak = 0
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      if (habitLogs.includes(d.toDateString())) streak++
      else break
    }
    return streak
  }

  const weeklyData = DAYS.map((day, i) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const count = logs.filter(l =>
      new Date(l.date).toDateString() === date.toDateString()
    ).length
    return { day, count }
  })

  const totalLogs = logs.length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id))) : 0
  const completionRate = habits.length === 0 ? 0 : Math.round(
    (logs.filter(l => {
      const d = new Date(l.date)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      return d >= cutoff
    }).length / (habits.length * 7)) * 100
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <div className="border-b border-zinc-800 px-4 sm:px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-semibold text-lg tracking-tight">Streakly</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Today
            </Link>
            <Link href="/habits" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Habits
            </Link>
            <Link href="/stats" className="text-sm font-medium text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-500">
              Stats
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Your progress 📈</h2>
          <p className="text-zinc-500 text-sm mt-1">Keep showing up every day</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            >
              {exporting === 'pdf' ? '⏳ Generating...' : '📄 Export PDF'}
            </button>
            <button
              onClick={() => handleExport('word')}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            >
              {exporting === 'word' ? '⏳ Generating...' : '📝 Export Word'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{habits.length}</div>
            <div className="text-xs text-zinc-500 mt-1">habits</div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">🔥 {bestStreak}</div>
            <div className="text-xs text-zinc-500 mt-1">best streak</div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{completionRate}%</div>
            <div className="text-xs text-zinc-500 mt-1">this week</div>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-zinc-900 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">This week</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis
                dataKey="day"
                tick={{ fill: '#52525b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#fff'
                }}
                cursor={{ fill: '#27272a', radius: 6 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === new Date().getDay() ? '#6366f1' : '#27272a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="mb-4">
          <Heatmap logs={logs} totalHabits={habits.length} />
        </div>

        {/* Streaks list */}
        <div className="bg-zinc-900 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Streaks</h3>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm">No habits yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {habits
                .sort((a, b) => getStreak(b.id) - getStreak(a.id))
                .map(habit => {
                  const streak = getStreak(habit.id)
                  const pct = bestStreak > 0 ? (streak / bestStreak) * 100 : 0
                  return (
                    <div key={habit.id}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-base">{habit.icon}</span>
                        <span className="flex-1 text-sm font-medium">{habit.name}</span>
                        <span className="text-sm font-semibold text-amber-400">
                          {streak > 0 ? `🔥 ${streak}d` : '—'}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: habit.color }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Total check-ins */}
        <div className="bg-zinc-900 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">All time</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{totalLogs}</span>
            <span className="text-zinc-500 text-sm mb-1.5">total check-ins</span>
          </div>
        </div>
      </div>
    </div>
  )
}
