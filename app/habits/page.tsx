'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import HabitModal from '@/components/HabitModal'

interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: string
  createdAt: string
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    fetch('/api/habits').then(r => r.json()).then(data => {
      setHabits(data)
      setLoading(false)
    })
  }, [])

  const handleCreate = async (data: { name: string; icon: string; color: string; frequency: string }) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const habit = await res.json()
    setHabits(prev => [...prev, habit])
  }

  const handleEdit = async (data: { name: string; icon: string; color: string; frequency: string }) => {
    if (!editingHabit) return
    const res = await fetch(`/api/habits/${editingHabit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setHabits(prev => prev.map(h => h.id === updated.id ? updated : h))
    setEditingHabit(null)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const handleArchive = async (id: string) => {
    await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    setHabits(prev => prev.filter(h => h.id !== id))
  }

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
            <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Today</Link>
            <Link href="/habits" className="text-sm font-medium text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-500">Habits</Link>
            <Link href="/stats" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Stats</Link>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Manage habits ✏️</h2>
          <p className="text-zinc-500 text-sm mt-1">{habits.length} active habits</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">All habits</h3>
          <button
            onClick={() => { setEditingHabit(null); setShowModal(true) }}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add habit
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm">No habits yet. Add your first one!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map(habit => (
              <div key={habit.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: habit.color }} />
                  <span className="text-xl">{habit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{habit.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">{habit.frequency.toLowerCase()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingHabit(habit); setShowModal(true) }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(habit.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:text-red-400 text-zinc-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <HabitModal
          onClose={() => { setShowModal(false); setEditingHabit(null) }}
          onSave={editingHabit ? handleEdit : handleCreate}
          initialData={editingHabit ?? undefined}
        />
      )}
    </div>
  )
}
