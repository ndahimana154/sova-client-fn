import { Heart, ShoppingBag, Star } from 'lucide-react'
import type { Product } from '../data/catalog'

interface ProductCardProps {
  onAdd: (product: Product) => void
  onFavorite: () => void
  product: Product
}

export function ProductCard({ onAdd, onFavorite, product }: ProductCardProps) {
  return (
    <article className="product-card group">
      <div className="relative aspect-[1/1.02] overflow-hidden rounded-2xl bg-soft">
        <img alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" src={product.image} />
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-white">{product.badge}</span>}
        <button aria-label={`Save ${product.name}`} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur hover:text-primary" onClick={onFavorite}>
          <Heart size={17} />
        </button>
        <button className="quick-add" onClick={() => onAdd(product)}><ShoppingBag size={15} /> Add to cart</button>
      </div>
      <div className="pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink">{product.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted">
          <Star className="fill-primary text-primary" size={13} /><strong className="text-ink">{product.rating}</strong><span>({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-base text-ink">{formatPrice(product.price)}</strong>
          {product.oldPrice && <span className="text-xs text-muted line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
      </div>
    </article>
  )
}

function formatPrice(price: number) {
  return `Rwf ${price.toLocaleString()}`
}
