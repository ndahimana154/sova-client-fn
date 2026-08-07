import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MarketplaceCategory } from '../../lib/marketplaceApi'
import { appPaths } from '../../router/paths'

const MAX_INLINE = 5

export function CategoryNav({ categories }: {
  categories: MarketplaceCategory[]
}) {
  const [openId, setOpenId] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!openId) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpenId('')
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenId('') }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openId])

  if (!categories.length) return null

  const inline = categories.slice(0, MAX_INLINE)
  const overflow = categories.slice(MAX_INLINE)

  function select(category: MarketplaceCategory) {
    setOpenId('')
    navigate(appPaths.categoryDetails(category.slug))
  }

  return (
    <div className="flex min-w-0 items-center gap-6" ref={containerRef}>
      {inline.map((category) => (
        <CategoryTrigger
          category={category}
          key={category.id}
          onSelect={select}
          onToggle={() => setOpenId((current) => (current === category.id ? '' : category.id))}
          open={openId === category.id}
        />
      ))}
      {overflow.length > 0 && (
        <CategoryTrigger
          category={{ children: overflow, id: '__more', imageUrl: null, name: 'More', slug: '__more' }}
          onSelect={select}
          onToggle={() => setOpenId((current) => (current === '__more' ? '' : '__more'))}
          open={openId === '__more'}
        />
      )}
    </div>
  )
}

function CategoryTrigger({ category, onSelect, onToggle, open }: {
  category: MarketplaceCategory
  onSelect: (category: MarketplaceCategory) => void
  onToggle: () => void
  open: boolean
}) {
  const hasChildren = category.children.length > 0
  return (
    <div className="relative">
      <button
        aria-expanded={hasChildren ? open : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        className={`flex items-center gap-1 whitespace-nowrap transition-colors hover:text-primary ${open ? 'text-primary' : ''}`}
        onClick={() => (hasChildren ? onToggle() : onSelect(category))}
        type="button"
      >
        {category.name}
        {hasChildren && <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={13} />}
      </button>
      {hasChildren && open && (
        <CategoryMenu
          items={category.children}
          onSelect={onSelect}
          parent={category.id === '__more' ? undefined : category}
        />
      )}
    </div>
  )
}

/** One dropdown level. Children with their own children open a flyout beside it. */
function CategoryMenu({ depth = 0, items, onSelect, parent }: {
  depth?: number
  items: MarketplaceCategory[]
  onSelect: (category: MarketplaceCategory) => void
  parent?: MarketplaceCategory
}) {
  const [activeId, setActiveId] = useState('')
  return (
    <div
      className={`absolute z-50 min-w-56 rounded-xl border border-line bg-white py-1.5 shadow-[0_20px_50px_rgb(23_26_31/0.16)] ${
        depth === 0 ? 'left-0 top-[calc(100%+10px)]' : 'left-full top-0 -mt-1.5 ml-0.5'
      }`}
      role="menu"
    >
      {parent && (
        <>
          <button
            className="flex w-full items-center px-3.5 py-2 text-left text-xs font-bold text-primary-dark hover:bg-primary-light/60"
            onClick={() => onSelect(parent)}
            role="menuitem"
            type="button"
          >
            All {parent.name}
          </button>
          <div className="my-1 border-t border-line" />
        </>
      )}
      {items.map((item) => {
        const hasChildren = item.children.length > 0
        return (
          <div className="relative" key={item.id} onMouseEnter={() => setActiveId(item.id)}>
            <button
              aria-expanded={hasChildren ? activeId === item.id : undefined}
              aria-haspopup={hasChildren ? 'menu' : undefined}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs text-ink hover:bg-soft"
              onClick={() => (hasChildren ? setActiveId((current) => (current === item.id ? '' : item.id)) : onSelect(item))}
              role="menuitem"
              type="button"
            >
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {hasChildren && <ChevronRight className="shrink-0 text-muted" size={13} />}
            </button>
            {hasChildren && activeId === item.id && (
              <CategoryMenu depth={depth + 1} items={item.children} onSelect={onSelect} parent={item} />
            )}
          </div>
        )
      })}
    </div>
  )
}
