// lib/fetchVehicles.ts
import { listActiveItems, getItem, transformItemToVehicle } from './mercadoLibre'
import { vehicleToSlug } from './slug'

// Definición del tipo Vehicle (igual que antes)
export type Vehicle = {
  id: string
  slug: string
  Marca?: string
  Unidad?: string
  Modelo?: string
  Version?: string
  Año?: string
  KM?: string
  Color?: string
  Caja?: string
  Motor?: string
  Precio?: string
  Imagen?: string
  title?: string
  price?: number
  brand?: string
  model?: string
  year?: string
  km?: string
  thumbnail?: string
  pictures?: any[]
  permalink?: string
  [k: string]: any
}

/**
 * Obtiene la lista de vehículos publicados en Mercado Libre.
 * Lanza un error si falta MELI_USER_ID.  No requiere MELI_ACCESS_TOKEN.
 */
async function fetchFromMeli(): Promise<Vehicle[]> {
  const userId = process.env.MELI_USER_ID
  if (!userId) {
    throw new Error('Falta MELI_USER_ID')
  }

  // 1) Obtener IDs activos
  const ids = await listActiveItems()
  if (!ids.length) return []

  // 2) Obtener cada publicación (paralelo)
  const items = await Promise.all(
    ids.map((id) =>
      getItem(id).catch(() => null) // ignora errores individuales
    )
  )

  // 3) Mapear al tipo Vehicle y asignar slug
  const vehicles: Vehicle[] = items
    .filter(Boolean)
    .map((item: any, idx: number) => {
      const base = transformItemToVehicle(item)
      const slug = vehicleToSlug(base, idx)
      return { ...base, slug }
    })

  // 4) Ordenar (ejemplo: por año desc)
  vehicles.sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
  return vehicles
}

/** API pública: devuelve vehículos o array vacío si ocurre un error. */
export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    return await fetchFromMeli()
  } catch (err) {
    console.warn('[fetchVehicles] Error obteniendo vehículos:', err)
    return []
  }
}

/** Devuelve un vehículo por su slug, o null si no se encuentra. */
export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) ?? null
}
