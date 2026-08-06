import { Upload } from 'lucide-react'
import { useState } from 'react'
import { ProductMediaGrid, ProductMediaPicker, type MediaDraft } from '../../../components/seller/products/ProductMedia'
import { Feedback, FormSection, PageTitle, errorMessage } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { sellerProductsApi, type ProductMedia } from '../../../lib/sellerProductsApi'

export function SellerProductMediaPage() {
  const { error, loading, product, refresh, setError } = useSellerProduct()
  const [drafts, setDrafts] = useState<MediaDraft[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  async function run(task: () => Promise<unknown>) {
    setBusy(true); setError('')
    try { await task(); await refresh({ silent: true }) }
    catch (cause) { setError(errorMessage(cause)) }
    finally { setBusy(false); setStatus('') }
  }

  function uploadDrafts() {
    if (!product || !drafts.length) return
    const pending = drafts
    void run(async () => {
      for (const [index, draft] of pending.entries()) {
        setStatus(`Uploading ${index + 1} of ${pending.length}…`)
        await sellerProductsApi.uploadMedia(product.id, {
          file: draft.file,
          position: product.media.length + index,
          isPrimary: !product.media.length && index === 0,
        })
      }
      setDrafts([])
    })
  }

  function remove(item: ProductMedia) {
    if (!product || !window.confirm('Delete this media file?')) return
    const replacement = item.isPrimary ? product.media.find((media) => media.id !== item.id)?.id : undefined
    void run(() => sellerProductsApi.deleteMedia(product.id, item.id, replacement))
  }

  if (loading) return <div className="p-8 text-sm text-muted">Loading media…</div>
  if (!product) return <div className="p-5"><Feedback error={error || 'Product not found.'} /></div>

  return (
    <div className="space-y-5 p-5">
      <PageTitle subtitle={`Manage images and videos for ${product.name}.`} title="Product media" />
      <Feedback error={error} />

      <FormSection subtitle="Hover a file to set it as the cover or remove it." title={`Uploaded media (${product.media.length})`}>
        <ProductMediaGrid
          busy={busy}
          media={product.media}
          onDelete={remove}
          onMakePrimary={(item) => void run(() => sellerProductsApi.updateMedia(product.id, item.id, { isPrimary: true }))}
        />
      </FormSection>

      <FormSection subtitle="Select or drop several files, review the previews, then upload." title="Add media">
        <ProductMediaPicker
          drafts={drafts}
          hint={product.media.length ? 'New files are added after the existing ones.' : 'The first file becomes the cover image.'}
          label={drafts.length ? `${drafts.length} file(s) ready to upload` : 'Choose files'}
          onChange={setDrafts}
        />
        {drafts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {status && <span className="text-xs text-muted">{status}</span>}
            <button className="seller-outline-button" disabled={busy} onClick={() => setDrafts([])} type="button">Clear</button>
            <button className="seller-primary-button" disabled={busy} onClick={uploadDrafts} type="button">
              <Upload size={14} /> {busy ? 'Uploading…' : `Upload ${drafts.length} file(s)`}
            </button>
          </div>
        )}
      </FormSection>
    </div>
  )
}
