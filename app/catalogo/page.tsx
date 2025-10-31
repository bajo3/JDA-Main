// app/catalogo/page.tsx
import Link from 'next/link'
import { fetchVehicles } from '../../lib/fetchVehicles'     // 👈 antes era '@/lib/fetchVehicles'
import { VehicleCard } from '../../components/VehicleCard'  // 👈 antes era '@/components/VehicleCard'

export const revalidate = 3600

export default async function CatalogoPage() {
  const vehicles = await fetchVehicles()
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  )
}
