import { Edit3, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, PageTitle, StatusBadge, attributesText, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { formatPrice } from '../../../lib/formatPrice'
import { appPaths } from '../../../router/paths'

export function SellerProductDetailsPage() {
  const { error, loading, product } = useSellerProduct()
  const [tab, setTab] = useState<'description' | 'files' | 'inventory'>('description')
  if (loading) return <div className="p-8 text-sm text-muted">Loading product…</div>
  if (!product) return <div className="p-5"><Feedback error={error || 'Product not found.'} /></div>
  const primary = product.media.find((item) => item.isPrimary) ?? product.media[0]
  return <div className="space-y-5 p-5">
    <PageTitle title={product.name} subtitle={`Product #${product.id.slice(0, 8)}`} actions={<Link className="seller-outline-button" to={appPaths.sellerProductEdit(product.id)}><Edit3 size={14} /> Edit</Link>} />
    <Feedback error={error} />
    <section className="seller-card p-5"><div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <div><div className="flex flex-wrap gap-5 border-b border-line pb-4 text-xs"><span>Status <StatusBadge value={product.status} /></span><span>Price <strong>{formatPrice(product.minimumPrice)}</strong></span><span>SKU <strong>{product.defaultVariant.sku}</strong></span></div>
        <nav className="flex gap-6 border-b border-line">{(['description','files','inventory'] as const).map((item) => <button className={`py-4 text-xs font-semibold capitalize ${tab === item ? 'border-b-2 border-ink text-ink' : 'text-muted'}`} key={item} onClick={() => setTab(item)}>{item}</button>)}</nav>
        {tab === 'description' && <dl className="divide-y divide-line text-sm"><Row label="Description" value={product.description} /><Row label="Category" value={product.category.name} /><Row label="Brand" value={product.brand || '—'} /><Row label="Attributes" value={attributesText(product.defaultVariant.attributes) || '—'} /><Row label="Created" value={new Date(product.createdAt).toLocaleDateString()} /></dl>}
        {tab === 'files' && <div className="grid grid-cols-3 gap-3 py-5">{product.media.map((item) => item.mediaType === 'IMAGE' ? <img className="aspect-square rounded-lg border border-line object-cover" key={item.id} src={mediaUrl(item.url)} /> : <video className="aspect-square rounded-lg border border-line object-cover" controls key={item.id} src={mediaUrl(item.url)} />)}</div>}
        {tab === 'inventory' && <dl className="divide-y divide-line text-sm"><Row label="Stock status" value={product.stockStatus.replaceAll('_',' ')} /><Row label="Total quantity" value={String(product.totalQuantity)} /><Row label="Available quantity" value={String(product.availableQuantity)} /></dl>}
      </div>
      <aside><div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-soft">{primary ? (primary.mediaType === 'IMAGE' ? <img className="h-full w-full object-contain" src={mediaUrl(primary.url)} /> : <video className="h-full w-full object-contain" controls src={mediaUrl(primary.url)} />) : <ImageIcon className="text-muted" size={36} />}</div><p className="mt-3 text-center text-sm font-bold">{product.name}</p><p className="text-center text-xs text-muted">{product.category.name}</p></aside>
    </div></section>
  </div>
}
function Row({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[140px_1fr] gap-4 py-4"><dt className="text-muted">{label}</dt><dd>{value}</dd></div> }
