import {
  BadgeCheck,
  ChevronLeft,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Product } from '../../data/catalog'
import { ProductCard } from '../../features/catalog/ProductCard'

interface BrandStorePageProps {
  allProducts: Product[]
  brand: string
  favoriteProductNames: string[]
  onAddToCart: (product: Product) => void
  onProductOpen: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

interface StoreFeedback {
  comment: string
  date: string
  id: string
  name: string
  rating: number
}

const sovaContact = {
  email: 'support@sova.rw',
  phone: '+250 788 000 000',
}

const sampleFeedback: StoreFeedback[] = [
  {
    id: 'sample-store-1',
    name: 'Diane U.',
    rating: 5,
    comment: 'The seller packed everything carefully and the item matched the description. SOVA kept me updated until delivery.',
    date: '20 July 2026',
  },
  {
    id: 'sample-store-2',
    name: 'Eric N.',
    rating: 4,
    comment: 'Helpful service and a smooth delivery. I would shop from this store again.',
    date: '09 July 2026',
  },
]

export function BrandStorePage({
  allProducts,
  brand,
  favoriteProductNames,
  onAddToCart,
  onProductOpen,
  onToggleFavorite,
}: BrandStorePageProps) {
  const brandProducts = allProducts.filter((product) => (product.brand ?? 'SOVA Select') === brand)
  const categories = [...new Set(brandProducts.map((product) => product.category))]
  const [selectedCategory, setSelectedCategory] = useState('All products')
  const [feedback, setFeedback] = useState<StoreFeedback[]>(() => loadStoreFeedback(brand))
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackError, setFeedbackError] = useState('')
  const feedbackForm = useRef<HTMLFormElement>(null)
  const profile = storeProfile(brand)

  const visibleProducts = useMemo(
    () => selectedCategory === 'All products'
      ? brandProducts
      : brandProducts.filter((product) => product.category === selectedCategory),
    [brandProducts, selectedCategory],
  )

  const productRating = brandProducts.length
    ? brandProducts.reduce((total, product) => total + product.rating, 0) / brandProducts.length
    : 0
  const newFeedback = feedback.filter((item) => !item.id.startsWith('sample-store-'))
  const storeRating = newFeedback.length
    ? newFeedback.reduce((total, item) => total + item.rating, 0) / newFeedback.length
    : productRating

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!feedbackRating) {
      setFeedbackError('Please select a star rating.')
      return
    }
    const data = new FormData(event.currentTarget)
    const item: StoreFeedback = {
      id: `${Date.now()}`,
      name: String(data.get('name')).trim(),
      comment: String(data.get('comment')).trim(),
      rating: feedbackRating,
      date: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
    }
    const next = [item, ...feedback]
    setFeedback(next)
    localStorage.setItem(storeFeedbackKey(brand), JSON.stringify(next.filter((entry) => !entry.id.startsWith('sample-store-'))))
    setFeedbackRating(0)
    setFeedbackError('')
    feedbackForm.current?.reset()
  }

  return (
    <main>
      <section className="border-b border-line bg-[#fbf3e8]">
        <div className="page-container py-8 sm:py-12">
          <a className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" href="#">
            <ChevronLeft size={16} /> Back to shopping
          </a>
          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-ink text-2xl font-black text-white shadow-xl">
                {brand.split(' ').map((word) => word[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold text-primary-dark"><BadgeCheck size={16} /> Verified official store</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-ink sm:text-4xl">{brand}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <Star className="fill-primary text-primary" size={14} />
                  <strong className="text-ink">{storeRating.toFixed(1)}</strong>
                  <span>store rating</span>
                  <span className="text-line">•</span>
                  <span>On SOVA since {profile.joined}</span>
                </div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">{profile.summary}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="page-container grid gap-4 py-6 sm:grid-cols-3">
          <StorePromise icon={<BadgeCheck size={18} />} label="Identity verified by SOVA" />
          <StorePromise icon={<PackageCheck size={18} />} label="Authenticity checked" />
          <StorePromise icon={<Truck size={18} />} label="SOVA-supported delivery" />
        </div>
      </section>

      <section className="page-container grid gap-8 py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:py-14">
        <div>
          <p className="auth-eyebrow">About the shop</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">The {brand} story</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{profile.about}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <StoreStat label="Typical response" value={profile.response} />
            <StoreStat label="Orders completed" value={profile.orders} />
            <StoreStat label="Dispatches from" value="Kigali" />
          </div>
        </div>
        <aside className="rounded-2xl border border-line bg-soft p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-ink"><Store size={18} className="text-primary-dark" /> Shop information</h3>
          <dl className="mt-5 space-y-4 text-xs">
            <StoreInfo icon={<MapPin size={16} />} label="Shop address" value={profile.address} />
            <StoreInfo icon={<Clock3 size={16} />} label="Opening hours" value={profile.hours} />
            <StoreInfo icon={<ShieldCheck size={16} />} label="Returns" value="14-day SOVA return support" />
          </dl>
        </aside>
      </section>

      <section className="border-y border-line bg-soft/60 py-12 sm:py-16">
        <div className="page-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="auth-eyebrow">Browse this store</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">Products by category</h2>
            </div>
            <span className="text-xs text-muted">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</span>
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Store product categories">
            {['All products', ...categories].map((category) => (
              <button
                aria-pressed={selectedCategory === category}
                className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition ${selectedCategory === category ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-primary hover:text-ink'}`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {visibleProducts.map((product) => (
                <ProductCard
                  isFavorite={favoriteProductNames.includes(product.name)}
                  key={product.name}
                  onAdd={onAddToCart}
                  onFavorite={onToggleFavorite}
                  onOpen={onProductOpen}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
              <ShieldCheck className="mx-auto text-muted" size={26} />
              <p className="mt-3 text-sm font-bold text-ink">No products are available in this category right now.</p>
            </div>
          )}
        </div>
      </section>

      <section className="page-container py-12 sm:py-16" id="store-feedback">
        <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
          <div>
            <p className="auth-eyebrow">Customer experiences</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">Store feedback</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Comments here are about the seller’s service, communication, packing, and delivery experience.</p>

            <form className="mt-7 rounded-2xl border border-line bg-white p-5 shadow-soft" onSubmit={submitFeedback} ref={feedbackForm}>
              <h3 className="text-sm font-black text-ink">Comment on this store</h3>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button aria-label={`${star} star store rating`} key={star} onClick={() => setFeedbackRating(star)} type="button">
                    <Star className={`${star <= feedbackRating ? 'fill-primary text-primary' : 'text-line'} transition`} size={24} />
                  </button>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-ink">Display name</span>
                <input className="review-input" name="name" placeholder="Your name" required />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-ink">Your feedback</span>
                <textarea className="review-input min-h-28 resize-y" name="comment" placeholder="How was your experience with this store?" required />
              </label>
              {feedbackError && <p className="mt-3 text-xs font-semibold text-red-600" role="alert">{feedbackError}</p>}
              <button className="auth-submit mt-5" type="submit"><MessageCircle size={16} /> Post feedback</button>
            </form>
          </div>

          <div className="space-y-4">
            {feedback.map((item) => (
              <article className="rounded-2xl border border-line bg-white p-5 sm:p-6" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => <Star className={star <= item.rating ? 'fill-primary text-primary' : 'text-line'} key={star} size={14} />)}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.comment}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{item.date}</span>
                </div>
                <p className="mt-4 text-xs font-bold text-ink">{item.name} <span className="ml-2 font-medium text-green-700">Verified customer</span></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink py-12 text-white">
        <div className="page-container grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Need help with this store?</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Contact SOVA customer care</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">SOVA handles questions, order support, returns, and communication with the seller on your behalf.</p>
            <p className="mt-4 flex items-start gap-2 text-xs text-white/75"><MapPin size={15} className="mt-0.5 shrink-0 text-primary" /> Shop address: {profile.address}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white transition hover:bg-primary-dark" href={`mailto:${sovaContact.email}?subject=${encodeURIComponent(`Help with ${brand} store`)}`}>
              <Mail size={16} /> {sovaContact.email}
            </a>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-black text-white transition hover:bg-white/10" href={`tel:${sovaContact.phone.replaceAll(' ', '')}`}>
              <Phone size={16} /> {sovaContact.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function StorePromise({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-3 rounded-xl bg-soft px-4 py-3 text-xs font-bold text-ink">
      <span className="text-primary-dark">{icon}</span>{label}
    </span>
  )
}

function StoreStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <strong className="block text-lg font-black text-ink">{value}</strong>
      <span className="mt-1 block text-[11px] text-muted">{label}</span>
    </div>
  )
}

function StoreInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary-dark">{icon}</span>
      <div><dt className="font-bold text-ink">{label}</dt><dd className="mt-1 leading-5 text-muted">{value}</dd></div>
    </div>
  )
}

function storeFeedbackKey(brand: string) {
  return `sova-store-feedback-${brand.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
}

function loadStoreFeedback(brand: string): StoreFeedback[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storeFeedbackKey(brand)) || '[]') as StoreFeedback[]
    return [...saved, ...sampleFeedback]
  } catch {
    return sampleFeedback
  }
}

function storeProfile(brand: string) {
  const profiles: Record<string, { about: string; address: string; hours: string; joined: string; orders: string; response: string; summary: string }> = {
    Auralab: {
      about: 'Auralab focuses on personal audio made for daily listening, work, and travel. Its SOVA shop brings together carefully checked audio essentials backed by local order support.',
      address: 'KN 5 Road, Kigali City Centre, Kigali',
      hours: 'Mon–Sat, 9:00–18:00',
      joined: '2024',
      orders: '1,240+',
      response: 'Within 2 hours',
      summary: 'Everyday audio products with a focus on comfortable listening and dependable performance.',
    },
    Ikaze: {
      about: 'Ikaze offers practical contemporary footwear selected for comfort, versatility, and life on the move. Every order is prepared locally and supported through SOVA.',
      address: 'KG 7 Avenue, Kacyiru, Kigali',
      hours: 'Mon–Sat, 8:30–18:30',
      joined: '2025',
      orders: '860+',
      response: 'Within 1 hour',
      summary: 'Comfort-led footwear made for everyday movement and easy personal style.',
    },
    'Nuru Home': {
      about: 'Nuru Home curates warm, functional pieces for calm contemporary spaces. The collection balances natural textures, useful design, and finishes that are simple to live with.',
      address: 'KK 15 Road, Kicukiro, Kigali',
      hours: 'Mon–Sat, 9:00–18:00',
      joined: '2023',
      orders: '2,100+',
      response: 'Within 3 hours',
      summary: 'Thoughtful furniture, lighting, and home accents selected for modern Rwandan spaces.',
    },
    'Lumière Botanics': {
      about: 'Lumière Botanics creates straightforward personal-care routines with a focus on gentle textures and everyday consistency. Products are stored and dispatched with care.',
      address: 'KN 3 Road, Nyarugenge, Kigali',
      hours: 'Mon–Fri, 9:00–17:30',
      joined: '2025',
      orders: '730+',
      response: 'Within 2 hours',
      summary: 'Simple, coordinated skincare for comfortable and consistent daily care.',
    },
    PulseTech: {
      about: 'PulseTech selects approachable smart technology for health, activity, and daily organization. The shop provides locally supported products and clear setup information.',
      address: 'KG 9 Avenue, Kimihurura, Kigali',
      hours: 'Mon–Sat, 9:00–19:00',
      joined: '2024',
      orders: '1,480+',
      response: 'Within 1 hour',
      summary: 'Useful connected technology designed to fit naturally into daily routines.',
    },
  }
  return profiles[brand] ?? {
    about: `${brand} is a verified SOVA seller offering carefully selected products with transparent service and locally supported delivery.`,
    address: 'Kigali, Rwanda',
    hours: 'Mon–Sat, 9:00–18:00',
    joined: '2025',
    orders: '500+',
    response: 'Within 3 hours',
    summary: `Authentic products supplied by ${brand} and supported by SOVA.`,
  }
}
