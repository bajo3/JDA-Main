// lib/fetchVehicles.ts
import { listActiveItems, getItem, transformItemToVehicle } from "./mercadoLibre"

export type Vehicle = {
  id: string
  slug: string
  Unidad?: string
  Marca?: string
  Modelo?: string
  Año?: string | number
  Version?: string
  Color?: string
  Caja?: string
  Motor?: string
  KM?: string | number
  Precio?: string | number
  Imagen?: string
  [k: string]: any
}

// ENV solo de Mercado Libre
const MELI_USER_ID = process.env.MELI_USER_ID
const MELI_ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN

/**
 * Obtiene los vehículos desde la API de Mercado Libre.
 * Si faltan credenciales o hay error, devuelve [] (no rompe el build).
 */
async function fetchFromMeli(): Promise<Vehicle[]> {
  if (!(MELI_USER_ID && MELI_ACCESS_TOKEN)) {
    console.warn("[fetchVehicles] Faltan credenciales MELI, devolviendo [].")
    return []
  }

  const ids = await listActiveItems()
  const { vehicleToSlug } = await import("./slug")
  const items = await Promise.all(ids.map((id) => getItem(id)))

  const vehicles = items.map((item, idx) => {
    const base = transformItemToVehicle(item)
    const slug = vehicleToSlug(base, idx)
    return { ...base, slug }
  })

  return vehicles as Vehicle[]
}

/**
 * API pública: siempre intenta usar MELI.
 * Si algo falla, devuelve [] para no romper ni el catálogo ni el sitemap.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    return await fetchFromMeli()
  } catch (err) {
    console.error("[fetchVehicles] Error obteniendo vehículos MELI:", err)
    return []
  }
}

export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) ?? null
}
