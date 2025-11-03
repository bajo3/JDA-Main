// lib/fetchVehicles.ts
import { listActiveItems, getItem, transformItemToVehicle } from "./mercadoLibre"
import { vehicleToSlug } from "./slug"

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

/**
 * Obtiene los vehículos desde la API de Mercado Libre.
 * Usa listActiveItems() + getItem() + transformItemToVehicle().
 * Si algo falla, devuelve [] (no rompe el catálogo ni el build).
 */
async function fetchFromMeli(): Promise<Vehicle[]> {
  try {
    const ids = await listActiveItems()
    if (!ids || ids.length === 0) {
      console.warn("[fetchFromMeli] No hay publicaciones activas.")
      return []
    }

    const items = await Promise.all(ids.map((id) => getItem(id)))

    const vehicles = items.map((item, index) => {
      const base = transformItemToVehicle(item)
      const slug = vehicleToSlug(base, index)
      return { ...base, slug }
    })

    return vehicles as Vehicle[]
  } catch (err) {
    console.error("[fetchFromMeli] Error obteniendo vehículos desde MELI:", err)
    return []
  }
}

/**
 * API pública: devuelve la lista de vehículos para el catálogo.
 * Hoy solo usa Mercado Libre.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  return fetchFromMeli()
}

/**
 * Busca un vehículo por slug (para la página de detalle /catalogo/[slug])
 */
export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) ?? null
}
