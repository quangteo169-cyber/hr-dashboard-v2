// app/api/data/route.ts
import { fetchDashboardData } from '@/lib/sheets'
import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 phút

export async function GET() {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
