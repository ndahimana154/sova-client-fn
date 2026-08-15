import { Heart, ShoppingBag, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../data/catalog'
import { formatPrice } from '../../lib/formatPrice'
import { appPaths } from '../../router/paths'

interface ProductCardProps {
  isFavorite: boolean
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
  product: Product
}

export function ProductCard({ isFavorite, onAdd, onFavorite, onOpen, product }: ProductCardProps) {
  return (
    <article className="product-card group">
      <div className="relative aspect-[1/1.02] overflow-hidden rounded-2xl bg-soft">
        <ProductLink className="block size-full cursor-pointer" label={`View ${product.name}`} onOpen={onOpen} product={product}>
          <img alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" src={product.image} />
        </ProductLink>
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-white">{product.badge}</span>}
        <button
          aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
          aria-pressed={isFavorite}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:text-primary ${isFavorite ? 'text-primary' : 'text-ink'}`}
          onClick={() => onFavorite(product)}
        >
          <Heart className={isFavorite ? 'fill-current' : ''} size={17} />
        </button>
        <AddControl className="quick-add quick-add-desktop" onAdd={onAdd} product={product} />
      </div>
      <div className="pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink">
          <ProductLink className="text-left transition hover:text-primary-dark" onOpen={onOpen} product={product}>{product.name}</ProductLink>
        </h3>
        {product.reviews > 0 && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted">
            <Star className="fill-primary text-primary" size={13} /><strong className="text-ink">{product.rating}</strong><span>({product.reviews})</span>
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-base text-ink">{formatPrice(product.price)}</strong>
          {product.oldPrice && <span className="text-xs text-muted line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <AddControl className="quick-add quick-add-touch" onAdd={onAdd} product={product} />
      </div>
    </article>
  )
}

/**
 * A product that sells in more than one version cannot go straight in the cart —
 * there is no way to know which SKU was meant — so it sends the shopper to the
 * page where the options live instead.
 */
function AddControl({ className, onAdd, product }: {
  className: string
  onAdd: (product: Product) => void
  product: Product
}) {
  if (product.slug && (product.variantCount ?? 1) > 1) {
    return (
      <Link className={className} to={appPaths.productDetails(product.slug)}>
        <ShoppingBag size={15} /> Choose options
      </Link>
    )
  }
  return (
    <button className={className} onClick={() => onAdd(product)} type="button">
      <ShoppingBag size={15} /> Add to cart
    </button>
  )
}

/**
 * Real anchor for products that have a URL, so crawlers and middle-click work.
 * Catalogue entries without a slug fall back to the click handler.
 */
function ProductLink({ children, className, label, onOpen, product }: {
  children: ReactNode
  className: string
  label?: string
  onOpen: (product: Product) => void
  product: Product
}) {
  if (product.slug) {
    return <Link aria-label={label} className={className} to={appPaths.productDetails(product.slug)}>{children}</Link>
  }
  return <button aria-label={label} className={className} onClick={() => onOpen(product)} type="button">{children}</button>
}
