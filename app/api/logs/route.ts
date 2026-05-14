import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { habitId, date } = await req.json()

  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: new Date(date) } },
    update: {},
    create: { habitId, date: new Date(date) },
  })

  return NextResponse.json(log)
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { habitId, date } = await req.json()

  await prisma.habitLog.deleteMany({
    where: {
      habitId,
      date: new Date(date),
      habit: { userId },
    },
  })

  return NextResponse.json({ success: true })
}
