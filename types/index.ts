export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: string
}

export interface Log {
  habitId: string
  date: string
}
