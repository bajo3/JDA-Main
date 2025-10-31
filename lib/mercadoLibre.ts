// Nota: no se usa `headers` aquí; podría importarse si necesitas leer
// cabeceras de las peticiones entrantes en un endpoint de API.

/*
 * Cliente sencillo para la API de Mercado Libre.
 * Utiliza el token de acceso y el ID de usuario definidos en variables
 * de entorno para realizar consultas autenticadas.  Si necesitas más
 * funciones (por ejemplo, registrar webhooks), crea funciones
 * adicionales siguiendo este patrón.
 */

const BASE_URL = 'https://api.mercadolibre.com'

/**
 * Devuelve la lista de IDs de publicaciones activas de un vendedor.
 */
export async function listActiveItems (): Promise<string[]> {
  const userId = process.env.MELI_USER_ID
  const accessToken = process.env.MELI_ACCESS_TOKEN
  if (!userId || !accessToken) {
    throw new Error('Faltan variables de entorno MELI_USER_ID o MELI_ACCESS_TOKEN')
  }
  const url = `${BASE_URL}/users/${userId}/items/search?status=active`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // evita revalidar en tiempo de compilación; la ISR se controla en fetchVehicles
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`No se pudieron obtener los ítems activos: ${res.status}`)
  }
  const data = await res.json()
  return (data.results as string[]) || []
}

/**
 * Obtiene el detalle de una publicación de Mercado Libre.
 * Las respuestas incluyen título, precio, imágenes y atributos.
 */
export async function getItem (itemId: string) {
  const accessToken = process.env.MELI_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('La variable de entorno MELI_ACCESS_TOKEN no está definida')
  }
  const url = `${BASE_URL}/items/${itemId}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`Error al obtener el ítem ${itemId}: ${res.status}`)
  }
  return res.json()
}

/**
 * Convierte un ítem de Mercado Libre en el formato interno `Vehicle`.
 * Intenta mapear algunos atributos comunes (Marca, Modelo, Año, KM, Color, etc.),
 * pero también copia todos los atributos como claves adicionales.
 */
export function transformItemToVehicle (item: any) {
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
  // algunos campos habituales se extraen de attributes o del título
  const title: string = item.title || ''
  // usar el primer término del título como marca si no hay BRAND
  const brand = attrMap.BRAND || attrMap.Marca || title.split(' ')[0]
  // intentar obtener modelo y versión
  const model = attrMap.MODEL || attrMap.Modelo || attrMap.Model || ''
  const version = attrMap.TRIM || attrMap.Version || ''
  const year = attrMap.YEAR || attrMap.Año || ''
  const km = attrMap.KM || attrMap.Kilometraje || attrMap['Kilometraje'] || ''
  const color = attrMap.COLOR || attrMap.Color || ''
  const transmission = attrMap.CAJA || attrMap.Caja || attrMap['Transmisión'] || ''
  const motor = attrMap.MOTOR || attrMap.Motor || ''
  // precio y moneda
  const price = item.price != null ? item.price.toString() : ''
  // imagen principal
  let image = ''
  if (Array.isArray(item.pictures) && item.pictures.length > 0) {
    // usar secure_url si está disponible
    image = item.pictures[0].secure_url || item.pictures[0].url || ''
  } else if (item.thumbnail) {
    image = item.thumbnail
  }
  return {
    id: item.id,
    slug: '', // se completará más tarde con vehicleToSlug
    Unidad: brand,
    Marca: brand,
    Modelo: model,
    Version: version,
    Año: year,
    KM: km,
    Color: color,
    Caja: transmission,
    Motor: motor,
    Precio: price,
    Imagen: image,
    ...attrMap,
  }
}