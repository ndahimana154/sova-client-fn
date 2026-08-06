import { Edit3, ImageIcon, ImagePlus, Play } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, PageTitle, StatusBadge, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { formatPrice } from '../../../lib/formatPrice'
import type { ProductMedia, SellerProduct } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

const TABS = ['description', 'attributes', 'inventory'] as const
type Tab = typeof TABS[number]

export function SellerProductDetailsPage() {
  const { error, loading, product } = useSellerProduct()
  const [tab, setTab] = useState<Tab>('description')
  if (loading) return <div className="p-8 text-sm text-muted">Loading product…</div>
  if (!product) return <div className="p-5"><Feedback error={error || 'Product not found.'} /></div>

  const attributes = Object.entries(product.variants)
  return (
    <div className="space-y-5 p-5">
      <PageTitle
        actions={<>
          <Link className="seller-outline-button" to={appPaths.sellerProductMedia(product.id)}><ImagePlus size={14} /> Media</Link>
          <Link className="seller-primary-button" to={appPaths.sellerProductEdit(product.id)}><Edit3 size={14} /> Edit</Link>
        </>}
        subtitle={`${product.category.name} · #${product.id.slice(0, 8)}`}
        title={product.name}
      />
      <Feedback error={error} />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,.85fr)_minmax(0,1.15fr)]">
        <section className="seller-card p-4">
          <ProductGallery media={product.media} name={product.name} />
        </section>

        <div className="space-y-5">
          <section className="seller-card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Selling price</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-2">
                  <strong className="text-2xl font-black text-ink">{formatPrice(product.finalPrice)}</strong>
                  {product.discount > 0 && <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>}
                </p>
              </div>
              <StatusBadge value={product.stockStatus} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Tile label="Quantity" value={String(product.quantity)} />
              <Tile label="Discount" value={product.discount > 0 ? `${product.discount}%` : '—'} />
              <Tile label="Media" value={String(product.media.length)} />
              <Tile label="Attributes" value={String(attributes.length)} />
            </dl>
          </section>

          <section className="seller-card">
            <nav className="flex gap-1 border-b border-line px-3">
              {TABS.map((item) => (
                <button
                  className={`px-3 py-3 text-xs font-semibold capitalize transition ${tab === item ? 'border-b-2 border-primary text-ink' : 'border-b-2 border-transparent text-muted hover:text-ink'}`}
                  key={item}
                  onClick={() => setTab(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="p-5">
              {tab === 'description' && (
                <div className="space-y-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{product.description || '—'}</p>
                  <dl className="divide-y divide-line border-t border-line text-sm">
                    <Row label="Category" value={product.category.name} />
                    <Row label="Brand" value={product.brand || '—'} />
                    <Row label="Slug" value={product.slug} />
                    <Row label="Created" value={formatDate(product.createdAt)} />
                    <Row label="Last updated" value={formatDate(product.updatedAt)} />
                  </dl>
                </div>
              )}
              {tab === 'attributes' && (
                attributes.length
                  ? <dl className="divide-y divide-line text-sm">{attributes.map(([key, value]) => <Row key={key} label={key} value={value} />)}</dl>
                  : <EmptyNote>No attributes added for this product.</EmptyNote>
              )}
              {tab === 'inventory' && (
                <dl className="divide-y divide-line text-sm">
                  <Row label="Stock status" value={product.stockStatus.replaceAll('_', ' ')} />
                  <Row label="Quantity" value={String(product.quantity)} />
                  <Row label="Base price" value={formatPrice(product.price)} />
                  <Row label="Final price" value={formatPrice(product.finalPrice)} />
                </dl>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ProductGallery({ media, name }: { media: SellerProduct['media']; name: string }) {
  const ordered = [...media].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position)
  const [activeId, setActiveId] = useState('')
  const active = ordered.find((item) => item.id === activeId) ?? ordered[0]

  if (!active) {
    return (
      <div className="seller-gallery-stage flex-col gap-2 text-muted">
        <ImageIcon size={34} />
        <span className="text-xs">No media uploaded yet.</span>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="seller-gallery-stage">
        {active.mediaType === 'IMAGE'
          ? <img alt={active.altText ?? name} className="size-full object-contain" src={mediaUrl(active.url)} />
          : <video className="size-full object-contain" controls src={mediaUrl(active.url)} />}
      </div>
      {ordered.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ordered.map((item) => (
            <button
              aria-label={`Show ${item.mediaType.toLowerCase()}`}
              className={`seller-gallery-thumb relative ${item.id === active.id ? 'seller-gallery-thumb-active' : ''}`}
              key={item.id}
              onClick={() => setActiveId(item.id)}
              type="button"
            >
              <Thumb item={item} name={name} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Thumb({ item, name }: { item: ProductMedia; name: string }) {
  if (item.mediaType === 'IMAGE') return <img alt={item.altText ?? name} className="size-full object-cover" src={mediaUrl(item.url)} />
  return (
    <>
      <video className="size-full object-cover" muted playsInline src={mediaUrl(item.url)} />
      <span className="absolute inset-0 grid place-items-center bg-[#241f1a]/35 text-white"><Play size={14} /></span>
    </>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="seller-stat-tile"><dt>{label}</dt><dd>{value}</dd></div>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(96px,140px)_1fr] gap-4 py-3">
      <dt className="text-xs capitalize text-muted">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line bg-soft/40 px-4 py-8 text-center text-xs text-muted">{children}</p>
}

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
