import { ArrowUpRight } from 'lucide-react'

const promotions = [
  { title: 'Refresh your space', copy: 'Soft textures and modern pieces for calm everyday living.', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85', color: '#eaf3ed' },
  { title: 'Move your way', copy: 'Fresh sneakers and active essentials made for every pace.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85', color: '#eef4ff' },
  { title: 'The beauty edit', copy: 'Daily care from formulas and brands customers love.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85', color: '#fff0ef' },
]

export function PromoGrid() {
  return (
    <section className="page-container section-space grid gap-3 md:grid-cols-3">
      {promotions.map((promo) => (
        <a className="group relative min-h-80 overflow-hidden rounded-3xl p-7" href="#" key={promo.title} style={{ backgroundColor: promo.color }}>
          <div className="relative z-10 max-w-[70%]">
            <h3 className="text-2xl font-black tracking-[-0.04em] text-ink">{promo.title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted">{promo.copy}</p>
            <span className="mt-5 inline-flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition group-hover:rotate-45"><ArrowUpRight size={17} /></span>
          </div>
          <img alt="" className="absolute inset-x-0 bottom-0 h-3/5 w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,black_28%)] transition duration-500 group-hover:scale-105" loading="lazy" src={promo.image} />
        </a>
      ))}
    </section>
  )
}
