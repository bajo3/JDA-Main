'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

function Row({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null
  return (
    <li className="flex justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100">{value}</span>
    </li>
  )
}

interface VehicleDetailClientProps {
  vehicle: any
  images: string[]
  description: string
  whatsappHref?: string
}

export default function VehicleDetailClient({
  vehicle,
  images,
  description,
  whatsappHref,
}: VehicleDetailClientProps) {
  const [index, setIndex] = useState(0)
  const dragStartX = useRef<number | null>(null)

  if (!vehicle) {
    return (
      <div className="text-center text-gray-400 mt-20">
        🚗 Vehículo no encontrado o fuera de catálogo.
      </div>
    )
  }

  const hasImages = images && images.length > 0
  const total = images.length

  const goNext = () => {
    if (!total) return
    setIndex(prev => (prev + 1) % total)
  }

  const goPrev = () => {
    if (!total) return
    setIndex(prev => (prev - 1 + total) % total)
  }

  const handlePointerDown = (clientX: number) => {
    dragStartX.current = clientX
  }

  const handlePointerUp = (clientX: number) => {
    if (dragStartX.current == null) return
    const delta = clientX - dragStartX.current
    const threshold = 50 // px para considerar swipe

    if (delta > threshold) {
      // arrastró hacia la derecha → foto anterior
      goPrev()
    } else if (delta < -threshold) {
      // arrastró hacia la izquierda → foto siguiente
      goNext()
    }

    dragStartX.current = null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#0b0b0b] text-white"
    >
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-400">
          <Link href="/catalogo" className="hover:text-pink-500 transition-colors">
            Catálogo
          </Link>
          <span className="mx-2">›</span>
          <span>
            {vehicle.brand} {vehicle.model}
          </span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* ================= GALERÍA ================= */}
          <div className="space-y-4">
            {/* Imagen principal: se ve ENTERA (object-contain) y acepta drag */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-black cursor-grab active:cursor-grabbing select-none"
              onMouseDown={e => handlePointerDown(e.clientX)}
              onMouseUp={e => handlePointerUp(e.clientX)}
              onTouchStart={e => handlePointerDown(e.touches[0].clientX)}
              onTouchEnd={e => handlePointerUp(e.changedTouches[0].clientX)}
            >
              {hasImages && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28 }}
                  className="relative w-full"
                >
                  <div className="relative w-full h-[230px] sm:h-[260px] md:h-[320px] lg:h-[360px]">
                    <Image
                      src={images[index]}
                      alt={vehicle.title || ''}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Contador (1 / N) arriba a la derecha */}
                  {total > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 text-xs px-2 py-1 rounded-full text-gray-200">
                      {index + 1} / {total}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Flechas */}
              {total > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full transition-all hover:bg-pink-600"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full transition-all hover:bg-pink-600"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Puntos de navegación (estilo Instagram) */}
            {total > 1 && (
              <div className="flex justify-center gap-2 mt-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      i === index
                        ? 'bg-pink-500 scale-110'
                        : 'bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir a la foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ================= PANEL LATERAL ================= */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_0_20px_rgba(255,0,128,0.15)] border border-gray-800"
          >
            <h1 className="text-2xl font-bold mb-1">{vehicle.title}</h1>
            {vehicle.price && (
              <p className="text-3xl font-semibold text-pink-500 mb-5">
                ${Intl.NumberFormat('es-AR').format(Number(vehicle.price))}
              </p>
            )}

            <ul className="divide-y divide-gray-800 mb-6">
              <Row label="Marca" value={vehicle.brand} />
              <Row label="Modelo" value={vehicle.model} />
              <Row label="Versión" value={vehicle.Version} />
              <Row label="Año" value={vehicle.year} />
              <Row
                label="Kilometraje"
                value={vehicle.km ? `${vehicle.km} km` : undefined}
              />
              <Row label="Transmisión" value={vehicle.Caja} />
              <Row label="Motor" value={vehicle.Motor} />
              <Row label="Color" value={vehicle.Color} />
              <Row label="Puertas" value={vehicle.Puertas} />
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              {whatsappHref && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={whatsappHref}
                  target="_blank"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-center py-3 rounded-lg font-semibold transition-all shadow-[0_0_10px_rgba(255,0,128,0.4)]"
                >
                  Consultar
                </motion.a>
              )}
              {vehicle.permalink && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={vehicle.permalink}
                  target="_blank"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-center py-3 rounded-lg font-semibold transition-all"
                >
                  Ver en ML
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>

        {/* ================= DESCRIPCIÓN ================= */}
        {description && (
          <motion.details
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5"
          >
            <summary className="cursor-pointer text-pink-500 font-semibold">
              Descripción del vehículo
            </summary>
            <p className="whitespace-pre-wrap mt-3 text-gray-300">{description}</p>
          </motion.details>
        )}
      </div>
    </motion.div>
  )
}
