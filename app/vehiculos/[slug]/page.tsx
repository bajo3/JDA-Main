import Image from "next/image"
import Link from "next/link"
import { fetchVehicleBySlug } from "@/lib/fetchVehicles"

type Props = { params: { slug: string } }

/**
 * Incremental Static Regeneration:
 * Revalida cada 60s. Si no hay datos en build, no rompe (generateStaticParams retorna []).
 */
export const revalidate = 60

export async function generateStaticParams() {
  try {
    const { fetchVehicles } = await import("@/lib/fetchVehicles")
    const list = await fetchVehicles()
    return list
      .filter(v => v?.slug)
      .map(v => ({ slug: v.slug as string }))
  } catch {
    // Sin datos / error: no pre-generamos rutas, Next las servirá on-demand
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) {
    return { title: "Vehículo no encontrado" }
  }

  const title =
    `${vehicle.Unidad || vehicle.Marca || ""} ${vehicle.Modelo || ""} ${vehicle.Año || ""}`
      .replace(/\s+/g, " ")
      .trim()

  const description = `Oportunidad en ${title}. KM: ${vehicle.KM || "S/D"} · Precio: ${vehicle.Precio || "Consultar"}`
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const url = `${baseUrl}/vehiculos/${params.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function VehiclePage({ params }: Props) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) {
    return (
      <div className="space-y-6">
        <Link href="/catalogo">← Volver al catálogo</Link>
        <div className="card">No encontrado</div>
      </div>
    )
  }

  const title =
    `${vehicle.Unidad || vehicle.Marca || ""} ${vehicle.Modelo || ""} ${vehicle.Año || ""}`
      .replace(/\s+/g, " ")
      .trim()

  const phone = process.env.BUSINESS_WAPP || "+5492494000000"
  const msg = `Hola, me interesa el ${title} que vi en la web`
  const wapp = `https://wa.me/${phone.replace(/\D+/g, "")}?text=${encodeURIComponent(msg)}`

  const img =
    (vehicle as any).Imagen ||
    "/placeholder-vehicle.png" // asegurate de tener este archivo público

  return (
    <div className="space-y-6">
      <Link href="/catalogo">← Volver al catálogo</Link>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl bg-white/10">
            <Image
              src={img}
              alt={title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1>{title}</h1>

          <div className="card space-y-2 text-sm">
            {["Version", "Color", "Caja", "Motor", "KM", "Precio"].map((k) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="opacity-70">{k}</span>
                <span className="font-medium">{(vehicle as any)[k] || "—"}</span>
              </div>
            ))}
          </div>

          <a className="btn" href={wapp} target="_blank" rel="noreferrer">
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Vehicle",
            name: title,
            modelDate: vehicle.Año || undefined,
            brand: vehicle.Marca || vehicle.Unidad || undefined,
            mileageFromOdometer: vehicle.KM || undefined,
            vehicleTransmission: vehicle.Caja || undefined,
            color: vehicle.Color || undefined,
            offers: {
              "@type": "Offer",
              price: (vehicle.Precio || "")
                .toString()
                .replace(/[^0-9.,]/g, ""),
              priceCurrency: "ARS",
              availability: "https://schema.org/InStock",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com") + `/vehiculos/${params.slug}`,
            },
          }),
        }}
      />
    </div>
  )
}
