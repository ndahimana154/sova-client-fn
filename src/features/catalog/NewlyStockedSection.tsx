import type { Product } from '../../data/catalog'
import { InfiniteProductGrid } from './InfiniteProductGrid'

interface NewlyStockedSectionProps {
  favoriteProductNames: string[]
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
}

export function NewlyStockedSection({ favoriteProductNames, onAdd, onFavorite, onOpen }: NewlyStockedSectionProps) {
  return (
    <section className="page-container section-space" id="newly-stocked">
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Fresh from our sellers</p>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Newly stocked</h2>
      </div>
      <InfiniteProductGrid
        emptyMessage="No products have been stocked yet."
        favoriteProductNames={favoriteProductNames}
        onAdd={onAdd}
        onFavorite={onFavorite}
        onOpen={onOpen}
      />
    </section>
  )
}
