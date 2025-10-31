import Image from 'next/image'
import type { Vehicle } from '../lib/fetchVehicles'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const img = vehicle.pictures?.[0]?.url || vehicle.thumbnail
  return (
    <article className="rounded-2xl shadow p-3">
      {img && (
        <Image
          src={img}
          alt={vehicle.title}
          width={640}
          height={420}
          className="rounded-xl w-full h-auto object-cover"
        />
      )}
      <h3 className="mt-2 text-lg font-semibold">{vehicle.title}</h3>
      <p className="opacity-80">
        ${Intl.NumberFormat('es-AR').format(vehicle.price || 0)}
      </p>
      <a href={vehicle.permalink} target="_blank" className="text-green-500 underline">
        Ver en Mercado Libre
      </a>
      <div className="text-sm opacity-70 mt-1">
        {[vehicle.brand, vehicle.model, vehicle.year, vehicle.km && `${vehicle.km} km`]
          .filter(Boolean)
          .join(' • ')}
      </div>
    </article>
  )
}
