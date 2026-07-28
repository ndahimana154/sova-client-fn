import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AttributeEditor, Feedback, Field, PageTitle, attributeRows, attributesObject, errorMessage, type AttributeRow } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { sellerProductsApi, type SellerCategory } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductEditPage() {
  const navigate = useNavigate()
  const { error: loadError, loading, product, setError } = useSellerProduct()
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch(() => undefined) }, [])
  useEffect(() => { if (product) setAttributes(attributeRows(product.defaultVariant.attributes)) }, [product])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!product) return
    setSaving(true); setError('')
    const data = new FormData(event.currentTarget)
    try {
      await sellerProductsApi.update(product.id, { name: String(data.get('name')), description: String(data.get('description')), brand: String(data.get('brand') || '') || null, categoryId: String(data.get('categoryId')) })
      await sellerProductsApi.updateVariant(product.id, product.defaultVariant.id, { sku: String(data.get('sku')), price: Number(data.get('price')), attributes: attributesObject(attributes) })
      navigate(appPaths.sellerProductDetails(product.id), { replace: true })
    } catch (cause) { setError(errorMessage(cause)); setSaving(false) }
  }
  if (loading) return <div className="p-8 text-sm text-muted">Loading product…</div>
  if (!product) return <div className="p-5"><Feedback error={loadError || 'Product not found.'} /></div>
  return <div className="space-y-5 p-5"><PageTitle title="Edit product" subtitle={`Update ${product.name}.`} /><Feedback error={loadError} />
    <form className="seller-card space-y-5 p-5" onSubmit={submit}><div className="grid gap-4 md:grid-cols-2">
      <Field label="Product name"><input defaultValue={product.name} name="name" required /></Field><Field label="Brand"><input defaultValue={product.brand ?? ''} name="brand" /></Field>
      <Field label="Category"><select defaultValue={product.category.id} name="categoryId" required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
      <Field label="SKU"><input defaultValue={product.defaultVariant.sku} name="sku" required /></Field><Field label="Price (RWF)"><input defaultValue={product.defaultVariant.price} min="0" name="price" required step="1" type="number" /></Field>
      <Field className="md:col-span-2" label="Description"><textarea defaultValue={product.description} name="description" required rows={5} /></Field>
    </div><AttributeEditor onChange={setAttributes} rows={attributes} /><div className="flex justify-end"><button className="seller-primary-button" disabled={saving} type="submit"><Save size={14} /> {saving ? 'Saving…' : 'Save changes'}</button></div></form>
  </div>
}
