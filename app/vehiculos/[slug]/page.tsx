import Image from "next/image"
import Link from "next/link"
import { fetchVehicleBySlug, fetchVehicles } from "@/lib/fetchVehicles"

type Props = { params: { slug: string } }

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const list = await fetchVehicles()
    return list
      .filter(v => v?.slug)
      .map(v => ({ slug: v.slug as string }))
  } catch {
    // Si falla MELI en build, no rompe el build: no pre-generamos nada
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) {
    return { title: "Vehículo no encontrado" }
  }

  const v = vehicle as any

  const title = `${v.Unidad || v.Marca || v.brand || ""} ${
    v.Modelo || v.model || ""
  } ${v.Año || v.year || ""}`
    .replace(/\s+/g, " ")
    .trim()

  const description = `Oportunidad en ${title}. KM: ${
    v.KM ?? v.km ?? "S/D"
  } · Precio: ${v.Precio ?? v.price ?? "Consultar"}`

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
        <div className="card">Vehículo no encontrado</div>
      </div>
    )
  }

  const v = vehicle as any

  const title = `${v.Unidad || v.Marca || v.brand || ""} ${
    v.Modelo || v.model || ""
  } ${v.Año || v.year || ""}`
    .replace(/\s+/g, " ")
    .trim()

  // Unificamos número de WhatsApp
  const phone =
    process.env.NEXT_PUBLIC_WAPP || process.env.BUSINESS_WAPP || "+5492494000000"
  const msg = `Hola, me interesa el ${title} que vi en la web`
  const wapp = `https://wa.me/${phone.replace(
    /\D+/g,
    ""
  )}?text=${encodeURIComponent(msg)}`

  // Imagen principal: primero pictures, luego thumbnail/Imagen, luego placeholder
  const img =
    v.pictures?.[0]?.secure_url ||
    v.pictures?.[0]?.url ||
    v.thumbnail ||
    v.Imagen ||
    "/placeholder-vehicle.png"

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
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1>{title}</h1>

          <div className="card space-y-2 text-sm">
            {["Version", "Color", "Caja", "Motor", "KM", "Precio"].map(key => (
              <div key={key} className="flex justify-between gap-4">
                <span className="opacity-70">{key}</span>
                <span className="font-medium">
                  {v[key] ?? v[key.toLowerCase()] ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <a className="btn" href={wapp} target="_blank" rel="noreferrer">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
