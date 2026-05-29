import { getPrisma } from "../src/lib/prisma"

async function seed() {
  const prisma = await getPrisma()

  const tasks = [
    {
      task: "Learn Prisma ORM basics",
      priority: "HIGH" as const,
      difficulty: "MEDIUM" as const,
      estimatedMinutes: 45,
      status: "TODO" as const,
    },
    {
      task: "Set up MySQL database",
      priority: "HIGH" as const,
      difficulty: "EASY" as const,
      estimatedMinutes: 30,
      status: "DONE" as const,
    },
    {
      task: "Build drag-and-drop Kanban",
      priority: "CRITICAL" as const,
      difficulty: "HARD" as const,
      estimatedMinutes: 120,
      status: "BACKLOG" as const,
    },
    {
      task: "Write API integration tests",
      priority: "MEDIUM" as const,
      difficulty: "MEDIUM" as const,
      estimatedMinutes: 60,
      status: "BACKLOG" as const,
    },
    {
      task: "Review React Server Components",
      priority: "LOW" as const,
      difficulty: "EASY" as const,
      estimatedMinutes: 20,
      status: "IN_PROGRESS" as const,
    },
  ]

  for (const t of tasks) {
    await prisma.task.create({ data: t })
  }

  console.log(`Seeded ${tasks.length} tasks`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
