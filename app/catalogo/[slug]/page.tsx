// app/catalogo/[slug]/page.tsx
import { fetchVehicleBySlug, fetchVehicles } from '../../../lib/fetchVehicles'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) {
    notFound()
  }

  // build gallery of images
  const images: string[] = []
  if (Array.isArray(vehicle!.pictures)) {
    for (const pic of vehicle!.pictures) {
      const url: string | undefined = (pic as any).secure_url || pic.url
      if (url) images.push(url)
    }
  }
  if (images.length === 0 && vehicle!.thumbnail) {
    images.push(vehicle!.thumbnail)
  }

  // recommended vehicles excluding current
  const all = await fetchVehicles()
  const recommended = all.filter((v) => v.slug !== params.slug).slice(0, 3)

  const whatsappNumber = process.env.NEXT_PUBLIC_WAPP
  const whatsappHref =
    whatsappNumber &&
    `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hola,%20estoy%20interesado%20en%20${encodeURIComponent(
      vehicle!.title || ''
    )}`

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          {images.length > 0 && (
            <Image
              src={images[0]}
              alt={vehicle!.title || ''}
              width={960}
              height={640}
              className="rounded-xl w-full h-auto object-cover"
            />
          )}
          {images.length > 1 && (
            <div className="flex overflow-x-auto mt-2 space-x-2">
              {images.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`${vehicle!.title || ''} imagen ${i + 1}`}
                  width={320}
                  height={240}
                  className="rounded-lg flex-none object-cover"
                />
              ))}
            </div>
          )}
        </div>
        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{vehicle!.title}</h1>
          {vehicle!.price && (
            <p className="text-2xl text-green-700">
              ${Intl.NumberFormat('es-AR').format(vehicle!.price)}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {vehicle!.brand && (
              <li>
                <strong>Marca:</strong> {vehicle!.brand}
              </li>
            )}
            {vehicle!.model && (
              <li>
                <strong>Modelo:</strong> {vehicle!.model}
              </li>
            )}
            {vehicle!.year && (
              <li>
                <strong>Año:</strong> {vehicle!.year}
              </li>
            )}
            {vehicle!.km && (
              <li>
                <strong>Kilometraje:</strong> {vehicle!.km} km
              </li>
            )}
            {vehicle!.Color && (
              <li>
                <strong>Color:</strong> {vehicle!.Color}
              </li>
            )}
            {vehicle!.Caja && (
              <li>
                <strong>Transmisión:</strong> {vehicle!.Caja}
              </li>
            )}
            {vehicle!.Motor && (
              <li>
                <strong>Motor:</strong> {vehicle!.Motor}
              </li>
            )}
            {vehicle!.Puertas && (
              <li>
                <strong>Puertas:</strong> {vehicle!.Puertas}
              </li>
            )}
          </ul>
          <div className="flex flex-wrap gap-3 pt-4">
            {/* WhatsApp button */}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded shadow"
              >
                Consultar
              </a>
            )}
            {/* Mercado Libre link */}
            {vehicle!.permalink && (
              <a
                href={vehicle!.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-4 py-2 rounded shadow"
              >
                Ver en Mercado Libre
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Recommendations section */}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recomendados</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommended.map((v) => {
              const thumb =
                v.thumbnail ||
                (Array.isArray(v.pictures) && v.pictures[0]
                  ? (v.pictures[0] as any).secure_url || v.pictures[0].url
                  : '') ||
                '/no-image.png'
              return (
                <Link
                  key={v.slug}
                  href={`/catalogo/${v.slug}`}
                  className="block border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={v.title || ''}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-2 space-y-1">
                    <h3 className="font-medium truncate">{v.title}</h3>
                    {v.price && (
                      <p className="text-sm text-gray-600">
                        ${Intl.NumberFormat('es-AR').format(v.price)}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
