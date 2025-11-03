// lib/meliAuth.ts
import { loadTokens, saveTokens, StoredTokens } from "./tokenStorage"

const APP_ID = process.env.MELI_APP_ID!
const APP_SECRET = process.env.MELI_APP_SECRET!
const OAUTH_URL = "https://api.mercadolibre.com/oauth/token"

async function refreshAccessToken(old: StoredTokens): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: APP_ID,
    client_secret: APP_SECRET,
    refresh_token: old.refreshToken,
  })

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    console.error("[meliAuth] Error al refrescar token:", await res.text())
    throw new Error("No se pudo refrescar el token de Mercado Libre")
  }

  const json = await res.json()

  const expiresIn = Number(json.expires_in) || 21600 // segundos (~6hs)

  const tokens: StoredTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  await saveTokens(tokens)
  return tokens
}

// 👉 ESTA es la función que va a usar TODO tu código
export async function getValidAccessToken(): Promise<string> {
  const current = await loadTokens()
  if (!current) {
    throw new Error(
      "[meliAuth] No hay tokens guardados. Tenés que tener la fila 2 de meli_tokens completa."
    )
  }

  const margin = 60 * 1000 // 1 minuto de margen
  const stillValid = Date.now() < current.expiresAt - margin

  if (stillValid) {
    return current.accessToken
  }

  // Si está vencido o por vencerse → refrescamos
  const updated = await refreshAccessToken(current)
  return updated.accessToken
}
