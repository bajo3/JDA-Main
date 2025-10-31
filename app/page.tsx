import Link from 'next/link'
import { Car, Instagram, Phone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="card text-center">
        <h1>Jesús Díaz Automotores</h1>
        <p className="mt-2 opacity-90">Tu próximo auto está acá. Financiación, permutas y atención personalizada.</p>
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link className="btn" href="/catalogo"><Car size={18}/> Explorar catálogo</Link>
          <a className="btn" href="https://wa.me/5492494000000?text=Hola%20vengo%20de%20la%20web%20y%20quiero%20hacer%20una%20consulta" target="_blank" rel="noreferrer"><Phone size={18}/> Consultar por WhatsApp</a>
          <a className="btn" href="https://instagram.com/jesusdiazautomotores" target="_blank" rel="noreferrer"><Instagram size={18}/> Instagram</a>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {title: 'Atención humana', desc: 'Te acompañamos en todo el proceso.'},
          {title: 'Financiación', desc: 'Opciones flexibles según tu caso.'},
          {title: 'Autos seleccionados', desc: 'Unidades con revisión y papeles al día.'},
        ].map((it) => (
          <div key={it.title} className="card">
            <h3>{it.title}</h3>
            <p className="mt-2 opacity-90">{it.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
