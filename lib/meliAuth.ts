// lib/meliAuth.ts
//
// Manejo de tokens de autenticación de Mercado Libre.
// Devuelve siempre un access token válido y renueva automáticamente
// usando el refresh token cuando haga falta.

import { loadTokens, saveTokens, StoredTokens } from "./tokenStorage"

const APP_ID = process.env.MELI_APP_ID!
const APP_SECRET = process.env.MELI_APP_SECRET!
const OAUTH_URL = "https://api.mercadolibre.com/oauth/token"

// Fallback inicial desde .env, por si la hoja todavía no tiene datos
const ENV_ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN
const ENV_REFRESH_TOKEN = process.env.MELI_REFRESH_TOKEN

// Promesa global para evitar múltiples refresh en paralelo
let refreshPromise: Promise<StoredTokens> | null = null

async function refreshAccessToken(old: StoredTokens): Promise<StoredTokens> {
  console.log("[meliAuth] 🔄 Renovando token de Mercado Libre...")

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
    console.error("[meliAuth] ❌ Error al refrescar token:", await res.text())
    throw new Error("No se pudo refrescar el token de Mercado Libre")
  }

  const json = await res.json()

  const expiresIn = Number(json.expires_in) || 21600 // segundos (~6 hs)

  const tokens: StoredTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  await saveTokens(tokens)

  console.log("[meliAuth] ✅ Token renovado correctamente.")
  return tokens
}

/**
 * Devuelve un access token válido para Mercado Libre.
 * - Intenta leer de la hoja (Apps Script).
 * - Si no hay nada, usa .env (MELI_ACCESS_TOKEN / MELI_REFRESH_TOKEN) y
 *   inicializa la hoja automáticamente.
 * - Si el token sigue siendo válido → lo devuelve.
 * - Si está por vencer / vencido → lo renueva con el refresh token.
 * - Si hay otro refresh en curso → espera esa misma promesa.
 */
export async function getValidAccessToken(): Promise<string> {
  let current = await loadTokens()

  // 🔁 Fallback: si no hay tokens en la hoja, intentamos inicializar desde .env
  if (!current) {
    if (ENV_ACCESS_TOKEN && ENV_REFRESH_TOKEN) {
      console.warn(
        "[meliAuth] No había tokens en la hoja. Inicializando desde variables de entorno..."
      )

      current = {
        accessToken: ENV_ACCESS_TOKEN,
        refreshToken: ENV_REFRESH_TOKEN,
        // Le damos 5 minutos de vida inicial para forzar un refresh pronto
        expiresAt: Date.now() + 5 * 60 * 1000,
      }

      // Guardamos estos tokens en la hoja para futuras lecturas
      await saveTokens(current)
    } else {
      throw new Error(
        "[meliAuth] No hay tokens guardados ni en la hoja ni en .env. Verificá meli_tokens (fila 2) y las env MELI_ACCESS_TOKEN / MELI_REFRESH_TOKEN."
      )
    }
  }

  const margin = 60 * 1000 // 1 minuto de margen
  const stillValid = Date.now() < current.expiresAt - margin

  if (stillValid) {
    return current.accessToken
  }

  // Si ya hay un refresh en curso, esperamos ese
  if (refreshPromise) {
    const updated = await refreshPromise
    return updated.accessToken
  }

  // Lanzamos un solo refresh y compartimos la misma promesa
  refreshPromise = refreshAccessToken(current).finally(() => {
    refreshPromise = null
  })

  const updated = await refreshPromise
  return updated.accessToken
}
