import Image from 'next/image'
import type { Vehicle } from '../lib/fetchVehicles'

function getImageUrl(v: Vehicle): string | null {
  const url =
    (v as any).pictures?.[0]?.url ||
    (v as any).thumbnail ||
    (v as any).Imagen ||
    null
  return typeof url === 'string' && url.length ? url : null
}

function getTitle(v: Vehicle): string {
  // Título seguro para alt y heading
  const composed = `${(v as any).Marca ?? ''} ${(v as any).Modelo ?? ''} ${(v as any).Año ?? ''}`.trim()
  return (v as any).title ?? (composed || 'Vehículo')
}

function getPrice(v: Vehicle): number {
  // Puede venir como string desde Sheets/ML; lo normalizamos
  const p = (v as any).price ?? (v as any).Precio ?? 0
  const n = Number(p)
  return Number.isFinite(n) ? n : 0
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const img = getImageUrl(vehicle)
  const title = getTitle(vehicle)
  const price = getPrice(vehicle)

  const brand = (vehicle as any).brand ?? (vehicle as any).Marca
  const model = (vehicle as any).model ?? (vehicle as any).Modelo
  const year = (vehicle as any).year ?? (vehicle as any).Año
  const km = (vehicle as any).km ?? (vehicle as any).KM

  return (
    <article className="rounded-2xl shadow p-3">
      {img && (
        <Image
          src={img}                // <- siempre string
          alt={title}              // <- siempre string
          width={640}
          height={420}
          className="rounded-xl w-full h-auto object-cover"
        />
      )}
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="opacity-80">
        ${Intl.NumberFormat('es-AR').format(price)}
      </p>
      {vehicle.permalink && (
        <a
          href={vehicle.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 underline"
        >
          Ver en Mercado Libre
        </a>
      )}
      <div className="text-sm opacity-70 mt-1">
        {[brand, model, year, km && `${km} km`].filter(Boolean).join(' • ')}
      </div>
    </article>
  )
}
