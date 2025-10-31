import Papa from 'papaparse'

// Importamos las funciones para interactuar con la API de Mercado Libre.
import { listActiveItems, getItem, transformItemToVehicle } from './mercadoLibre'

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
  [k: string]: any
}

const CSV_URL = process.env.SHEET_CSV_URL

// variables de entorno para Mercado Libre
const MELI_USER_ID = process.env.MELI_USER_ID
const MELI_ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN

const normalizeRow = (row: any) => {
  const normalized: any = {}
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim()
    normalized[cleanKey] = row[key]
  }
  return normalized
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  // Si hay credenciales de Mercado Libre, priorizar la API para obtener vehículos
  if (MELI_USER_ID && MELI_ACCESS_TOKEN) {
    try {
      const ids = await listActiveItems()
      const { vehicleToSlug } = await import('./slug')
      const items = await Promise.all(ids.map(id => getItem(id)))
      const vehicles = items.map((item, idx) => {
        const base = transformItemToVehicle(item)
        // genera slug a partir de la información disponible
        const slug = vehicleToSlug(base, idx)
        return { ...base, slug }
      })
      return vehicles as Vehicle[]
    } catch (err) {
      console.error('Error al obtener vehículos desde Mercado Libre:', err)
      // si ocurre un error, continuar con el método CSV como respaldo
    }
  }

  // Fallback: CSV de Google Sheets
  if (!CSV_URL) throw new Error('SHEET_CSV_URL no está configurada en .env.local')
  const res = await fetch(CSV_URL, { next: { revalidate: 3600 } }) // ISR
  if (!res.ok) throw new Error('No se pudo descargar el CSV')
  const text = await res.text()
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  const rows = (parsed.data as any[]).map(normalizeRow)
  const { vehicleToSlug } = await import('./slug')
  const vehicles = rows.map((r, i) => ({
    id: String(i + 1),
    slug: vehicleToSlug(r, i),
    ...r,
  }))
  return vehicles as Vehicle[]
}

export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find(v => v.slug === slug) ?? null
}
