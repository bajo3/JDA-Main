import { notFound } from 'next/navigation'
import { fetchVehicleBySlug, fetchVehicles } from '../../../lib/fetchVehicles'
import { getItemDescription } from '../../../lib/mercadoLibre'
import VehicleDetailClient from './VehicleDetailClient'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const list = await fetchVehicles()
  return list.map(v => ({ slug: v.slug }))
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await fetchVehicleBySlug(params.slug)

  if (!vehicle) {
    notFound()
  }

  // Galería de imágenes
  const images: string[] = []
  if (Array.isArray(vehicle.pictures)) {
    for (const pic of vehicle.pictures) {
      const url = (pic as any).secure_url || (pic as any).url
      if (url) images.push(url)
    }
  }
  if (images.length === 0 && vehicle.thumbnail) {
    images.push(vehicle.thumbnail)
  }

  // Descripción desde Mercado Libre (solo servidor)
  let description = ''
  const accessToken = process.env.MELI_ACCESS_TOKEN

  if (accessToken && vehicle.id) {
    try {
      description = await getItemDescription(vehicle.id, accessToken)
    } catch (e) {
      console.error('Error obteniendo descripción ML:', e)
    }
  }

  // WhatsApp
  const whatsappNumber = process.env.NEXT_PUBLIC_WAPP
  const whatsappHref =
    whatsappNumber &&
    `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
      `Hola, vi ${vehicle.title ?? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`} en la web. ¿Sigue disponible?`
    )}`

  return (
    <VehicleDetailClient
      vehicle={vehicle}
      images={images}
      description={description}
      whatsappHref={whatsappHref || ''}
    />
  )
}
