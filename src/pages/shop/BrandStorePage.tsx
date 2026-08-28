import {
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { FeedbackSection } from '../../components/feedback/FeedbackSection'
import { VerifiedShopLogo } from '../../components/shop/VerifiedShopLogo'
import { InfiniteProductGrid } from '../../features/catalog/InfiniteProductGrid'
import { useCommerce } from '../../hooks/useCommerce'
import { useLocalFeedback } from '../../hooks/useLocalFeedback'
import { PRODUCT_PAGE_SIZE } from '../../hooks/useInfiniteProducts'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { marketplaceApi, type MarketplaceShop, type MarketplaceShopDetails } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'

const sovaContact = {
  email: 'support@sova.rw',
  phone: '+250 788 000 000',
}

export function BrandStorePage() {
  const { slug = '' } = useParams()
  const { addToCart, isFavorite, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  const [shop, setShop] = useState<MarketplaceShopDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { average, feedback, submit } = useLocalFeedback(`shop-${slug}`)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    // One call: the shop details ship the first page of products, which the grid
    // below reuses as its starting point instead of asking for it again.
    marketplaceApi.shop(slug, { limit: PRODUCT_PAGE_SIZE, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((result) => { if (active) setShop(result) })
      .catch(() => { if (active) setError('This shop could not be found.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  if (loading) {
    return (
      <main className="page-container section-space">
        <p className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
          <Loader2 className="animate-spin" size={16} /> Loading shop…
        </p>
      </main>
    )
  }

  if (error || !shop) {
    return (
      <main className="page-container section-space">
        <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-16 text-center text-sm text-muted">
          {error || 'This shop could not be found.'}
        </p>
      </main>
    )
  }

  const address = shopAddress(shop)
  const onCover = Boolean(shop.coverImage)

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-[#fbf3e8]">
        {shop.coverImage ? (
          <>
            <img alt="" className="absolute inset-0 size-full object-cover" src={mediaUrl(shop.coverImage)} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d1709]/90 via-[#2d1709]/60 to-[#2d1709]/35" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.9),transparent_55%)]" />
        )}

        <div className={`page-container relative py-10 sm:py-14 ${onCover ? 'text-white' : 'text-ink'}`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <VerifiedShopLogo
              badgeClassName="size-7"
              className="size-20 shrink-0 sm:size-24"
              logoClassName={`rounded-3xl shadow-xl ${shop.logo ? 'bg-white' : 'bg-ink text-2xl text-white'}`}
              logoUrl={shop.logo ? mediaUrl(shop.logo) : undefined}
              name={shop.name}
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">{shop.name}</h1>

              {shop.description && (
                <p className={`mt-4 max-w-2xl text-sm leading-6 ${onCover ? 'text-white/85' : 'text-muted'}`}>
                  {shop.description}
                </p>
              )}

            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft/60 py-12 sm:py-16">
        <div className="page-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="auth-eyebrow">Browse this store</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">Products from {shop.name}</h2>
            </div>

          </div>

          <div className="mt-7">
            <InfiniteProductGrid
              className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5"
              emptyMessage={`${shop.name} has no products on sale right now.`}
              isFavorite={isFavorite}
              initial={shop.products}
              onAdd={addToCart}
              onFavorite={toggleFavorite}
              onOpen={openProduct}
              shopSlug={shop.slug}
            />
          </div>
        </div>
      </section>

      <FeedbackSection
        average={average}
        emptyMessage="No feedback for this store yet. Be the first to share your experience."
        feedback={feedback}
        formTitle="Comment on this store"
        id="store-feedback"
        intro="Comments here are about the seller’s service, communication, packing, and delivery experience."
        onSubmit={submit}
        placeholder="How was your experience with this store?"
        title="Store feedback"
      />

      <section className="border-t border-line bg-ink py-12 text-white">
        <div className="page-container grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Need help with this store?</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Contact SOVA customer care</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">SOVA handles questions, order support, returns, and communication with the seller on your behalf.</p>
            {address && (
              <p className="mt-4 flex items-start gap-2 text-xs text-white/75">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary" /> Shop address: {address}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white transition hover:bg-primary-dark" href={`mailto:${sovaContact.email}?subject=${encodeURIComponent(`Help with ${shop.name} store`)}`}>
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

/** Compact fact pill, readable on both the cover photo and the plain header. */
function Chip({ children, onCover }: { children: ReactNode; onCover: boolean }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-3 py-1.5 text-xs font-semibold ${onCover
        ? 'border-white/25 bg-white/15 text-white backdrop-blur'
        : 'border-line bg-white text-muted'
        }`}
    >
      {children}
    </span>
  )
}

function ContactLink({ children, external, href, onCover }: {
  children: ReactNode
  external?: boolean
  href: string
  onCover: boolean
}) {
  return (
    <a
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${onCover
        ? 'border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20'
        : 'border-line bg-white text-ink hover:border-primary hover:text-primary-dark'
        }`}
      href={href}
      {...(external ? { rel: 'noreferrer', target: '_blank' } : {})}
    >
      {children}
    </a>
  )
}

function shopAddress(shop: MarketplaceShop) {
  return shop.addressLabel ?? ''
}
