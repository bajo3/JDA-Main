// lib/fetchVehicles.ts
import Papa from "papaparse"

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
  [k: string]: any
}

// ENV
const CSV_URL = process.env.SHEET_CSV_URL
const MELI_USER_ID = process.env.MELI_USER_ID
const MELI_ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN

// Normaliza claves del CSV (trim)
const normalizeRow = (row: any) => {
  const normalized: any = {}
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim()
    normalized[cleanKey] = row[key]
  }
  return normalized
}

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
 * Fallback CSV (Google Sheets publicado como CSV).
 * Si falta la env o falla el fetch, devuelve [] (no rompe la build).
 */
async function fetchFromCsv(): Promise<Vehicle[]> {
  if (!CSV_URL) {
    console.warn("[fetchVehicles] SHEET_CSV_URL no configurada. Devolviendo [].")
    return []
  }

  const res = await fetch(CSV_URL, { next: { revalidate: 3600 } })
  if (!res.ok) {
    console.warn("[fetchVehicles] No se pudo descargar el CSV. Devolviendo [].")
    return []
  }

  const text = await res.text()
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  const rows = (parsed.data as any[]).map(normalizeRow)

  const { vehicleToSlug } = await import("./slug")
  const vehicles = rows.map((r, i) => ({
    id: String(i + 1),
    slug: vehicleToSlug(r, i),
    ...r,
  }))

  return vehicles as Vehicle[]
}

/**
 * API pública del módulo
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  // 1) Intentá con Mercado Libre si hay credenciales
  if (MELI_USER_ID && MELI_ACCESS_TOKEN) {
    try {
      return await fetchFromMeli()
    } catch (err) {
      console.warn("[fetchVehicles] Error MELI, haciendo fallback a CSV:", err)
    }
  }

  // 2) Fallback CSV (o [])
  return await fetchFromCsv()
}

export async function fetchVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await fetchVehicles()
  return list.find((v) => v.slug === slug) ?? null
}
