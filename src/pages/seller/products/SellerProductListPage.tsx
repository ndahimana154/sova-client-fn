import { ChevronDown, Edit3, Eye, Image, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, PageTitle, StatusBadge, errorMessage } from '../../../components/seller/products/ProductPageUi'
import { DataTable } from '../../../components/ui/DataTable'
import { formatPrice } from '../../../lib/formatPrice'
import { sellerProductsApi, type SellerCategory, type SellerProduct } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductListPage() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const load = useCallback(async () => {
    try {
      const result = await sellerProductsApi.list({ categoryId, limit, page, search, sortBy: 'updatedAt', sortOrder: 'desc' })
      setProducts(result.contents); setMeta(result.meta)
    } catch (cause) { setError(errorMessage(cause)) }
  }, [categoryId, limit, page, search])
  useEffect(() => { void load() }, [load])
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch(() => undefined) }, [])
  async function remove(product: SellerProduct) {
    if (!window.confirm(`Delete “${product.name}”?`)) return
    try { await sellerProductsApi.delete(product.id); await load() } catch (cause) { setError(errorMessage(cause)) }
  }
  return <div className="space-y-5 p-5">
    <PageTitle title="Products" subtitle="Manage your shop catalogue." actions={<Link className="seller-primary-button" to={appPaths.sellerProductCreate}><Plus size={14} /> New product</Link>} />
    <Feedback error={error} />
    <DataTable columns={['Product', 'Category', 'Price', 'Stock', 'Quantity']} onSearchChange={(value) => { setPage(1); setSearch(value) }} searchPlaceholder="Search products"
      filters={<select className="seller-filter-select" onChange={(e) => { setPage(1); setCategoryId(e.target.value) }} value={categoryId}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      pagination={{ page, pageSize: limit, totalItems: meta.totalItems, totalPages: meta.totalPages, onPageChange: setPage, onPageSizeChange: (value) => { setLimit(value); setPage(1) } }}
      rows={products.map((product) => [
        <strong>{product.name}</strong>,
        product.category.name,
        formatPrice(product.finalPrice),
        <StatusBadge value={product.stockStatus} />,
        product.quantity,
      ])}
      rowActions={(index) => <ProductActions
        dropUp={index >= products.length - 2}
        onDelete={() => void remove(products[index])}
        product={products[index]}
      />} />
  </div>
}

function ProductActions({ dropUp, onDelete, product }: {
  dropUp: boolean
  onDelete: () => void
  product: SellerProduct
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="seller-outline-button min-w-[94px] justify-between"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Actions <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={13} />
      </button>
      {open && (
        <div className={`absolute left-0 z-30 min-w-44 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-xl ${dropUp ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'}`} role="menu">
          <ActionLink icon={<Eye size={14} />} label="View details" to={appPaths.sellerProductDetails(product.id)} />
          <ActionLink icon={<Edit3 size={14} />} label="Edit product" to={appPaths.sellerProductEdit(product.id)} />
          <ActionLink icon={<Image size={14} />} label="Manage media" to={appPaths.sellerProductMedia(product.id)} />
          <div className="my-1 border-t border-line" />
          <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50" onClick={() => { setOpen(false); onDelete() }} role="menuitem" type="button">
            <Trash2 size={14} /> Delete product
          </button>
        </div>
      )}
    </div>
  )
}

function ActionLink({ icon, label, to }: { icon: ReactNode; label: string; to: string }) {
  return <Link className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-soft" role="menuitem" to={to}>{icon}{label}</Link>
}
