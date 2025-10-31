import Image from 'next/image'
import Link from 'next/link'
import { fetchVehicleBySlug } from '@/lib/fetchVehicles'

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  const { fetchVehicles } = await import('@/lib/fetchVehicles')
  const list = await fetchVehicles()
  return list.map(v => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: Props) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) return { title: 'Vehículo no encontrado' }
  const title = `${vehicle.Unidad || vehicle.Marca || ''} ${vehicle.Modelo || ''} ${vehicle.Año || ''}`.trim()
  const description = `Oportunidad en ${title}. KM: ${vehicle.KM || 'S/D'} · Precio: ${vehicle.Precio || 'Consultar'}`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function VehiclePage({ params }: Props) {
  const vehicle = await fetchVehicleBySlug(params.slug)
  if (!vehicle) return <div className="card">No encontrado</div>
  const title = `${vehicle.Unidad || vehicle.Marca || ''} ${vehicle.Modelo || ''} ${vehicle.Año || ''}`.trim()
  const phone = process.env.BUSINESS_WAPP || '+5492494000000'
  const msg = `Hola, me interesa el ${title} que vi en la web`
  const wapp = `https://wa.me/${phone.replace(/\D+/g,'')}?text=${encodeURIComponent(msg)}`
  const img = vehicle.Imagen || '/placeholder-vehicle.png'
  return (
    <div className="space-y-6">
      <Link href="/catalogo">← Volver al catálogo</Link>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl bg-white/10">
            <Image src={img} alt={title} fill style={{objectFit: 'cover'}} />
          </div>
        </div>
        <div className="space-y-4">
          <h1>{title}</h1>
          <div className="card space-y-2 text-sm">
            {['Version','Color','Caja','Motor','KM','Precio'].map((k) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="opacity-70">{k}</span>
                <span className="font-medium">{(vehicle as any)[k] || '—'}</span>
              </div>
            ))}
          </div>
          <a className="btn" href={wapp} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Vehicle',
          name: title,
          modelDate: vehicle.Año || undefined,
          brand: vehicle.Marca || vehicle.Unidad || undefined,
          mileageFromOdometer: vehicle.KM || undefined,
          vehicleTransmission: vehicle.Caja || undefined,
          color: vehicle.Color || undefined,
          offers: {
            '@type': 'Offer',
            price: (vehicle.Precio || '').toString().replace(/[^0-9.,]/g,''),
            priceCurrency: 'ARS',
            availability: 'https://schema.org/InStock'
          }
        }) }}
      />
    </div>
  )
}
