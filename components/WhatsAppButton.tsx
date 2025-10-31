'use client'
import { MessageCircle } from 'lucide-react'
export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WAPP || process.env.BUSINESS_WAPP || '+5492494000000'
  const href = `https://wa.me/${phone.replace(/\D+/g,'')}?text=${encodeURIComponent('Hola, vengo de la web y quiero hacer una consulta')}`
  return (
    <a href={href} target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-500 text-white rounded-full p-4 shadow-xl" aria-label="WhatsApp">
      <MessageCircle />
    </a>
  )
}
