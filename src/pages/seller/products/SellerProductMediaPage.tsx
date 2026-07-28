import { Star, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Feedback, PageTitle, errorMessage, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { sellerProductsApi, type ProductMedia } from '../../../lib/sellerProductsApi'

export function SellerProductMediaPage() {
  const { error, loading, product, refresh, setError } = useSellerProduct()
  const [uploading, setUploading] = useState(false)
  async function upload(files: FileList | null) {
    if (!product || !files?.length) return
    setUploading(true); setError('')
    try { await Promise.all(Array.from(files).map((file, index) => sellerProductsApi.uploadMedia(product.id, { file, position: product.media.length + index, isPrimary: !product.media.length && index === 0 }))); await refresh() }
    catch (cause) { setError(errorMessage(cause)) } finally { setUploading(false) }
  }
  async function remove(item: ProductMedia) {
    if (!product || !window.confirm('Delete this media file?')) return
    const replacement = item.isPrimary ? product.media.find((media) => media.id !== item.id)?.id : undefined
    try { await sellerProductsApi.deleteMedia(product.id, item.id, replacement); await refresh() } catch (cause) { setError(errorMessage(cause)) }
  }
  if (loading) return <div className="p-8 text-sm text-muted">Loading media…</div>
  if (!product) return <div className="p-5"><Feedback error={error || 'Product not found.'} /></div>
  return <div className="space-y-5 p-5"><PageTitle title="Product media" subtitle={`Manage images and videos for ${product.name}.`} /><Feedback error={error} />
    <label className="seller-card flex cursor-pointer items-center justify-center gap-2 border-dashed p-5 text-xs font-semibold"><Upload size={16} /> {uploading ? 'Uploading…' : 'Upload images or videos'}<input accept="image/*,video/*" className="hidden" disabled={uploading} multiple onChange={(e) => void upload(e.target.files)} type="file" /></label>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{product.media.map((item) => <article className="seller-card overflow-hidden" key={item.id}><div className="aspect-video bg-soft">{item.mediaType === 'IMAGE' ? <img className="h-full w-full object-contain" src={mediaUrl(item.url)} /> : <video className="h-full w-full object-contain" controls src={mediaUrl(item.url)} />}</div><div className="flex items-center gap-2 p-3"><span className="min-w-0 flex-1 truncate text-xs">{item.altText || item.mediaType.toLowerCase()}</span>{item.isPrimary ? <span className="flex items-center gap-1 text-[10px] font-semibold"><Star size={12} /> Primary</span> : <button className="seller-icon-button" onClick={() => sellerProductsApi.updateMedia(product.id, item.id, { isPrimary: true }).then(refresh).catch((cause) => setError(errorMessage(cause)))} title="Make primary"><Star size={14} /></button>}<button className="seller-icon-button text-red-600" onClick={() => void remove(item)} title="Delete"><Trash2 size={14} /></button></div></article>)}</div>
  </div>
}
