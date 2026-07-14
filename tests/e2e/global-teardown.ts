import { PrismaClient } from '@prisma/client'

/** Limpia usuarios creados por los tests E2E (emails que contienen @e2e.com) */
export default async function globalTeardown() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      where: { email: { contains: '@e2e.com' } },
      select: { id: true, email: true },
    })
    if (users.length === 0) return

    const ids = users.map(u => u.id)
    await prisma.orderItem.deleteMany({ where: { order: { userId: { in: ids } } } })
    await prisma.order.deleteMany({ where: { userId: { in: ids } } })
    await prisma.user.deleteMany({ where: { id: { in: ids } } })

    console.log(`\n  🧹 E2E cleanup: ${users.length} test user(s) deleted\n`)
  } finally {
    await prisma.$disconnect()
  }
}
