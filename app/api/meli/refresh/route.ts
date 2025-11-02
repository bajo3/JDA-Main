// app/api/meli/refresh/route.ts
export const runtime = 'nodejs'         // necesario para fs
export const dynamic = 'force-dynamic'  // siempre servidor

import { NextResponse } from 'next/server'
import { refreshWithStoredToken } from '@/lib/meliAuth'

function isAuthorized(req: Request) {
  const required = process.env.CRON_SECRET
  if (!required) return true // si no configuraste secreto, no bloqueamos
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  return auth === `Bearer ${required}`
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const tokens = await refreshWithStoredToken()
    return NextResponse.json({ ok: true, expires_in: tokens.expires_in })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'refresh error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const tokens = await refreshWithStoredToken()
    return NextResponse.json({ ok: true, expires_in: tokens.expires_in })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'refresh error' }, { status: 500 })
  }
}
