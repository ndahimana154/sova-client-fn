export interface Category {
  color: string
  image: string
  name: string
}

export interface Product {
  badge?: string
  /** Present only on products loaded from the API. */
  slug?: string
  brand?: string
  category: string
  image: string
  name: string
  oldPrice?: number
  price: number
  rating: number
  reviews: number
  /**
   * How many SKUs the product sells as. More than one means the shopper has to
   * choose on the product page before it can go in a cart.
   */
  variantCount?: number
  /** The SKU this entry stands for, once one has been chosen. */
  variantId?: string
}

export const categories: Category[] = [
  { name: 'Electronics', color: '#eaf3ff', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Fashion', color: '#fff0e8', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Home & Living', color: '#edf7ed', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80' },
  { name: 'Beauty', color: '#fff0f4', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80' },
  { name: 'Groceries', color: '#f4f8e7', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Sports', color: '#edf5f6', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80' },
]

export const products: Product[] = [
  { name: 'Studio wireless headphones', brand: 'Auralab', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85', price: 129000, oldPrice: 159000, rating: 4.8, reviews: 284, badge: '-19%' },
  { name: 'Essential everyday sneakers', brand: 'Ikaze', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85', price: 74000, rating: 4.7, reviews: 193 },
  { name: 'Minimal ceramic table set', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=85', price: 42000, oldPrice: 52000, rating: 4.9, reviews: 86, badge: 'Deal' },
  { name: 'Hydrating daily skincare set', brand: 'Lumière Botanics', category: 'Beauty', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=85', price: 58000, rating: 4.6, reviews: 147 },
  { name: 'Smart fitness watch', brand: 'PulseTech', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85', price: 98000, oldPrice: 119000, rating: 4.8, reviews: 321, badge: '-18%' },
]

export const homeProducts: Product[] = [
  { name: 'Lounge accent chair', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=85', price: 185000, rating: 4.8, reviews: 64 },
  { name: 'Stoneware vase collection', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=85', price: 36000, oldPrice: 44000, rating: 4.7, reviews: 72 },
  { name: 'Modern pendant lamp', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=700&q=85', price: 68000, rating: 4.9, reviews: 105, badge: 'Popular' },
  { name: 'Soft woven throw blanket', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=700&q=85', price: 29000, rating: 4.6, reviews: 88 },
  { name: 'Handmade storage basket', brand: 'Nuru Home', category: 'Home', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=85', price: 24000, rating: 4.7, reviews: 51 },
]

export const brands = [...new Set(
  [...products, ...homeProducts]
    .map((product) => product.brand)
    .filter((brand): brand is string => Boolean(brand)),
)]
