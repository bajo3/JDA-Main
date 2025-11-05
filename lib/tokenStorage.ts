// lib/tokenStorage.ts
//
// Encapsula el acceso al Apps Script que guarda/lee los tokens de Mercado Libre.

export type StoredTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const API_URL = process.env.MELI_TOKENS_API_URL
const API_KEY = process.env.MELI_TOKENS_API_KEY

if (!API_URL || !API_KEY) {
  console.warn(
    "[tokenStorage] Faltan MELI_TOKENS_API_URL o MELI_TOKENS_API_KEY en .env.local"
  )
}

export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    if (!API_URL || !API_KEY) {
      console.error(
        "[tokenStorage] No se puede cargar tokens: faltan env MELI_TOKENS_API_URL / MELI_TOKENS_API_KEY"
      )
      return null
    }

    const url = `${API_URL}?key=${encodeURIComponent(API_KEY)}`
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    })

    const text = await res.text()

    if (!res.ok) {
      console.error(
        "[tokenStorage] Respuesta no OK al leer tokens:",
        res.status,
        text.slice(0, 200)
      )
      return null
    }

    let json: any
    try {
      json = JSON.parse(text)
    } catch (err) {
      console.error(
        "[tokenStorage] Respuesta no es JSON válido, llegó HTML o algo raro:",
        text.slice(0, 200)
      )
      return null
    }

    if (json.error) {
      console.error("[tokenStorage] Error desde Apps Script:", json.error)
      return null
    }

    if (!json.accessToken || !json.refreshToken || typeof json.expiresAt !== "number") {
      console.error("[tokenStorage] JSON de tokens inválido:", json)
      return null
    }

    return {
      accessToken: String(json.accessToken),
      refreshToken: String(json.refreshToken),
      expiresAt: Number(json.expiresAt),
    }
  } catch (err) {
    console.error("[tokenStorage] Error cargando tokens:", err)
    return null
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  try {
    if (!API_URL || !API_KEY) {
      console.error(
        "[tokenStorage] No se puede guardar tokens: faltan env MELI_TOKENS_API_URL / MELI_TOKENS_API_KEY"
      )
      return
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: API_KEY,
        tokens,
      }),
    })

    const text = await res.text()

    if (!res.ok) {
      console.error(
        "[tokenStorage] Error HTTP guardando tokens:",
        res.status,
        text.slice(0, 200)
      )
    }
  } catch (err) {
    console.error("[tokenStorage] Error guardando tokens:", err)
  }
}
