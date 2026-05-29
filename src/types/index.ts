export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Difficulty = 'hard' | 'medium' | 'easy'
export type Status = 'backlog' | 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  task: string
  priority: Priority
  difficulty: Difficulty
  estimated_minutes: number
  status: Status
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  task: string
  priority?: Priority
  difficulty?: Difficulty
  estimated_minutes?: number
  status?: Status
}

export interface UpdateTaskInput {
  task?: string
  priority?: Priority
  difficulty?: Difficulty
  estimated_minutes?: number
  status?: Status
}

export interface ImportTaskInput {
  task: string
  priority?: string
  difficulty?: string
  estimated_minutes?: number
}

export const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  hard: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  easy: 'bg-green-500/15 text-green-400 border-green-500/30',
}

export const COLUMNS: Status[] = ['backlog', 'todo', 'in_progress', 'done']
