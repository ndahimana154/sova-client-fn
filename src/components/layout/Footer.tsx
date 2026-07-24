import { Facebook, Instagram, Twitter } from 'lucide-react'
import { Brand } from '../ui/Brand'

const columns = [
  { title: 'Shop', links: ['New arrivals', 'Best sellers', 'Today’s deals', 'Gift cards'] },
  { title: 'Help', links: ['Delivery', 'Returns', 'Track an order', 'Contact us'] },
  { title: 'About', links: ['Our story', 'Sell on SOVA', 'Careers', 'Terms & privacy'] },
]

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Brand light />
          <p className="mt-4 max-w-xs text-xs leading-5 text-white/50">A simpler marketplace for finding useful, beautiful things from trusted sellers.</p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Twitter].map((Icon, index) => <a aria-label="Social media" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/60 hover:border-primary hover:text-primary" href="#" key={index}><Icon size={15} /></a>)}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-bold uppercase tracking-[0.12em]">{column.title}</h3>
            <div className="mt-4 space-y-3">{column.links.map((link) => <a className="block text-xs text-white/50 hover:text-white" href="#" key={link}>{link}</a>)}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[10px] text-white/35">© 2026 SOVA Marketplace. Built for better everyday shopping.</div>
    </footer>
  )
}
