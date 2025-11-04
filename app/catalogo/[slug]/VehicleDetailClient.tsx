'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

function Row({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null
  return (
    <li className="flex justify-between gap-4 py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100 text-right">{value}</span>
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

  if (!vehicle) {
    return (
      <div className="text-center text-gray-400 mt-20">
        🚗 Vehículo no encontrado o fuera de catálogo.
      </div>
    )
  }

  const hasImages = images && images.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#05050a] text-white"
    >
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-400">
          <Link href="/catalogo" className="hover:text-pink-500 transition-colors">
            Catálogo
          </Link>
          <span className="mx-2 text-gray-600">›</span>
          <span className="text-gray-200">
            {vehicle.brand} {vehicle.model}
          </span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* =============== GALERÍA =============== */}
          <div className="space-y-4">
            {/* Contenedor con borde y glow suave */}
            <div className="relative group rounded-3xl bg-gradient-to-br from-pink-500/30 via-transparent to-purple-500/20 p-[2px]">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl overflow-hidden bg-black/80 border border-gray-900 shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
              >
                {hasImages && (
                  <div className="relative w-full aspect-[16/9] sm:aspect-[4/3]">
                    <Image
                      src={images[index]}
                      alt={vehicle.title || ''}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Flechas */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600/90"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setIndex(prev => (prev + 1) % images.length)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600/90"
                    >
                      ›
                    </button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-1 overflow-x-auto pb-2">
                {images.map((src, i) => {
                  const selected = i === index
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`relative flex-none rounded-2xl border transition-all focus:outline-none ${
                        selected
                          ? 'border-pink-500 shadow-[0_0_0_1px_rgba(236,72,153,0.7)]'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="relative w-[80px] h-[60px] sm:w-[100px] sm:h-[70px] md:w-[110px] md:h-[75px] rounded-2xl overflow-hidden bg-black">
                        <Image
                          src={src}
                          alt={`Foto ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {selected && (
                        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-pink-500/80" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* =============== PANEL LATERAL =============== */}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="relative"
          >
            {/* Glow de fondo */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-pink-500/40 via-transparent to-purple-500/40 opacity-40 blur-xl"
            />
            <div className="relative bg-[#13131b] rounded-[26px] p-6 md:p-7 border border-white/5 shadow-[0_18px_35px_rgba(0,0,0,0.7)] space-y-6">
              <header className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                  {vehicle.title}
                </h1>
                {vehicle.price && (
                  <p className="text-3xl font-semibold text-pink-500">
                    ${Intl.NumberFormat('es-AR').format(Number(vehicle.price))}
                  </p>
                )}
              </header>

              <section>
                <h2 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">
                  Detalles del vehículo
                </h2>
                <ul className="divide-y divide-gray-800">
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
              </section>

              <section className="flex flex-col sm:flex-row gap-3 pt-1">
                {whatsappHref && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={whatsappHref}
                    target="_blank"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-center py-3 rounded-lg font-semibold transition-all shadow-[0_0_16px_rgba(236,72,153,0.65)]"
                  >
                    Consultar
                  </motion.a>
                )}
                {vehicle.permalink && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={vehicle.permalink}
                    target="_blank"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-gray-100 text-center py-3 rounded-lg font-semibold border border-gray-700 transition-all"
                  >
                    Ver en ML
                  </motion.a>
                )}
              </section>
            </div>
          </motion.div>
        </div>

        {/* =============== DESCRIPCIÓN =============== */}
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-[#101018] rounded-2xl border border-gray-800 p-5 md:p-6"
          >
            <details open className="space-y-3">
              <summary className="cursor-pointer text-pink-500 font-semibold">
                Descripción del vehículo
              </summary>
              <p className="whitespace-pre-wrap mt-2 text-gray-200 leading-relaxed text-sm md:text-base">
                {description}
              </p>
            </details>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
