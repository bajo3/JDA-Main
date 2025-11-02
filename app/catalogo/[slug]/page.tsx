// app/catalogo/[slug]/page.tsx
import { fetchVehicleBySlug, fetchVehicles } from '../../../lib/fetchVehicles'
import { getItemDescription } from '../../../lib/mercadoLibre'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

/** SEO dinámico */
export async function generateMetadata({ params }: PageProps) {
  const v = await fetchVehicleBySlug(params.slug)
  if (!v) return { title: 'Vehículo no encontrado' }
  const dealer = process.env.DEALER_NAME ?? 'Concesionaria'
  const title = `${v.title || `${v.brand ?? ''} ${v.model ?? ''} ${v.year ?? ''}`}`.trim() + ` | ${dealer}`
  const description = [
    v.brand, v.model, v.Version, v.year && `${v.year}`, v.km && `${v.km} km`
  ].filter(Boolean).join(' • ')
  const og = v.thumbnail
    || (Array.isArray(v.pictures) && v.pictures[0] && ((v.pictures[0] as any).secure_url || v.pictures[0].url))
    || ''

  return {
    title,
    description,
    openGraph: { title, description, images: og ? [og] : [] },
    twitter: { card: 'summary_large_image', title, description, images: og ? [og] : [] }
  }
}

/** Prebuild estático de rutas */
export async function generateStaticParams() {
  const list = await fetchVehicles()
  return list.map(v => ({ slug: v.slug }))
}

/** Helper specs (omite vacíos) */
function Row({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === '') return null
  return (
    <li className="flex justify-between py-1 border-b last:border-0">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  )
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) notFound()

  // Galería
  const images: string[] = []
  if (Array.isArray(vehicle!.pictures)) {
    for (const pic of vehicle!.pictures) {
      const url: string | undefined = (pic as any).secure_url || (pic as any).url
      if (url) images.push(url)
    }
  }
  if (images.length === 0 && vehicle!.thumbnail) images.push(vehicle!.thumbnail)

  // Recomendados: misma marca; si no hay, fallback a cualquiera
  const all = await fetchVehicles()
  let recommended = all
    .filter(v => v.slug !== params.slug)
    .filter(v => vehicle!.brand ? v.brand === vehicle!.brand : true)

  if (recommended.length < 3) {
    const fallback = all.filter(v => v.slug !== params.slug)
    const set = new Map<string, boolean>()
    // agregar sin duplicar
    for (const v of [...recommended, ...fallback]) {
      if (!set.has(v.slug)) {
        set.set(v.slug, true)
      }
    }
    recommended = Array.from(set.keys())
      .map(slug => all.find(v => v.slug === slug)!)
  }
  recommended = recommended.slice(0, 3)

  // WhatsApp
  const whatsappNumber = process.env.NEXT_PUBLIC_WAPP
  const whatsappHref =
    whatsappNumber &&
    `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
      `Hola, vi ${vehicle!.title ?? `${vehicle!.brand ?? ''} ${vehicle!.model ?? ''}`} en la web. ¿Sigue disponible?`
    )}&utm_source=web&utm_medium=cta&utm_campaign=detalle_vehiculo`

  // Descripción larga desde ML (si hay token)
  let description = ''
  if (process.env.MELI_ACCESS_TOKEN) {
    try {
      description = await getItemDescription(vehicle!.id, process.env.MELI_ACCESS_TOKEN!)
    } catch { /* noop */ }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">

      {/* Breadcrumbs */}
      <nav className="text-sm">
        <Link href="/catalogo" className="text-green-700 hover:underline">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="opacity-70">{vehicle!.brand} {vehicle!.model}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Galería */}
        <div>
          {images.length > 0 && (
            <Image
              src={images[0]}
              alt={vehicle!.title || ''}
              width={1200}
              height={800}
              priority
              sizes="(min-width: 1024px) 800px, 100vw"
              className="rounded-xl w-full h-auto object-cover"
            />
          )}
          {images.length > 1 && (
            <div className="flex overflow-x-auto mt-3 gap-2">
              {images.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded overflow-hidden border opacity-90 hover:opacity-100"
                  aria-label={`Abrir imagen ${i + 1}`}
                >
                  <Image src={src} alt="" width={128} height={96} className="object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">{vehicle!.title}</h1>

          {vehicle!.price && (
            <p className="text-2xl text-green-700">
              ${Intl.NumberFormat('es-AR').format(vehicle!.price)}
            </p>
          )}

          <ul className="text-sm divide-y rounded-xl border p-3">
            <Row label="Marca" value={vehicle!.brand} />
            <Row label="Modelo" value={vehicle!.model} />
            <Row label="Versión" value={vehicle!.Version as any} />
            <Row label="Año" value={vehicle!.year} />
            <Row label="Kilometraje" value={vehicle!.km ? `${vehicle!.km} km` : ''} />
            <Row label="Transmisión" value={vehicle!.Caja as any} />
            <Row label="Motor" value={vehicle!.Motor as any} />
            <Row label="Color" value={vehicle!.Color as any} />
            <Row label="Puertas" value={vehicle!.Puertas as any} />
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Consultar por WhatsApp
              </a>
            )}
            {vehicle!.permalink && (
              <a
                href={vehicle!.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
              >
                Ver en Mercado Libre
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Descripción larga */}
      {description && (
        <details className="rounded-xl border p-4">
          <summary className="cursor-pointer font-semibold">Descripción</summary>
          <p className="whitespace-pre-wrap mt-3 opacity-90">{description}</p>
        </details>
      )}

      {/* Recomendados */}
      {recommended.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recomendados</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommended.map((v) => {
              const thumb =
                v.thumbnail ||
                (Array.isArray(v.pictures) && v.pictures[0]
                  ? (v.pictures[0] as any).secure_url || (v.pictures[0] as any).url
                  : '') ||
                '/no-image.png'
              return (
                <Link
                  key={v.slug}
                  href={`/catalogo/${v.slug}`}
                  prefetch={false}
                  className="block border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={v.title || ''}
                      width={480}
                      height={320}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3 space-y-1">
                    <h3 className="font-medium line-clamp-1">{v.title}</h3>
                    {v.price && (
                      <p className="text-sm opacity-80">
                        ${Intl.NumberFormat('es-AR').format(v.price)}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Sticky CTA (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">
            {vehicle!.price && <>${Intl.NumberFormat('es-AR').format(vehicle!.price)}</>}
          </div>
          <div className="flex gap-2">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener" className="bg-green-600 text-white px-3 py-2 rounded-lg">
                WhatsApp
              </a>
            )}
            {vehicle!.permalink && (
              <a href={vehicle!.permalink} target="_blank" rel="noopener" className="bg-purple-600 text-white px-3 py-2 rounded-lg">
                Ver ML
              </a>
            )}
          </div>
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Vehicle",
            "name": vehicle!.title,
            "brand": vehicle!.brand,
            "model": vehicle!.model,
            "vehicleModelDate": vehicle!.year,
            "mileageFromOdometer": vehicle!.km ? {
              "@type": "QuantitativeValue",
              "value": vehicle!.km,
              "unitCode": "KMT"
            } : undefined,
            "image": images,
            "offers": vehicle!.price ? {
              "@type": "Offer",
              "priceCurrency": "ARS",
              "price": vehicle!.price,
              "availability": "https://schema.org/InStock",
              "url": "" // no ponemos window en server, lo llena el crawler con la canonical
            } : undefined,
            "url": ""
          })
        }}
      />
    </div>
  )
}
