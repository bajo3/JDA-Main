'use client'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { usePathname } from 'next/navigation'

const NavLink = ({ href, children }: any) => {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} className={active ? 'text-green-400 font-semibold' : 'hover:text-green-300'}>
      {children}
    </Link>
  )   
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold no-underline">
          <Car size={20} /> <span>Jesús Díaz Automotores</span>
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/catalogo">Catálogo</NavLink>
          <NavLink href="/nosotros">Nosotros</NavLink>
          <NavLink href="/contacto">Contacto</NavLink>
        </nav>
      </div>
    </header>
  )
}
