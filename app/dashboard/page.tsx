'use client'
import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HabitModal from '@/components/HabitModal'
import HabitCard from '@/components/HabitCard'
import { HabitSkeleton, StatSkeleton } from '@/components/Skeleton'

interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: string
}

interface Log {
  habitId: string
  date: string
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [allLogs, setAllLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const today = new Date().toDateString()

  useEffect(() => {
    Promise.all([
      fetch('/api/habits').then(r => r.json()),
      fetch('/api/logs/today').then(r => r.json()),
      fetch('/api/logs/all').then(r => r.json()),
    ]).then(([habitsData, logsData, allLogsData]) => {
      setHabits(habitsData)
      setLogs(logsData)
      setAllLogs(allLogsData)
      setLoading(false)
    })
  }, [])

  const isChecked = (habitId: string) => {
    const todayStr = new Date().toDateString()
    return logs.some(l => l.habitId === habitId && new Date(l.date).toDateString() === todayStr)
  }

  const getStreak = (habitId: string) => {
    const habitLogs = allLogs
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

  const isHabitDueToday = (habit: Habit) => {
    const day = new Date().getDay() // 0 = Sun, 6 = Sat
    if (habit.frequency === 'DAILY') return true
    if (habit.frequency === 'WEEKDAYS') return day >= 1 && day <= 5
    if (habit.frequency === 'WEEKLY') {
      // Show weekly habit only on Mondays
      return day === 1
    }
    return true
  }

  const handleCheck = async (habitId: string) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    if (isChecked(habitId)) {
      // Uncheck
      await fetch('/api/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date: date.toISOString() }),
      })
      setLogs(prev => prev.filter(l => !(l.habitId === habitId && new Date(l.date).toDateString() === today)))
      setAllLogs(prev => prev.filter(l => !(l.habitId === habitId && new Date(l.date).toDateString() === today)))
    } else {
      // Check
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date: date.toISOString() }),
      })
      const log = await res.json()
      setLogs(prev => [...prev, log])
      setAllLogs(prev => [...prev, log])
    }
  }

  const handleCreate = async (data: { name: string; icon: string; color: string; frequency: string }) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const habit = await res.json()
    setHabits(prev => [...prev, habit])
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const dueHabits = habits.filter(isHabitDueToday)
  const completed = dueHabits.filter(h => isChecked(h.id)).length
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top navbar */}
      <div className="border-b border-zinc-800 px-4 sm:px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-semibold text-lg tracking-tight">Streakly</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-500">
              Today
            </Link>
            <Link href="/habits" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Habits
            </Link>
            <Link href="/stats" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Stats
            </Link>
            <UserButton />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Date + progress */}
        <div className="mb-8">
          <p className="text-zinc-500 text-sm mb-1">{dateStr}</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {completed === 0 ? "Let's go! 💪" : completed === dueHabits.length ? "All done! 🎉" : `${completed} of ${dueHabits.length} done`}
          </h2>

          {/* Progress bar */}
          {dueHabits.length > 0 && (
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(completed / dueHabits.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="bg-zinc-900 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold">{completed}<span className="text-zinc-500 text-sm font-normal">/{dueHabits.length}</span></div>
                <div className="text-xs text-zinc-500 mt-1">today</div>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">{habits.length}</div>
                <div className="text-xs text-zinc-500 mt-1">habits</div>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id))) : 0}
                </div>
                <div className="text-xs text-zinc-500 mt-1">best streak</div>
              </div>
            </>
          )}
        </div>

        {/* Habits list */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Habits</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add habit
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <HabitSkeleton />
            <HabitSkeleton />
            <HabitSkeleton />
          </div>
        ) : dueHabits.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm">No habits due today!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dueHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checked={isChecked(habit.id)}
                streak={getStreak(habit.id)}
                onCheck={() => handleCheck(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <HabitModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
    </div>
  )
}