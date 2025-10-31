import './globals.css'
import type { Metadata } from 'next'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { WhatsAppButton } from '../components/WhatsAppButton'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: { default: 'Jesús Díaz Automotores — Colectora', template: '%s · Jesús Díaz Automotores' },
  description: 'Agencia de autos en Tandil. Compra, venta, permutas y financiación.',
  openGraph: { title: 'Jesús Díaz Automotores — Colectora', description: 'Agencia de autos en Tandil. Compra, venta, permutas y financiación.', type: 'website', locale: 'es_AR' },
  twitter: { card: 'summary_large_image', title: 'Jesús Díaz Automotores', description: 'Agencia de autos en Tandil. Compra, venta, permutas y financiación.' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="container py-8">{children}</main>
        <Footer />
        <WhatsAppButton />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            name: process.env.DEALER_NAME || 'Jesús Díaz Automotores',
            address: process.env.DEALER_ADDRESS || 'Colectora, Tandil',
          })}}
        />
      </body>
    </html>
  )
}
