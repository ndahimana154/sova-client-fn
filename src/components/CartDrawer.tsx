import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import type { Product } from '../data/catalog'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartDrawerProps {
  items: CartItem[]
  onClose: () => void
  onQuantityChange: (productName: string, quantity: number) => void
  onRemove: (productName: string) => void
}

export function CartDrawer({ items, onClose, onQuantityChange, onRemove }: CartDrawerProps) {
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[2px]" onMouseDown={onClose}>
      <aside
        aria-label="Shopping cart"
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Your cart</h2>
            <p className="mt-0.5 text-xs text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button aria-label="Close cart" className="icon-control" onClick={onClose}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary-light text-primary-dark"><ShoppingBag size={26} /></span>
              <h3 className="mt-5 font-bold text-ink">Your cart is empty</h3>
              <p className="mt-2 text-sm text-muted">Add something you love and it will appear here.</p>
              <button className="primary-button mt-6" onClick={onClose}>Continue shopping</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map(({ product, quantity }) => (
                <article className="flex gap-4" key={product.name}>
                  <img alt="" className="size-24 shrink-0 rounded-2xl bg-soft object-cover" src={product.image} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{product.category}</p>
                    <h3 className="mt-1 text-sm font-bold leading-5 text-ink">{product.name}</h3>
                    <strong className="mt-1 block text-sm text-ink">{formatPrice(product.price)}</strong>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          aria-label={`Decrease ${product.name} quantity`}
                          className="grid size-8 place-items-center"
                          onClick={() => onQuantityChange(product.name, quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold">{quantity}</span>
                        <button
                          aria-label={`Increase ${product.name} quantity`}
                          className="grid size-8 place-items-center"
                          onClick={() => onQuantityChange(product.name, quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        aria-label={`Remove ${product.name} from cart`}
                        className="grid size-8 place-items-center rounded-full text-muted hover:bg-soft hover:text-red-600"
                        onClick={() => onRemove(product.name)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-line p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <strong className="text-lg text-ink">{formatPrice(subtotal)}</strong>
              </div>
              <button className="primary-button w-full">Proceed to checkout</button>
              <p className="mt-3 text-center text-[11px] text-muted">Delivery fees are calculated at checkout.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function formatPrice(price: number) {
  return `Rwf ${price.toLocaleString()}`
}
