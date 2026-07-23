import { categories } from '../data/catalog'
import { SectionHeader } from './SectionHeader'

export function CategoryRail() {
  return (
    <section className="page-container section-space" id="categories">
      <SectionHeader eyebrow="Find your thing" title="Shop popular categories" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <a className="category-card group" href="#" key={category.name}>
            <div className="aspect-square overflow-hidden rounded-full" style={{ backgroundColor: category.color }}>
              <img alt={category.name} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" src={category.image} />
            </div>
            <span className="mt-3 text-center text-xs font-bold text-ink sm:text-sm">{category.name}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
