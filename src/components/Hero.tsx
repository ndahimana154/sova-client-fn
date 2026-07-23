import { ArrowRight, ShieldCheck, Truck } from 'lucide-react'

export function Hero() {
  return (
    <section className="page-container pt-5 md:pt-7">
      <div className="hero-panel">
        <img alt="" className="absolute inset-0 size-full object-cover object-center" src="/images/storefront-hero.png" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fff9f0] via-[#fff9f0]/90 to-transparent" />
        <div className="relative z-10 flex min-h-[420px] max-w-xl flex-col justify-center px-7 py-12 sm:px-12 lg:min-h-[470px] lg:px-16">
          <span className="mb-5 w-fit rounded-full border border-primary/25 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-dark">Fresh tech, thoughtful prices</span>
          <h1 className="text-4xl font-black leading-[1.06] tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">Everyday essentials.<br /><span className="text-primary">Better discovered.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-muted sm:text-base">Shop carefully selected technology, home, fashion and wellness products from sellers you can trust.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="primary-button" href="#deals">Shop today’s deals <ArrowRight size={16} /></a>
            <a className="secondary-button" href="#categories">Explore categories</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold text-ink/65">
            <span className="flex items-center gap-2"><Truck className="text-primary" size={17} /> Fast local delivery</span>
            <span className="flex items-center gap-2"><ShieldCheck className="text-primary" size={17} /> Secure checkout</span>
          </div>
        </div>
      </div>
    </section>
  )
}
