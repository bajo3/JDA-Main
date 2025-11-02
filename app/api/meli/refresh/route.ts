// app/api/meli/refresh/route.ts
export const runtime = 'nodejs'         // necesitamos fs (Node, no Edge)
export const dynamic = 'force-dynamic'  // no cachear

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// truco anti TS2306: si por algún motivo Next/TS no detecta esto como módulo,
// este export vacío garantiza que el archivo sea un módulo ES.
export {}

function ok(data: unknown, init?: number) {
  return NextResponse.json(data, init ? { status: init } : undefined)
}

export async function GET(_req: NextRequest) {
  return ok({ ok: true })
}

export async function POST(_req: NextRequest) {
  return ok({ ok: true })
}
