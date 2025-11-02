// lib/meliAuth.ts
import { getTokens, saveTokens, MeliTokens } from './tokenStorage'

const OAUTH_URL = 'https://api.mercadolibre.com/oauth/token'

// buffer: si faltan < 10min, refrescamos antes de llamar a la API
const EXPIRY_BUFFER_MS = 10 * 60 * 1000

function isExpiring(tokens: MeliTokens) {
  const expireAt = tokens.obtained_at + tokens.expires_in * 1000
  return Date.now() >= (expireAt - EXPIRY_BUFFER_MS)
}

export async function refreshWithStoredToken(): Promise<MeliTokens> {
  const tokens = await getTokens()
  if (!tokens?.refresh_token) {
    throw new Error('No hay refresh_token guardado. Autenticar primero.')
  }

  const client_id = process.env.MELI_CLIENT_ID
  const client_secret = process.env.MELI_CLIENT_SECRET
  if (!client_id || !client_secret) {
    throw new Error('Faltan MELI_CLIENT_ID / MELI_CLIENT_SECRET en .env.local')
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id,
    client_secret,
    refresh_token: tokens.refresh_token,
  })

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Refresh error ${res.status}: ${JSON.stringify(data)}`)
  }

  const updated: MeliTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user_id: (data.user_id ?? tokens.user_id)?.toString(),
    obtained_at: Date.now(),
  }
  await saveTokens(updated)
  return updated
}

/**
 * Devuelve un access_token válido. Refresca si está por vencer.
 * Fallback: si no hay tokens guardados, usa MELI_ACCESS_TOKEN de .env (solo para dev)
 */
export async function ensureFreshAccessToken(): Promise<string> {
  const stored = await getTokens()
  if (stored?.access_token) {
    if (isExpiring(stored)) {
      const refreshed = await refreshWithStoredToken()
      return refreshed.access_token
    }
    return stored.access_token
  }
  // Fallback: útil mientras haces el primer guardado
  if (process.env.MELI_ACCESS_TOKEN) return process.env.MELI_ACCESS_TOKEN
  throw new Error('No hay access_token disponible. Autenticar y guardar tokens.')
}
