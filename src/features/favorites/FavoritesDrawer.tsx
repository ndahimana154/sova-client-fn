import { Heart, ShoppingBag, Trash2, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Drawer } from '../../components/ui/Drawer'
import type { Product } from '../../data/catalog'
import { formatMoney } from '../../lib/money'
import { appPaths } from '../../router/paths'

interface FavoritesDrawerProps {
  items: Product[]
  onBuyNow: (product: Product) => void
  onClear: () => void
  onClose: () => void
  onRemove: (product: Product) => void
}

export function FavoritesDrawer({ items, onBuyNow, onClear, onClose, onRemove }: FavoritesDrawerProps) {
  return (
    <Drawer
      ariaLabel="Favorite products"
      onClose={onClose}
      subtitle={`${items.length} ${items.length === 1 ? 'saved product' : 'saved products'}`}
      title="Your favorites"
    >
      {items.length === 0 ? (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary-light text-primary-dark"><Heart size={26} /></span>
            <h3 className="mt-5 font-bold text-ink">No favorites yet</h3>
            <p className="mt-2 text-sm text-muted">Tap the heart on a product to save it for later.</p>
            <Link className="primary-button mt-6"
              onClick={onClose}
              to={appPaths.home}>
              Explore products
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {items.map((product) => (
              <article className="flex gap-4" key={product.name}>
                <img alt="" className="size-24 shrink-0 rounded-2xl bg-soft object-cover" src={product.image} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{product.category}</p>
                  <h3 className="mt-1 text-sm font-bold leading-5 text-ink">{product.name}</h3>
                  <strong className="mt-1 block text-sm text-ink">{formatMoney(product.price)}</strong>
                  <div className="mt-3 flex items-center gap-2">
                    {product.slug && (product.variantCount ?? 1) > 1 ? (
                      <Link
                        className="primary-button !px-4 !py-2"
                        onClick={onClose}
                        to={appPaths.productDetails(product.slug)}
                      >
                        <ShoppingBag size={14} /> Choose options
                      </Link>
                    ) : (
                      <button className="primary-button !px-4 !py-2" onClick={() => onBuyNow(product)}>
                        <Zap size={14} /> Buy now
                      </button>
                    )}
                    <button
                      aria-label={`Remove ${product.name} from favorites`}
                      className="grid size-8 place-items-center rounded-full text-muted hover:bg-soft hover:text-red-600"
                      onClick={() => onRemove(product)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="border-t border-line p-5">
            <button
              className="secondary-button w-full gap-2 text-muted hover:border-red-200 hover:text-red-600"
              onClick={onClear}
              type="button"
            >
              <Trash2 size={14} /> Clear all favorites
            </button>
          </div>
        </>
      )}
    </Drawer>
  )
}
