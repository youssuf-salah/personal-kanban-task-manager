import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Priority } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function totalMinutes(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0)
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function sortByPriority<T extends { priority: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export function filterTasks<T extends { task: string; priority: string; difficulty: string }>(
  tasks: T[],
  query: string
): T[] {
  if (!query.trim()) return tasks
  const q = query.toLowerCase()
  return tasks.filter(
    (t) =>
      t.task.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.difficulty.toLowerCase().includes(q)
  )
}
