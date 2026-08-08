import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { VerifiedShopLogo } from '../../components/shop/VerifiedShopLogo'
import { marketplaceApi, type MarketplaceShop } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { appPaths } from '../../router/paths'

/** Tints the initials fallback so logo-less shops still read as distinct tiles. */
const FALLBACK_TINTS = ['#eef4ff', '#fff4ea', '#eef8ef']

export function BrandStrip() {
  const [shops, setShops] = useState<MarketplaceShop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    marketplaceApi.shops({ limit: 10, page: 1 })
      .then((result) => { if (active) setShops(result.contents) })
      .catch(() => { if (active) setShops([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (!loading && !shops.length) return null

  return (
    <section className="page-container section-space">
      <SectionHeader eyebrow="Shop with confidence" title="Official brand stores" />
      {loading ? (
        <p className="flex items-center justify-center gap-2 py-10 text-xs text-muted">
          <Loader2 className="animate-spin" size={15} /> Loading stores…
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {shops.map((shop, index) => (
            <Link
              className="flex min-h-24 items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              key={shop.id}
              to={appPaths.shopDetails(shop.slug)}
            >
              <VerifiedShopLogo
                badgeClassName="size-[18px]"
                className="size-11"
                logoClassName="text-sm"
                logoUrl={shop.logo ? mediaUrl(shop.logo) : undefined}
                name={shop.name}
                style={shop.logo ? undefined : { backgroundColor: FALLBACK_TINTS[index % FALLBACK_TINTS.length] }}
              />
              <span>
                <strong className="block text-sm text-ink">{shop.name}</strong>
                <small className="text-[10px] text-muted">
                  {shop.productCount} {shop.productCount === 1 ? 'product' : 'products'}
                </small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
