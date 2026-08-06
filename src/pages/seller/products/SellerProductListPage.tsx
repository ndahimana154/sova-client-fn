import { Edit3, Eye, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, PageTitle, StatusBadge, errorMessage } from '../../../components/seller/products/ProductPageUi'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select'
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
      filters={<Select
        className="w-52"
        onChange={(value) => { setPage(1); setCategoryId(value) }}
        options={[{ label: 'All categories', value: '' }, ...categories.map((item) => ({ label: item.name, value: item.id }))]}
        placeholder="All categories"
        size="sm"
        value={categoryId}
      />}
      pagination={{ page, pageSize: limit, totalItems: meta.totalItems, totalPages: meta.totalPages, onPageChange: setPage, onPageSizeChange: (value) => { setLimit(value); setPage(1) } }}
      rows={products.map((product) => [
        <strong>{product.name}</strong>,
        product.category.name,
        formatPrice(product.finalPrice),
        <StatusBadge value={product.stockStatus} />,
        product.quantity,
      ])}
      rowActions={(index) => <ProductActions
        onDelete={() => void remove(products[index])}
        product={products[index]}
      />} />
  </div>
}

function ProductActions({ onDelete, product }: {
  onDelete: () => void
  product: SellerProduct
}) {
  return (
    <ActionMenu items={[
      { icon: <Eye size={14} />, label: 'View details', to: appPaths.sellerProductDetails(product.id) },
      { icon: <Edit3 size={14} />, label: 'Edit product', to: appPaths.sellerProductEdit(product.id) },
      { danger: true, icon: <Trash2 size={14} />, label: 'Delete product', onSelect: onDelete, separatorBefore: true },
    ]} />
  )
}
