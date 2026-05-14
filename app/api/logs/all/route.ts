import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(logs)
}
