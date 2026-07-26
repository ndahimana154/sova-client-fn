import { SectionHeader } from '../../components/ui/SectionHeader'
import { brands } from '../../data/catalog'

interface BrandStripProps {
  onBrandOpen: (brand: string) => void
}

export function BrandStrip({ onBrandOpen }: BrandStripProps) {
  return (
    <section className="page-container section-space">
      <SectionHeader eyebrow="Shop with confidence" title="Official brand stores" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((brand, index) => (
          <button
            className="flex min-h-24 items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
            key={brand}
            onClick={() => onBrandOpen(brand)}
            type="button"
          >
            <span className="grid size-11 place-items-center rounded-full text-sm font-black" style={{ backgroundColor: ['#eef4ff', '#fff4ea', '#eef8ef'][index % 3] }}>{brand.slice(0, 2).toUpperCase()}</span>
            <span><strong className="block text-sm text-ink">{brand}</strong><small className="text-[10px] text-muted">Official store</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}
