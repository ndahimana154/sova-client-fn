import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  EllipsisVertical,
  Eye,
  Image,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Star,
  Trash2,
  Upload,
  Video,
  ChevronUp,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  sellerProductsApi,
  type ProductMedia,
  type SellerCategory,
  type SellerProduct,
} from '../../lib/sellerProductsApi'
import { formatPrice } from '../../lib/formatPrice'
import { env } from '../../config/env'
import { normalizeApiError } from '../../api/errors'

type View = 'list' | 'create' | 'details' | 'edit' | 'media' | 'categories'

interface SellerProductsPageProps {
  initialView: 'products' | 'categories'
}

interface PendingMedia {
  altText: string
  file: File
  id: string
  isPrimary: boolean
  previewUrl: string
}

interface AttributeRow {
  id: string
  property: string
  value: string
}

export function SellerProductsPage({ initialView }: SellerProductsPageProps) {
  const [view, setView] = useState<View>(() => initialView === 'categories' ? 'categories' : productViewFromPath())
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [selected, setSelected] = useState<SellerProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'updatedAt'>('createdAt')

  const loadCategories = useCallback(async () => {
    try {
      const result = await sellerProductsApi.categories()
      setCategories(result)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await sellerProductsApi.list({
        categoryId,
        limit,
        page,
        search,
        sortBy,
        sortOrder: sortBy === 'name' ? 'asc' : 'desc',
        status,
      })
      setProducts(result.contents)
      setTotalItems(result.meta.totalItems)
      setTotalPages(Math.max(1, result.meta.totalPages))
    } catch (cause) {
      setError(messageOf(cause))
    } finally {
      setLoading(false)
    }
  }, [categoryId, limit, page, search, sortBy, status])

  useEffect(() => {
    void loadCategories().catch((cause) => setError(messageOf(cause)))
  }, [loadCategories])

  useEffect(() => {
    if (view === 'list') void loadProducts()
  }, [loadProducts, view])

  useEffect(() => {
    setView(initialView === 'categories' ? 'categories' : productViewFromPath())
  }, [initialView])

  useEffect(() => {
    if (initialView === 'categories') return
    const syncPath = () => {
      const nextView = productViewFromPath()
      setView(nextView)
      if (nextView === 'details' || nextView === 'edit' || nextView === 'media') {
        const productId = productIdFromPath()
        if (productId) void openProduct(productId, false, nextView)
      }
    }
    syncPath()
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [initialView])

  async function openProduct(
    productId: string,
    updateUrl = true,
    target: 'details' | 'edit' | 'media' = 'details',
  ) {
    setLoading(true)
    setError('')
    try {
      const [product, media] = await Promise.all([
        sellerProductsApi.get(productId),
        sellerProductsApi.listMedia(productId),
      ])
      setSelected({ ...product, media })
      setView(target)
      if (updateUrl) {
        const suffix = target === 'details' ? '' : `/${target}`
        window.history.pushState(null, '', `/seller/dashboard/products/${productId}${suffix}`)
      }
    } catch (cause) {
      setError(messageOf(cause))
    } finally {
      setLoading(false)
    }
  }

  async function submitProduct(product: SellerProduct) {
    setError('')
    try {
      await sellerProductsApi.submit(product.id)
      flash('Product submitted successfully')
      await loadProducts()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function deleteProduct(product: SellerProduct) {
    if (!window.confirm(`Delete “${product.name}” and all of its media?`)) return
    setError('')
    try {
      await sellerProductsApi.delete(product.id)
      flash('Product deleted successfully')
      await loadProducts()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  function flash(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  if (view === 'create') {
    return (
      <CreateProduct
        categories={categories}
        onCancel={() => {
          window.history.pushState(null, '', '/seller/dashboard/products')
          setView('list')
        }}
        onCreated={(product, uploadFailures) => {
          setSelected(product)
          setView('details')
          window.history.replaceState(null, '', `/seller/dashboard/products/${product.id}`)
          flash(uploadFailures ? `Product created, but ${uploadFailures} media file(s) could not be uploaded.` : 'Product and media created successfully')
        }}
      />
    )
  }

  if ((view === 'details' || view === 'edit' || view === 'media') && selected) {
    return (
      <ProductDetails
        categories={categories}
        onBack={() => {
          window.history.pushState(null, '', '/seller/dashboard/products')
          setView('list')
          void loadProducts()
        }}
        onDeleted={() => {
          setSelected(null)
          setView('list')
          void loadProducts()
          flash('Product deleted')
        }}
        onNotice={flash}
        onProductChange={setSelected}
        product={selected}
        view={view}
      />
    )
  }

  if (view === 'categories') {
    return <CategoryBrowser categories={categories} error={error} loading={loading} />
  }

  return (
    <div className="space-y-3 bg-[#fffaf3] p-3 lg:p-4">
      {(error || notice) && <Feedback error={error} notice={notice} />}
      <section className="rounded-lg border border-[#eee7de] bg-white p-3">
        <div className="mb-3"><h1 className="text-lg font-bold">Products</h1><p className="mt-1 text-xs text-[#6f665d]">Manage product information, media, prices, SKUs, and attributes for your shop.</p></div>
        <div className="overflow-hidden rounded-lg border border-[#eee7de] bg-white">
          <div className="seller-table-toolbar">
            <button className="seller-primary-button" onClick={() => {
              window.history.pushState(null, '', '/seller/dashboard/products/new')
              setView('create')
            }} type="button"><Plus size={14} /> Add product</button>
            <div className="ml-auto flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1.5 overflow-x-auto">
              <label className="seller-filter-input w-48 shrink-0">
                <Search size={14} /><input onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder="Search name, brand or SKU" value={search} />
              </label>
              <button className={filtersOpen ? 'seller-primary-button' : 'seller-outline-button'} onClick={() => setFiltersOpen((value) => !value)} type="button">
                <SlidersHorizontal size={14} /> Filters {filtersOpen && <ChevronUp size={13} />}
              </button>
              <button className="seller-icon-button" onClick={() => void loadProducts()} type="button"><RefreshCw size={14} /></button>
            </div>
          </div>
          {filtersOpen && (
            <div className="seller-table-filter-panel">
              <FilterSelect label="Category" onChange={(value) => { setPage(1); setCategoryId(value) }} value={categoryId}>
                <option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </FilterSelect>
              <FilterSelect label="Product status" onChange={(value) => { setPage(1); setStatus(value) }} value={status}>
                <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="SUBMITTED">Submitted</option><option value="ACTIVE">Active</option><option value="REJECTED">Rejected</option>
              </FilterSelect>
              <FilterSelect label="Sort by" onChange={(value) => setSortBy(value as typeof sortBy)} value={sortBy}>
                <option value="createdAt">Newest</option><option value="updatedAt">Recently updated</option><option value="name">Name</option><option value="price">Price</option>
              </FilterSelect>
              <button className="seller-outline-button self-end" onClick={() => { setCategoryId(''); setStatus(''); setSortBy('createdAt'); setPage(1) }} type="button">Clear</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="seller-data-table">
              <thead><tr><th>Actions</th><th>Product</th><th>Category</th><th>Price</th><th>SKU</th><th>Attributes</th><th>Media</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                {!loading && products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <ProductActions
                        onDelete={() => void deleteProduct(product)}
                        onEdit={() => void openProduct(product.id, true, 'edit')}
                        onManageMedia={() => void openProduct(product.id, true, 'media')}
                        onSubmit={product.status === 'DRAFT' ? () => void submitProduct(product) : undefined}
                        onView={() => void openProduct(product.id, true, 'details')}
                        productName={product.name}
                      />
                    </td>
                    <td><div className="flex items-center gap-3"><MediaThumbnail media={product.media.find((item) => item.isPrimary) ?? product.media[0]} /><span><strong className="block text-[#241f1a]">{product.name}</strong><small>{product.brand || product.defaultVariant.sku}</small></span></div></td>
                    <td>{product.category.name}</td><td>{priceRange(product)}</td><td>{product.defaultVariant.sku}</td>
                    <td className="max-w-48 truncate">{attributesText(product.defaultVariant.attributes) || '—'}</td><td>{product.media.length}</td><td><StatusBadge value={product.status} /></td><td>{date(product.updatedAt)}</td>
                  </tr>
                ))}
                {!loading && products.length === 0 && <tr><td className="py-12 text-center" colSpan={9}>No products match these filters.</td></tr>}
                {loading && <tr><td className="py-12 text-center" colSpan={9}>Loading products…</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-[#eee7de] bg-white px-3 py-2.5 text-xs">
            <span className="text-[#a69c92]">{totalItems} item{totalItems === 1 ? '' : 's'}</span>
            <label className="ml-auto flex items-center gap-2 text-[#6f665d]">Rows
              <select className="seller-filter-select" onChange={(event) => { setLimit(Number(event.target.value)); setPage(1) }} value={limit}>
                {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <nav aria-label="Product pagination" className="flex items-center gap-1">
              <button className="seller-icon-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /></button>
              <span className="grid min-h-8 min-w-8 place-items-center rounded-md border border-primary bg-primary px-2 text-white">{page}</span>
              <button className="seller-icon-button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={14} /></button>
            </nav>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductActions({
  onDelete,
  onEdit,
  onManageMedia,
  onSubmit,
  onView,
  productName,
}: {
  onDelete: () => void
  onEdit: () => void
  onManageMedia: () => void
  onSubmit?: () => void
  onView: () => void
  productName: string
}) {
  const [open, setOpen] = useState(false)
  const choose = (action: () => void) => {
    setOpen(false)
    action()
  }
  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for ${productName}`}
        className="seller-icon-button"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <EllipsisVertical size={14} />
      </button>
      {open && (
        <>
          <button aria-label="Close actions" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} type="button" />
          <div className="absolute left-0 top-full z-40 mt-1 w-44 rounded-md border border-[#eee7de] bg-white p-1 shadow-lg" role="menu">
            <ActionItem icon={<Eye size={13} />} label="View details" onClick={() => choose(onView)} />
            <ActionItem icon={<Edit3 size={13} />} label="Edit product" onClick={() => choose(onEdit)} />
            <ActionItem icon={<Image size={13} />} label="Manage media" onClick={() => choose(onManageMedia)} />
            {onSubmit && <ActionItem icon={<Send size={13} />} label="Submit product" onClick={() => choose(onSubmit)} />}
            <div className="my-1 border-t border-[#eee7de]" />
            <ActionItem danger icon={<Trash2 size={13} />} label="Delete product" onClick={() => choose(onDelete)} />
          </div>
        </>
      )}
    </div>
  )
}

function ActionItem({ danger = false, icon, label, onClick }: {
  danger?: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[11px] transition ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#6f665d] hover:bg-[#fffaf3] hover:text-[#241f1a]'}`}
      onClick={onClick}
      role="menuitem"
      type="button"
    >
      {icon}{label}
    </button>
  )
}

function CreateProduct({ categories, onCancel, onCreated }: {
  categories: SellerCategory[]
  onCancel: () => void
  onCreated: (product: SellerProduct, uploadFailures: number) => void
}) {
  const [media, setMedia] = useState<PendingMedia[]>([])
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      if (!media.some((item) => item.file.type.startsWith('image/'))) {
        throw new Error('Add at least one product image before creating the product.')
      }
      const product = await sellerProductsApi.create({
        brand: String(data.get('brand') || '').trim() || undefined,
        categoryId: String(data.get('categoryId')),
        description: String(data.get('description')),
        name: String(data.get('name')),
        variants: [{
          attributes: attributesObject(attributes),
          isDefault: true,
          name: 'Default',
          price: Number(data.get('price')),
          quantity: 0,
          sku: String(data.get('sku')),
        }],
      })
      let uploadFailures = 0
      for (const [position, item] of media.entries()) {
        try {
          await sellerProductsApi.uploadMedia(product.id, {
            altText: item.altText || product.name,
            file: item.file,
            isPrimary: item.isPrimary,
            position,
          })
        } catch {
          uploadFailures += 1
        }
      }
      const [created, uploadedMedia] = await Promise.all([
        sellerProductsApi.get(product.id),
        sellerProductsApi.listMedia(product.id),
      ])
      media.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      onCreated({ ...created, media: uploadedMedia }, uploadFailures)
    } catch (cause) {
      setError(messageOf(cause))
      setSaving(false)
    }
  }

  return (
    <form className="space-y-3 bg-[#fffaf3] p-3 lg:p-4" onSubmit={submit}>
      <PageTitle subtitle="Add the product information, price, SKU, attributes, and media." title="Add product" />
      {error && <Feedback error={error} notice="" />}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <section className="seller-panel">
          <div className="flex items-start gap-3 border-b border-[#eee7de] pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-[#fff6e8] text-[#c96f00]"><PackagePlus size={17} /></span>
            <div><h2 className="font-bold">Product information</h2><p className="mt-1 text-xs text-[#6f665d]">Use a clear customer-facing name and complete description.</p></div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Product name"><input name="name" placeholder="e.g. iPhone 12" required /></Field>
            <Field label="Brand (optional)"><input name="brand" placeholder="e.g. Apple" /></Field>
            <Field label="Category"><select name="categoryId" required><option value="">Select category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Price (RWF)"><input min="0" name="price" placeholder="650000" required type="number" /></Field>
            <Field label="SKU"><input name="sku" placeholder="IP12-BLU-256" required /></Field>
            <div className="sm:col-span-2"><AttributeEditor rows={attributes} onChange={setAttributes} /></div>
            <Field className="sm:col-span-2" label="Description"><textarea name="description" placeholder="Describe features, condition, materials, and what is included…" required rows={6} /></Field>
          </div>
        </section>
        <ProductMediaPicker media={media} onChange={setMedia} />
      </div>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[#eee7de] bg-[#fffaf3]/95 py-3 backdrop-blur"><button className="seller-outline-button" onClick={onCancel} type="button">Cancel</button><button className="seller-primary-button" disabled={saving}>{saving ? 'Creating product and uploading media…' : 'Create product'}</button></div>
    </form>
  )
}

function ProductDetails({ categories, onBack, onDeleted, onNotice, onProductChange, product, view }: {
  categories: SellerCategory[]; onBack: () => void; onDeleted: () => void; onNotice: (message: string) => void
  onProductChange: (product: SellerProduct) => void; product: SellerProduct; view: 'details' | 'edit' | 'media'
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [attributes, setAttributes] = useState<AttributeRow[]>(() =>
    Object.entries(product.defaultVariant.attributes).map(([property, value]) => ({
      id: crypto.randomUUID(),
      property,
      value,
    })),
  )

  async function refresh() {
    const [next, media] = await Promise.all([sellerProductsApi.get(product.id), sellerProductsApi.listMedia(product.id)])
    onProductChange({ ...next, media })
  }

  async function action(work: () => Promise<unknown>, message: string) {
    setBusy(true); setError('')
    try { await work(); await refresh(); onNotice(message) } catch (cause) { setError(messageOf(cause)) } finally { setBusy(false) }
  }

  async function updateInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    await action(() => Promise.all([
      sellerProductsApi.update(product.id, {
        brand: String(data.get('brand') || '').trim() || null,
        categoryId: String(data.get('categoryId')),
        description: String(data.get('description')),
        name: String(data.get('name')),
      }),
      sellerProductsApi.updateVariant(product.id, product.defaultVariant.id, {
        attributes: attributesObject(attributes),
        name: 'Default',
        price: Number(data.get('price')),
        sku: String(data.get('sku')),
      }),
    ]), 'Product updated')
  }

  async function removeProduct() {
    if (!window.confirm(`Delete “${product.name}” and all of its media?`)) return
    setBusy(true)
    try { await sellerProductsApi.delete(product.id); onDeleted() } catch (cause) { setError(messageOf(cause)); setBusy(false) }
  }

  return (
    <div className="space-y-3 bg-[#fffaf3] p-3 lg:p-4">
      <PageTitle subtitle={`${product.category.name} · ${product.defaultVariant.sku}`} title={view === 'details' ? product.name : view === 'edit' ? `Edit ${product.name}` : `Media · ${product.name}`}
        actions={<><StatusBadge value={product.status} />{product.status === 'DRAFT' && <button className="seller-primary-button" disabled={busy} onClick={() => void action(() => sellerProductsApi.submit(product.id), 'Product submitted for review')}><Check size={14} /> Submit</button>}<button className="seller-danger-button" disabled={busy} onClick={() => void removeProduct()}><Trash2 size={14} /> Delete</button><button aria-label="Close product details" className="seller-icon-button" onClick={onBack}><X size={14} /></button></>} />
      {error && <Feedback error={error} notice="" />}
      {view === 'details' && <ReadOnlyProduct product={product} />}
      {view === 'edit' && (
        <form className="seller-panel" onSubmit={updateInfo}>
          <div className="flex items-center justify-between border-b border-[#eee7de] pb-4"><div><h2 className="font-bold">Edit product information</h2><p className="mt-1 text-xs text-[#6f665d]">Update the product fields shown to customers.</p></div><button className="seller-primary-button" disabled={busy}><Edit3 size={14} /> Save changes</button></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Product name"><input defaultValue={product.name} id="seller-product-name" name="name" required /></Field>
            <Field label="Brand"><input defaultValue={product.brand ?? ''} name="brand" /></Field>
            <Field label="Category"><select defaultValue={product.category.id} name="categoryId">{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Price (RWF)"><input defaultValue={product.defaultVariant.price} min="0" name="price" required type="number" /></Field>
            <Field label="SKU"><input defaultValue={product.defaultVariant.sku} name="sku" required /></Field>
            <div className="sm:col-span-2"><AttributeEditor rows={attributes} onChange={setAttributes} /></div>
            <Field className="sm:col-span-2" label="Description"><textarea defaultValue={product.description} name="description" rows={5} /></Field>
          </div>
        </form>
      )}
      {view === 'media' && <MediaManager busy={busy} onAction={action} product={product} />}
    </div>
  )
}

function ReadOnlyProduct({ product }: { product: SellerProduct }) {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="seller-panel">
        <h2 className="font-bold">Product details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Name" value={product.name} />
          <Info label="Category" value={product.category.name} />
          <Info label="Brand" value={product.brand || '—'} />
          <Info label="Price" value={formatPrice(product.defaultVariant.price)} />
          <Info label="SKU" value={product.defaultVariant.sku} />
          <Info label="Media files" value={String(product.media.length)} />
        </div>
        <div className="mt-5 border-t border-[#eee7de] pt-4"><h3 className="text-xs font-bold">Description</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#6f665d]">{product.description}</p></div>
        <div className="mt-5 border-t border-[#eee7de] pt-4"><h3 className="text-xs font-bold">Attributes</h3>
          <div className="mt-2 overflow-hidden rounded-md border border-[#eee7de]">
            <table className="seller-data-table"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>
              {Object.entries(product.defaultVariant.attributes).map(([property, value]) => <tr key={property}><td className="font-semibold text-[#241f1a]">{property}</td><td>{value}</td></tr>)}
              {!Object.keys(product.defaultVariant.attributes).length && <tr><td className="py-6 text-center" colSpan={2}>No attributes recorded.</td></tr>}
            </tbody></table>
          </div>
        </div>
      </section>
      <section className="seller-panel h-fit"><h2 className="font-bold">Media preview</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">{product.media.map((media) => media.mediaType === 'IMAGE'
          ? <img alt={media.altText ?? product.name} className="aspect-square w-full rounded-md border border-[#eee7de] object-cover" key={media.id} src={mediaUrl(media.url)} />
          : <video className="aspect-square w-full rounded-md border border-[#eee7de] object-cover" controls key={media.id} src={mediaUrl(media.url)} />)}
        </div>
        {!product.media.length && <p className="mt-4 rounded-md bg-[#fffaf3] p-6 text-center text-xs text-[#6f665d]">No media uploaded.</p>}
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-[#fffaf3] p-3"><p className="text-[10px] text-[#a69c92]">{label}</p><p className="mt-1 text-xs font-semibold text-[#241f1a]">{value}</p></div>
}

function ProductMediaPicker({ media, onChange }: { media: PendingMedia[]; onChange: (media: PendingMedia[]) => void }) {
  function addFiles(files: FileList | null) {
    if (!files?.length) return
    const existingPrimary = media.some((item) => item.isPrimary)
    let assignedPrimary = existingPrimary
    const additions = Array.from(files).map((file) => {
      const canBePrimary = file.type.startsWith('image/')
      const isPrimary = canBePrimary && !assignedPrimary
      if (isPrimary) assignedPrimary = true
      return {
        altText: '',
        file,
        id: crypto.randomUUID(),
        isPrimary,
        previewUrl: URL.createObjectURL(file),
      }
    })
    onChange([...media, ...additions])
  }

  function remove(item: PendingMedia) {
    URL.revokeObjectURL(item.previewUrl)
    const remaining = media.filter((candidate) => candidate.id !== item.id)
    if (item.isPrimary) {
      const replacement = remaining.find((candidate) => candidate.file.type.startsWith('image/'))
      if (replacement) replacement.isPrimary = true
    }
    onChange([...remaining])
  }

  return (
    <section className="seller-panel">
      <div className="flex items-start gap-3 border-b border-[#eee7de] pb-4">
        <span className="grid size-9 place-items-center rounded-lg bg-[#fff6e8] text-[#c96f00]"><Image size={17} /></span>
        <div><h2 className="font-bold">Product media</h2><p className="mt-1 text-xs text-[#6f665d]">At least one image is required. You can also add MP4 video.</p></div>
      </div>
      <label className="mt-4 grid cursor-pointer place-items-center rounded-lg border border-dashed border-[#d9cfc3] bg-[#fffaf3] px-4 py-7 text-center transition hover:border-primary">
        <Upload className="text-[#c96f00]" size={22} />
        <strong className="mt-2 text-xs">Choose images or videos</strong>
        <span className="mt-1 text-[10px] text-[#6f665d]">JPEG, PNG, WebP, GIF or MP4</span>
        <input accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" className="sr-only" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} type="file" />
      </label>
      <div className="mt-3 space-y-2">
        {media.map((item) => (
          <div className="flex gap-2 rounded-lg border border-[#eee7de] p-2" key={item.id}>
            {item.file.type.startsWith('image/')
              ? <img alt="" className="size-16 shrink-0 rounded-md object-cover" src={item.previewUrl} />
              : <video className="size-16 shrink-0 rounded-md bg-[#241f1a] object-cover" src={item.previewUrl} />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><strong className="min-w-0 flex-1 truncate text-[11px]">{item.file.name}</strong><button className="text-red-600" onClick={() => remove(item)} type="button"><X size={13} /></button></div>
              <input
                className="seller-plain-input mt-1.5"
                onChange={(event) => onChange(media.map((candidate) => candidate.id === item.id ? { ...candidate, altText: event.target.value } : candidate))}
                placeholder="Alternative text"
                value={item.altText}
              />
              {item.file.type.startsWith('image/') && (
                <label className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#6f665d]">
                  <input
                    checked={item.isPrimary}
                    name="primary-product-media"
                    onChange={() => onChange(media.map((candidate) => ({ ...candidate, isPrimary: candidate.id === item.id })))}
                    type="radio"
                  />
                  Primary product image
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AttributeEditor({ onChange, rows }: { onChange: (rows: AttributeRow[]) => void; rows: AttributeRow[] }) {
  function update(id: string, field: 'property' | 'value', value: string) {
    onChange(rows.map((row) => row.id === id ? { ...row, [field]: value } : row))
  }

  return (
    <fieldset>
      <div className="flex items-center justify-between">
        <div><legend className="text-[11px] font-semibold text-[#6f665d]">Attributes</legend><p className="mt-1 text-[10px] text-[#a69c92]">Add specifications as property and value pairs.</p></div>
        <button
          className="seller-outline-button"
          onClick={() => onChange([...rows, { id: crypto.randomUUID(), property: '', value: '' }])}
          type="button"
        >
          <Plus size={13} /> Add attribute
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] gap-2" key={row.id}>
            <input className="seller-plain-input" onChange={(event) => update(row.id, 'property', event.target.value)} placeholder="Property, e.g. Disk" value={row.property} />
            <input className="seller-plain-input" onChange={(event) => update(row.id, 'value', event.target.value)} placeholder="Value, e.g. SSD" value={row.value} />
            <button aria-label="Remove attribute" className="seller-icon-button text-red-600" onClick={() => onChange(rows.filter((item) => item.id !== row.id))} type="button"><X size={13} /></button>
          </div>
        ))}
        {!rows.length && <div className="rounded-md border border-dashed border-[#d9cfc3] bg-[#fffaf3] px-3 py-4 text-center text-[10px] text-[#6f665d]">No attributes added. Select “Add attribute” to add specifications.</div>}
      </div>
    </fieldset>
  )
}

function MediaManager({ busy, onAction, product }: { busy: boolean; onAction: (work: () => Promise<unknown>, message: string) => Promise<void>; product: SellerProduct }) {
  const [file, setFile] = useState<File | null>(null)
  const images = product.media.filter((item) => item.mediaType === 'IMAGE' && !item.variantId)
  async function remove(media: ProductMedia) {
    if (!window.confirm('Delete this media file?')) return
    const replacement = media.isPrimary ? images.find((item) => item.id !== media.id)?.id : undefined
    await onAction(() => sellerProductsApi.deleteMedia(product.id, media.id, replacement), 'Media deleted')
  }
  return (
    <section className="seller-panel h-fit" id="seller-product-media">
      <h2 className="font-bold">Images and videos</h2><p className="mt-1 text-xs text-[#6f665d]">Upload product media within the configured image and video limits.</p>
      <form className="mt-4 rounded-lg border border-dashed border-[#d9cfc3] bg-[#fffaf3] p-4" onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        if (!file) return
        void onAction(() => sellerProductsApi.uploadMedia(product.id, {
          altText: String(data.get('altText') || ''),
          file,
          isPrimary: data.get('isPrimary') === 'on',
        }), 'Media uploaded').then(() => setFile(null))
      }}>
        <input accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required type="file" />
        <input className="seller-plain-input mt-3" name="altText" placeholder="Alternative text" />
        <label className="mt-3 flex items-center gap-2 text-xs"><input name="isPrimary" type="checkbox" /> Make primary image</label>
        <button className="seller-primary-button mt-3 w-full" disabled={busy || !file}><Upload size={14} /> Upload</button>
      </form>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {product.media.map((media) => (
          <div className="group relative overflow-hidden rounded-lg border border-[#eee7de]" key={media.id}>
            {media.mediaType === 'IMAGE' ? <img alt={media.altText ?? product.name} className="aspect-square w-full object-cover" src={mediaUrl(media.url)} /> : <div className="grid aspect-square place-items-center bg-[#241f1a] text-white"><Video size={25} /></div>}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-[#241f1a]/80 p-1.5 text-white">
              {media.isPrimary && <Star size={12} fill="currentColor" />}
              {!media.isPrimary && media.mediaType === 'IMAGE' && !media.variantId && <button className="text-[10px]" onClick={() => void onAction(() => sellerProductsApi.updateMedia(product.id, media.id, { isPrimary: true }), 'Primary image updated')}>Set primary</button>}
              <button
                aria-label="Edit media metadata"
                onClick={() => {
                  const altText = window.prompt('Alternative text', media.altText ?? '')
                  if (altText === null) return
                  const position = Number(window.prompt('Display position', String(media.position)))
                  if (!Number.isInteger(position) || position < 0) return
                  void onAction(
                    () => sellerProductsApi.updateMedia(product.id, media.id, { altText, position }),
                    'Media details updated',
                  )
                }}
              >
                <Edit3 size={12} />
              </button>
              <button className="ml-auto" onClick={() => void remove(media)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {!product.media.length && <p className="mt-4 rounded-lg bg-[#fffaf3] p-5 text-center text-xs text-[#6f665d]"><Image className="mx-auto mb-2" size={22} />No media uploaded.</p>}
    </section>
  )
}

function CategoryBrowser({ categories, error, loading }: { categories: SellerCategory[]; error: string; loading: boolean }) {
  const names = new Map(categories.map((category) => [category.id, category.name]))
  return (
    <div className="space-y-3 bg-[#fffaf3] p-3 lg:p-4">
      {error && <Feedback error={error} notice="" />}
      <section className="rounded-lg border border-[#eee7de] bg-white p-3">
        <div className="mb-3"><h1 className="text-lg font-bold">Product categories</h1><p className="mt-1 text-xs text-[#6f665d]">Active categories available for product creation. Category management remains an administrator responsibility.</p></div>
        <div className="overflow-hidden rounded-lg border border-[#eee7de]">
          <div className="overflow-x-auto">
            <table className="seller-data-table">
              <thead><tr><th>Category</th><th>Type</th><th>Parent category</th><th>Identifier</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="font-semibold text-[#241f1a]">{category.name}</td>
                    <td><StatusBadge value={category.parentId ? 'SUBCATEGORY' : 'ROOT'} /></td>
                    <td>{category.parentId ? names.get(category.parentId) ?? '—' : '—'}</td>
                    <td className="font-mono text-[10px]">{category.id}</td>
                  </tr>
                ))}
                {!loading && !categories.length && <tr><td className="py-12 text-center" colSpan={4}>No active categories are available.</td></tr>}
                {loading && <tr><td className="py-12 text-center" colSpan={4}>Loading categories…</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#eee7de] px-3 py-2.5 text-xs text-[#a69c92]">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</div>
        </div>
      </section>
    </div>
  )
}

function PageTitle({ actions, subtitle, title }: { actions?: React.ReactNode; subtitle: string; title: string }) {
  return <div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold">{title}</h1><p className="mt-1 text-xs text-[#6f665d]">{subtitle}</p></div>{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}</div>
}

function Field({ children, className = '', label }: { children: React.ReactNode; className?: string; label: string }) {
  return <label className={className}><span className="mb-1.5 block text-[11px] font-semibold text-[#6f665d]">{label}</span><span className="seller-form-control">{children}</span></label>
}

function FilterSelect({ children, label, onChange, value }: {
  children: React.ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="min-w-40 flex-1">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#6f665d]">{label}</span>
      <select className="seller-filter-select w-full" onChange={(event) => onChange(event.target.value)} value={value}>{children}</select>
    </label>
  )
}

function Feedback({ error, notice }: { error: string; notice: string }) {
  return <p className={`rounded-md border px-3 py-2 text-xs font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#99c24d] bg-[#f7faef] text-[#6f942f]'}`}>{error || notice}</p>
}

function StatusBadge({ value }: { value: string }) {
  const success = value === 'ACTIVE' || value === 'IN_STOCK'
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${success ? 'border-[#99c24d] bg-[#f7faef] text-[#6f942f]' : value === 'OUT_OF_STOCK' || value === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#eee7de] bg-[#fffaf3] text-[#6f665d]'}`}>{value.replaceAll('_', ' ')}</span>
}

function MediaThumbnail({ media }: { media?: ProductMedia }) {
  if (!media) return <span className="grid size-10 place-items-center rounded-md bg-[#fffaf3] text-[#a69c92]"><PackagePlus size={17} /></span>
  if (media.mediaType === 'VIDEO') return <span className="grid size-10 place-items-center rounded-md bg-[#241f1a] text-white"><Video size={16} /></span>
  return <img alt="" className="size-10 rounded-md object-cover" src={mediaUrl(media.url)} />
}

function mediaUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url
  const base = env.apiUrl?.replace(/\/$/, '') ?? ''
  return `${base}/${url.replace(/^\/+/, '')}`
}
function attributesObject(rows: AttributeRow[]): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const row of rows) {
    const property = row.property.trim().toLowerCase()
    const value = row.value.trim()
    if (!property && !value) continue
    if (!property || !value) throw new Error('Every attribute needs both a property and a value.')
    if (attributes[property] !== undefined) throw new Error(`Attribute “${property}” was added more than once.`)
    attributes[property] = value
  }
  return attributes
}
function attributesText(attributes: Record<string, string>) {
  return Object.entries(attributes).map(([key, value]) => `${key}: ${value}`).join(', ')
}
function priceRange(product: SellerProduct) { return product.minimumPrice === product.maximumPrice ? formatPrice(product.minimumPrice) : `${formatPrice(product.minimumPrice)} – ${formatPrice(product.maximumPrice)}` }
function date(value: string) { return new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium' }).format(new Date(value)) }
function messageOf(cause: unknown) { return normalizeApiError(cause).message }
function productViewFromPath(): View {
  if (window.location.pathname === '/seller/dashboard/products/new') return 'create'
  if (/\/seller\/dashboard\/products\/[^/]+\/edit$/.test(window.location.pathname)) return 'edit'
  if (/\/seller\/dashboard\/products\/[^/]+\/media$/.test(window.location.pathname)) return 'media'
  return productIdFromPath() ? 'details' : 'list'
}
function productIdFromPath() {
  const match = window.location.pathname.match(/^\/seller\/dashboard\/products\/([^/]+)(?:\/(?:edit|media))?$/)
  return match?.[1] === 'new' ? undefined : match?.[1]
}
