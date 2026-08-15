import {
  ChevronRight,
  Heart,
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FeedbackSection, StarRow } from '../../components/feedback/FeedbackSection'
import { AttributeTags } from '../../components/ui/AttributeTags'
import { ProductCard } from '../../features/catalog/ProductCard'
import { VariantSelect } from '../../features/catalog/VariantSelect'
import { useCommerce } from '../../hooks/useCommerce'
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts'
import { useLocalFeedback } from '../../hooks/useLocalFeedback'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { useMarketplaceProduct, useProductVideos } from '../../hooks/useMarketplaceProduct'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceMedia } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { recordProductView } from '../../lib/productViews'
import { toStorefrontProduct } from '../../lib/storefrontProduct'
import {
  defaultVariant,
  resolveVariant,
  sellableVariants,
  variantLabel,
  variantOptions,
} from '../../lib/variants'
import { appPaths } from '../../router/paths'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { addToCart, isFavorite, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  const { error, loading, product } = useMarketplaceProduct(slug)
  const videos = useProductVideos(slug)
  const { average, feedback, submit } = useLocalFeedback(`product-${slug}`)
  const [quantity, setQuantity] = useState(1)
  const [activeMediaId, setActiveMediaId] = useState('')
  const [chosenId, setChosenId] = useState('')
  const versionLabelId = useId()

  useEffect(() => { void recordProductView(product?.slug) }, [product?.slug])

  useEffect(() => {
    setQuantity(1)
    setActiveMediaId('')
    setChosenId(product ? defaultVariant(product.variants)?.id ?? '' : '')
  }, [product])

  const variant = useMemo(
    () => (product ? resolveVariant(product.variants, chosenId) : null),
    [chosenId, product],
  )
  const variantId = variant?.id

  useEffect(() => { setActiveMediaId('') }, [variantId])

  const gallery: MarketplaceMedia[] = useMemo(() => {
    const images = [...(product?.media ?? [])].sort(
      (left, right) =>
        Number(right.isPrimary) - Number(left.isPrimary) || left.position - right.position,
    )
    const own = images.filter((item) => item.variantId && item.variantId === variantId)
    const shared = images.filter((item) => !item.variantId)
    const others = variantId ? [] : images.filter((item) => item.variantId)
    return [...own, ...shared, ...others, ...videos]
  }, [product, variantId, videos])
  const active = gallery.find((item) => item.id === activeMediaId) ?? gallery[0]

  const categorySlug = product?.categories[0]?.slug
  const related = useInfiniteProducts(
    useMemo(() => ({ categorySlug }), [categorySlug]),
  )

  if (loading) {
    return (
      <main className="page-container section-space">
        <p className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
          <Loader2 className="animate-spin" size={16} /> Loading product…
        </p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="page-container section-space">
        <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-20 text-center text-sm text-muted">
          {error || 'This product could not be found.'}
        </p>
      </main>
    )
  }

  const category = product.categories[0]
  const versions = sellableVariants(product.variants)
  const price = variant ? variant.salePrice : product.price
  const listPrice = variant ? variant.price : product.listPrice
  const discountPercent = variant ? (variant.discountPercent ?? 0) : product.discountPercent
  const available = variant ? variant.stockQuantity : product.quantity
  const inStock = available > 0
  const specs = variant ? variantOptions(variant) : {}

  const card = {
    ...toStorefrontProduct(product),
    oldPrice: discountPercent > 0 ? listPrice : undefined,
    price,
    variantId,
  }
  const saved = isFavorite(card)
  const relatedProducts = related.products.filter((item) => item.slug !== product.slug).slice(0, 4)

  return (
    <main className="bg-white">
      <div className="page-container py-6 sm:py-10">
        <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-14">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-soft sm:aspect-[1.08/1]">
              {active
                ? active.mediaType === 'IMAGE'
                  ? <img alt={active.altText ?? product.name} className="size-full object-cover" src={mediaUrl(active.url)} />
                  : <video className="size-full object-cover" controls src={mediaUrl(active.url)} />
                : <span className="grid size-full place-items-center text-muted"><ImageIcon size={44} /></span>}
              {discountPercent > 0 && (
                <span className="absolute left-5 top-5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white">
                  {discountPercent}% off
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {gallery.map((item, index) => (
                  <button
                    aria-label={`View item ${index + 1} of ${product.name}`}
                    aria-pressed={item.id === active?.id}
                    className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-soft transition sm:size-20 ${item.id === active?.id ? 'border-primary opacity-100' : 'border-transparent opacity-65 hover:opacity-100'}`}
                    key={item.id}
                    onClick={() => setActiveMediaId(item.id)}
                    type="button"
                  >
                    {item.mediaType === 'IMAGE'
                      ? <img alt="" className="size-full object-cover" src={mediaUrl(item.url)} />
                      : <video className="size-full object-cover" muted playsInline src={mediaUrl(item.url)} />}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:py-2">
            {category && (
              <Link
                className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-dark"
                to={appPaths.categoryDetails(category.slug)}
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.045em] text-ink sm:text-4xl">{product.name}</h1>
            <Link
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-primary-dark"
              to={appPaths.shopDetails(product.shop.slug)}
            >
              Sold by {product.shop.name} <ChevronRight size={14} />
            </Link>
            {feedback.length > 0 && (
              <a className="mt-3 flex items-center gap-2 text-xs text-muted" href="#product-feedback">
                <StarRow rating={Math.round(average)} size={14} />
                <strong className="text-ink">{average.toFixed(1)}</strong>
                <span>({feedback.length} {feedback.length === 1 ? 'review' : 'reviews'})</span>
              </a>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <strong className="text-2xl text-ink">{formatPrice(price)}</strong>
              {discountPercent > 0 && (
                <span className="text-sm text-muted line-through">{formatPrice(listPrice)}</span>
              )}
            </div>
            <p className={`mt-2 text-xs font-bold ${inStock ? 'text-green-700' : 'text-red-600'}`}>
              {inStock ? `In stock · ${available} available` : 'Out of stock'}
            </p>

            {versions.length > 1 && (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted" id={versionLabelId}>
                  Version
                  {variant && <span className="ml-2 normal-case tracking-normal text-ink">{variantLabel(variant)}</span>}
                </p>
                <VariantSelect
                  labelId={versionLabelId}
                  onSelect={setChosenId}
                  selectedId={variantId ?? ''}
                  variants={product.variants}
                />
              </div>
            )}

            {Object.keys(specs).length > 0 && (
              <div className="mt-6 border-t border-line pt-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                  Specifications
                </h2>
                <div className="mt-3">
                  <AttributeTags attributes={specs} />
                </div>
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <div className="flex h-12 items-center rounded-xl border border-line">
                <button aria-label="Decrease quantity" className="grid size-11 place-items-center text-muted hover:text-ink" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus size={16} /></button>
                <span className="w-7 text-center text-sm font-black">{quantity}</span>
                <button aria-label="Increase quantity" className="grid size-11 place-items-center text-muted hover:text-ink" onClick={() => setQuantity((value) => Math.min(available || 1, value + 1))} type="button"><Plus size={16} /></button>
              </div>
              <button
                className="auth-submit flex-1"
                disabled={!inStock}
                onClick={() => addToCart(card, quantity)}
                type="button"
              >
                <ShoppingBag size={17} /> {inStock ? 'Add to cart' : 'Out of stock'}

              </button>
              <button
                aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
                className={`grid size-12 shrink-0 place-items-center rounded-xl border border-line transition hover:border-primary ${saved ? 'bg-primary-light text-primary' : 'text-ink'}`}
                onClick={() => toggleFavorite(card)}
                type="button"
              >
                <Heart className={saved ? 'fill-current' : ''} size={19} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted">
              <span className="flex items-center gap-2"><Truck className="text-primary-dark" size={18} /> Fast local delivery</span>
              <span className="flex items-center gap-2"><ShieldCheck className="text-primary-dark" size={18} /> Secure checkout</span>
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-line py-6">
          <h2 className="text-sm font-black text-ink">Product details</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{product.description}</p>
        </div>

        {Object.keys(specs).length > 0 && (
          <div className="border-y border-line py-6">
            <h2 className="text-sm font-black text-ink">Specifications</h2>
            {versions.length > 1 && variant && (
              <p className="mt-1 text-xs text-muted">For {variantLabel(variant)}.</p>
            )}
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(specs).map(([name, value]) => (
                <div
                  className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2"
                  key={name}
                >
                  <dt className="text-xs font-bold text-muted">{name}</dt>
                  <dd className="text-right text-xs font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="border-b border-line bg-soft/40">
        <FeedbackSection
          average={average}
          emptyMessage="No reviews for this product yet. Share your experience to help other buyers."
          eyebrow="What buyers say"
          feedback={feedback}
          formTitle="Review this product"
          id="product-feedback"
          intro="Reviews here are about the product itself — quality, sizing, and whether it matched the description."
          onSubmit={submit}
          placeholder="How is the product working out for you?"
          title="Product reviews"
        />
      </div>

      <div className="border-b border-line bg-soft/40">
        <FeedbackSection
          average={average}
          emptyMessage="No reviews for this product yet. Share your experience to help other buyers."
          eyebrow="What buyers say"
          feedback={feedback}
          formTitle="Review this product"
          id="product-feedback"
          intro="Reviews here are about the product itself — quality, sizing, and whether it matched the description."
          onSubmit={submit}
          placeholder="How is the product working out for you?"
          title="Product reviews"
        />
      </div>

      {relatedProducts.length > 0 && (
        <section className="page-container py-12 sm:py-16">
          <p className="auth-eyebrow">You may also like</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">Related products</h2>
          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:gap-5">
            {relatedProducts.map((item) => {
              const relatedCard = toStorefrontProduct(item)
              return (
                <ProductCard
                  isFavorite={isFavorite(relatedCard)}
                  key={item.slug}
                  onAdd={addToCart}
                  onFavorite={toggleFavorite}
                  onOpen={openProduct}
                  product={relatedCard}
                />
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
