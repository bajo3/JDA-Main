export const revalidate = 86400
export default function ContactoPage() {
  const phone = process.env.BUSINESS_WAPP || '+5492494000000'
  const url = `https://wa.me/${phone.replace(/\D+/g,'')}?text=${encodeURIComponent('Hola, vengo de la web y quiero hacer una consulta')}`
  return (
    <div className="space-y-4">
      <h1>Contacto</h1>
      <div className="card space-y-2">
        <p><strong>WhatsApp:</strong> <a href={url} target="_blank" rel="noreferrer">{phone}</a></p>
        <p><strong>Dirección:</strong> {process.env.DEALER_ADDRESS || 'Colectora, Tandil'}</p>
        <p><strong>Ciudad:</strong> {process.env.DEALER_CITY || 'Tandil, Buenos Aires, Argentina'}</p>
      </div>
    </div>
  )
}
