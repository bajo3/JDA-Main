// lib/fetchVehicles.ts
import { listActiveItems, getItem, transformItemToVehicle } from "./mercadoLibre"
import { vehicleToSlug } from "./slug"
import { unstable_cache } from "next/cache"

export type Vehicle = {
  id: string
  slug: string
  title?: string
  brand?: string
  model?: string
  Version?: string
  year?: string | number
  km?: string | number
  Color?: string
  Motor?: string
  Caja?: string
  Puertas?: string | number
  price?: number
  thumbnail?: string
  pictures?: { url: string; secure_url?: string }[]
  permalink?: string
}

/**
 * Obtiene los vehículos activos desde la API de Mercado Libre.
 * Aplica caché del lado del servidor para mejorar la performance.
 */
async function fetchFromMeli(): Promise<Vehicle[]> {
  const items = await listActiveItems()
  const vehicles: Vehicle[] = []

  for (let i = 0; i < items.length; i++) {
    const itemId = items[i]
    try {
      const data = await getItem(itemId)
      const v = transformItemToVehicle(data)
      vehicles.push({
        ...v,
        // le pasamos también el índice para cumplir con la firma de vehicleToSlug
        slug: vehicleToSlug(v, i),
      })
    } catch (err) {
      console.error("❌ Error cargando item:", itemId, err)
    }
  }

  return vehicles
}

// ⚡ Cachea los resultados durante 10 minutos (600 segundos)
export const fetchVehicles = unstable_cache(
  async () => {
    const list = await fetchFromMeli()
    return list
  },
  ["meli-vehicles-cache"],
  { revalidate: 600 }
)

/**
 * Busca un vehículo por su slug (usando los datos cacheados)
 */
export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) || null
}
