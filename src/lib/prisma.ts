let prisma: any = null

export async function getPrisma() {
  if (prisma) return prisma

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const { PrismaMariaDb } = await import("@prisma/adapter-mariadb")
  const { PrismaClient } = await import("@/generated/prisma/client")

  const u = new URL(url)
  const adapter = new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
    connectionLimit: 5,
  })

  prisma = new PrismaClient({ adapter })
  return prisma
}
