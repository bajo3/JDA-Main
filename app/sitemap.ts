import type { MetadataRoute } from 'next'
import { fetchVehicles } from '@/lib/fetchVehicles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://example.com'
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/nosotros`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]
  try {
    const vehicles = await fetchVehicles()
    vehicles.forEach(v => items.push({ url: `${base}/vehiculos/${v.slug}`, changeFrequency: 'daily', priority: 0.8 }))
  } catch {}
  return items
}
