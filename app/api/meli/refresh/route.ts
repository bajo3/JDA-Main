// app/api/meli/refresh/route.ts
export const runtime = 'nodejs'         // permite usar fs en serverless
export const dynamic = 'force-dynamic'  // no cachear este endpoint

import { NextResponse } from 'next/server'
import { refreshWithStoredToken } from '../../../../lib/meliAuth' // <- relativo

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // si no definiste CRON_SECRET, no bloqueamos
  const auth = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  return auth === `Bearer ${secret}`
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
