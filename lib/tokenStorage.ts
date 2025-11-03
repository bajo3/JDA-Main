// lib/tokenStorage.ts

export type StoredTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number // Date.now() en ms
}

const TOKENS_API_URL = process.env.MELI_TOKENS_API_URL
const TOKENS_API_KEY = process.env.MELI_TOKENS_API_KEY

export async function loadTokens(): Promise<StoredTokens | null> {
  if (!TOKENS_API_URL || !TOKENS_API_KEY) {
    console.error(
      "[tokenStorage] Faltan MELI_TOKENS_API_URL o MELI_TOKENS_API_KEY en las env."
    )
    return null
  }

  const url = `${TOKENS_API_URL}?key=${encodeURIComponent(TOKENS_API_KEY)}`

  const res = await fetch(url, { cache: "no-store" })

  if (!res.ok) {
    console.error(
      "[tokenStorage] Error al leer tokens:",
      res.status,
      await res.text()
    )
    return null
  }

  const json = await res.json()

  if ((json as any).error === "NO_TOKENS") {
    console.error("[tokenStorage] NO_TOKENS en la hoja")
    return null
  }

  if (!json.accessToken || !json.refreshToken || !json.expiresAt) {
    console.error("[tokenStorage] Respuesta inválida de tokens:", json)
    return null
  }

  return {
    accessToken: String(json.accessToken),
    refreshToken: String(json.refreshToken),
    expiresAt: Number(json.expiresAt),
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  if (!TOKENS_API_URL || !TOKENS_API_KEY) {
    console.error(
      "[tokenStorage] Faltan MELI_TOKENS_API_URL o MELI_TOKENS_API_KEY en las env."
    )
    return
  }

  const res = await fetch(TOKENS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: TOKENS_API_KEY,
      tokens,
    }),
  })

  if (!res.ok) {
    console.error(
      "[tokenStorage] Error al guardar tokens:",
      res.status,
      await res.text()
    )
  }
}
