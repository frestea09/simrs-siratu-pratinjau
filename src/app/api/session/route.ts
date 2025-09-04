import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const jar = await cookies()
    const raw = jar.get('session')?.value
    if (!raw) return NextResponse.json({ user: null })
    const sess = JSON.parse(raw)
    // Do not expose password if present
    const { password, ...safe } = sess || {}
    return NextResponse.json({ user: safe })
  } catch (e: any) {
    return NextResponse.json({ user: null })
  }
}

