// lib/fetchVehicles.ts
// API de Mercado Libre
import { listActiveItems, getItem, transformItemToVehicle } from "./mercadoLibre"

// Tipos
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
  /** Título descriptivo del vehículo (ej: "Ford Fiesta 1.6 S") */
  title?: string
  /** Precio numérico del vehículo (en la moneda local) */
  price?: number
  /** Marca del vehículo (usada por VehicleCard) */
  brand?: string
  /** Modelo del vehículo (usada por VehicleCard) */
  model?: string
  /** Año del vehículo (usada por VehicleCard) */
  year?: string
  /** Kilometraje del vehículo (usada por VehicleCard) */
  km?: string
  /** URL de la imagen miniatura del vehículo */
  thumbnail?: string
  /** Lista de fotos del vehículo proporcionada por la API */
  pictures?: any[]
  /** Enlace permanente a la publicación en Mercado Libre */
  permalink?: string
  [k: string]: any
}

// ENV
const MELI_USER_ID = process.env.MELI_USER_ID
const MELI_ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN

/**
 * Intenta obtener los vehículos desde la API de Mercado Libre.
 * Si hay error o faltan credenciales, lanza para que el caller haga fallback.
 */
async function fetchFromMeli(): Promise<Vehicle[]> {
  if (!(MELI_USER_ID && MELI_ACCESS_TOKEN)) {
    throw new Error("Faltan credenciales MELI")
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
 * API pública del módulo
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  // Sólo intenta con Mercado Libre; si faltan credenciales o hay error devuelve array vacío
  try {
    return await fetchFromMeli()
  } catch (err) {
    console.warn("[fetchVehicles] Error obteniendo vehículos desde Mercado Libre:", err)
    return []
  }
}

export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) ?? null
}
