'use client'
import { useState } from 'react'

const COLORS = ['#534AB7', '#1D9E75', '#D85A30', '#378ADD', '#BA7517', '#D4537E']
const ICONS = ['⭐', '💪', '📚', '💧', '🧘', '✍️', '🏃', '🥗', '😴', '🎯']
const FREQUENCIES = ['DAILY', 'WEEKDAYS', 'WEEKLY']

interface Props {
  onClose: () => void
  onSave: (habit: { name: string; icon: string; color: string; frequency: string }) => void
  initialData?: { name: string; icon: string; color: string; frequency: string }
}

export default function HabitModal({ onClose, onSave, initialData }: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [icon, setIcon] = useState(initialData?.icon ?? '⭐')
  const [color, setColor] = useState(initialData?.color ?? '#534AB7')
  const [frequency, setFrequency] = useState(initialData?.frequency ?? 'DAILY')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({ name, icon, color, frequency })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold mb-5">
          {initialData ? 'Edit habit' : 'New habit'}
        </h2>

        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Name</label>
        <input
          className="w-full border border-zinc-700 rounded-xl px-3 py-2.5 text-sm mb-5 bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g. Morning meditation"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Icon</label>
        <div className="flex gap-2 flex-wrap mb-5">
          {ICONS.map(i => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              className={`text-xl p-2 rounded-xl border-2 transition-all ${
                icon === i ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent hover:border-zinc-600'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Color</label>
        <div className="flex gap-3 mb-5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Frequency</label>
        <div className="flex gap-2 mb-6">
          {FREQUENCIES.map(f => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`flex-1 text-xs py-2 rounded-xl border transition-all ${
                frequency === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            {initialData ? 'Save changes' : 'Create habit'}
          </button>
        </div>
      </div>
    </div>
  )
}
