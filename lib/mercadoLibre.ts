// lib/mercadoLibre.ts
import { ensureFreshAccessToken } from './meliAuth'

const BASE_URL = 'https://api.mercadolibre.com'

/** Lista de IDs de publicaciones activas del vendedor */
export async function listActiveItems(): Promise<string[]> {
  const userId = process.env.MELI_USER_ID
  if (!userId) throw new Error('Falta MELI_USER_ID')
  const accessToken = await ensureFreshAccessToken()

  const url = `${BASE_URL}/users/${userId}/items/search?status=active`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // En server runtime no cacheamos; el ISR lo gestionás en tus páginas
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`No se pudieron obtener los ítems activos: ${res.status}`)
  }
  const data = await res.json()
  return (data.results as string[]) || []
}

/** Detalle de un ítem */
export async function getItem(itemId: string) {
  const accessToken = await ensureFreshAccessToken()
  const url = `${BASE_URL}/items/${itemId}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`Error al obtener el ítem ${itemId}: ${res.status}`)
  }
  return res.json()
}

/** Descripción larga del aviso */
export async function getItemDescription(id: string, token?: string) {
  const accessToken = token ?? await ensureFreshAccessToken()
  const res = await fetch(`${BASE_URL}/items/${id}/description`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 }, // cache revalidable para no pegarle siempre
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data.plain_text || ''
}

/**
 * Mapea un ítem de ML a tu modelo interno Vehicle
 */
export function transformItemToVehicle(item: any) {
  const attrMap: Record<string, any> = {}
  if (Array.isArray(item.attributes)) {
    for (const attr of item.attributes) {
      const id = String(attr.id || '')
      const name = String(attr.name || '')
      const value = attr.value_name
      if (!value) continue
      if (id) attrMap[id] = value
      if (name) attrMap[name] = value
    }
  }

  const title: string = item.title || ''
  const brand = attrMap.BRAND || attrMap.Marca || title.split(' ')[0]
  const model = attrMap.MODEL || attrMap.Modelo || attrMap.Model || ''
  const version = attrMap.TRIM || attrMap.Version || ''
  const year = attrMap.YEAR || attrMap.Año || ''
  const km = attrMap.KM || attrMap.Kilometraje || attrMap['Kilometraje'] || ''
  const color = attrMap.COLOR || attrMap.Color || ''
  const transmission = attrMap.CAJA || attrMap.Caja || attrMap['Transmisión'] || ''
  const motor = attrMap.MOTOR || attrMap.Motor || ''
  const price = item.price != null ? item.price : undefined

  let image = ''
  if (Array.isArray(item.pictures) && item.pictures.length > 0) {
    image = item.pictures[0].secure_url || item.pictures[0].url || ''
  } else if (item.thumbnail) {
    image = item.thumbnail
  }

  return {
    id: item.id,
    slug: '', // lo completa vehicleToSlug en fetchVehicles
    Unidad: brand,
    Marca: brand,
    Modelo: model,
    Version: version,
    Año: year,
    KM: km,
    Color: color,
    Caja: transmission,
    Motor: motor,
    Precio: price != null ? String(price) : '',
    Imagen: image,
    // claves que usa tu UI
    title: item.title || '',
    price: typeof price === 'number' ? price : undefined,
    brand: brand || '',
    model: model || '',
    year: year || '',
    km: km || '',
    thumbnail: image || '',
    pictures: Array.isArray(item.pictures) ? item.pictures : undefined,
    permalink: item.permalink || '',
    ...attrMap,
  }
}
