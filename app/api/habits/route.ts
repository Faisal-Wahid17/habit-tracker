import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const habits = await prisma.habit.findMany({
    where: { userId, archived: false },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(habits)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, icon, color, frequency } = body

  // Create user if doesn't exist yet
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: '' },
  })

  const habit = await prisma.habit.create({
    data: { userId, name, icon, color, frequency },
  })

  return NextResponse.json(habit)
}
