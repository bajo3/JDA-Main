export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10">
      <div className="container py-8 text-sm opacity-80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Jesús Díaz Automotores · Tandil</div>
          <div className="flex gap-4">
            <a href="https://wa.me/5492494000000" target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="https://instagram.com/jesusdiazautomotores" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
