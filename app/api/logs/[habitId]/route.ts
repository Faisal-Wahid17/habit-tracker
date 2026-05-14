import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ habitId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { habitId } = await params

  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(logs)
}
