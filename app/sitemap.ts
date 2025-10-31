import type { MetadataRoute } from "next"
import { fetchVehicles } from "@/lib/fetchVehicles"

export const dynamic = "force-dynamic" // evita fallos en build si faltan datos

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

  // Páginas estáticas principales
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contacto`, changeFrequency: "monthly", priority: 0.5 },
  ]

  try {
    const vehicles = await fetchVehicles()

    if (vehicles.length > 0) {
      vehicles.forEach((v) => {
        // Evita URLs inválidas si el slug está vacío o indefinido
        if (!v.slug) return
        items.push({
          url: `${base}/vehiculos/${v.slug}`,
          changeFrequency: "daily",
          priority: 0.8,
          lastModified: new Date(),
        })
      })
    } else {
      console.warn("[sitemap] Sin vehículos disponibles, usando solo páginas base.")
    }
  } catch (err) {
    console.warn("[sitemap] Error generando sitemap:", err)
  }

  return items
}
  