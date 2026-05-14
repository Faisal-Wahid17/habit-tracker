'use client'
import { useState } from 'react'

interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: string
}

interface Props {
  habit: Habit
  checked: boolean
  streak: number
  onCheck: () => void
  onDelete: () => void
}

export default function HabitCard({ habit, checked, streak, onCheck, onDelete }: Props) {
  const [animating, setAnimating] = useState(false)

  const handleCheck = () => {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    onCheck()
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
      checked
        ? 'bg-zinc-900 border-zinc-800 opacity-70'
        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: habit.color }} />
      <span className={`text-xl transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'}`}>
        {habit.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate max-w-[140px] sm:max-w-none transition-all duration-300 ${
          checked ? 'line-through text-zinc-500' : 'text-white'
        }`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-amber-400 mt-0.5">🔥 {streak} day streak</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCheck}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
            animating ? 'scale-110' : 'scale-100'
          }`}
          style={checked
            ? { background: habit.color, borderColor: habit.color }
            : { borderColor: '#52525b', background: 'transparent' }
          }
        >
          <span className={`text-white text-xs font-bold transition-all duration-300 ${
            checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>✓</span>
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
