import { Save, Upload } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AttributeEditor, Feedback, Field, PageTitle, attributesObject, errorMessage, type AttributeRow } from '../../../components/seller/products/ProductPageUi'
import { sellerProductsApi, type SellerCategory } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductCreatePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch((cause) => setError(errorMessage(cause))) }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('')
    const data = new FormData(event.currentTarget)
    try {
      const product = await sellerProductsApi.create({
        name: String(data.get('name')), description: String(data.get('description')),
        brand: String(data.get('brand') || '') || undefined, categoryId: String(data.get('categoryId')),
        variants: attributesObject(attributes),
        price: Number(data.get('price')),
        discount: Number(data.get('discount') || 0),
        quantity: Number(data.get('quantity') || 0),
      })
      await Promise.all(files.map((file, index) => sellerProductsApi.uploadMedia(product.id, { file, position: index, isPrimary: index === 0 })))
      navigate(appPaths.sellerProductDetails(product.id), { replace: true })
    } catch (cause) { setError(errorMessage(cause)); setSaving(false) }
  }
  return <div className="space-y-5 p-5"><PageTitle title="Create product" subtitle="Add product information and media to your catalogue." /><Feedback error={error} />
    <form className="seller-card space-y-5 p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Product name"><input name="name" required /></Field><Field label="Brand"><input name="brand" /></Field><Field label="Category"><select name="categoryId" required><option value="">Select category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Price (RWF)"><input min="0" name="price" required step="1" type="number" /></Field><Field label="Discount (RWF)"><input defaultValue="0" min="0" name="discount" step="1" type="number" /></Field><Field label="Quantity"><input defaultValue="0" min="0" name="quantity" step="1" type="number" /></Field><Field className="md:col-span-2" label="Description"><textarea name="description" required rows={5} /></Field></div>
      <AttributeEditor onChange={setAttributes} rows={attributes} />
      <label className="block rounded-xl border border-dashed border-line p-5 text-center"><Upload className="mx-auto mb-2" size={20} /><span className="text-xs font-semibold">Product images or videos</span><input accept="image/*,video/*" className="mt-3 block w-full text-xs" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} type="file" /><small className="mt-2 block text-muted">{files.length} file(s) selected</small></label>
      <div className="flex justify-end"><button className="seller-primary-button" disabled={saving} type="submit"><Save size={14} /> {saving ? 'Saving…' : 'Create product'}</button></div>
    </form>
  </div>
}
