import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Product } from '../../data/catalog'
import { ProductCard } from '../../features/catalog/ProductCard'
import { formatPrice } from '../../lib/formatPrice'

interface Review {
  comment: string
  date: string
  id: string
  images: string[]
  name: string
  rating: number
  title: string
}

interface ProductDetailPageProps {
  allProducts: Product[]
  favoriteProductNames: string[]
  onAddToCart: (product: Product, quantity?: number) => void
  onBrandOpen: (brand: string) => void
  onProductOpen: (product: Product) => void
  onToggleFavorite: (product: Product) => void
  product: Product
}

const sampleReviews: Review[] = [
  {
    id: 'sample-1',
    name: 'Aline M.',
    rating: 5,
    title: 'Exactly what I hoped for',
    comment: 'The quality is excellent and it arrived carefully packed. It looks even better in person.',
    date: '18 July 2026',
    images: [],
  },
  {
    id: 'sample-2',
    name: 'Patrick K.',
    rating: 4,
    title: 'Very happy with my purchase',
    comment: 'Good value and accurate description. Delivery was quick and the product has been easy to use.',
    date: '06 July 2026',
    images: [],
  },
]

export function ProductDetailPage({
  allProducts,
  favoriteProductNames,
  onAddToCart,
  onBrandOpen,
  onProductOpen,
  onToggleFavorite,
  product,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1)
  const gallery = galleryFor(product)
  const [selectedImage, setSelectedImage] = useState(gallery[0])
  const [selectedSize, setSelectedSize] = useState(sizeOptions(product)[0])
  const [guideOpen, setGuideOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [reviewError, setReviewError] = useState('')
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews(product))
  const reviewForm = useRef<HTMLFormElement>(null)
  const isFavorite = favoriteProductNames.includes(product.name)
  const stock = stockFor(product)
  const customerRatingCount = product.reviews + reviews.filter((review) => !review.id.startsWith('sample-')).length

  const relatedProducts = useMemo(() => {
    const sameCategory = allProducts.filter((item) => item.name !== product.name && item.category === product.category)
    const others = allProducts.filter((item) => item.name !== product.name && item.category !== product.category)
    return [...sameCategory, ...others].slice(0, 4)
  }, [allProducts, product])

  function readImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3 - reviewImages.length)
    if (files.some((file) => file.size > 2_000_000)) {
      setReviewError('Each photo must be smaller than 2 MB.')
      return
    }
    setReviewError('')
    Promise.all(files.map(fileToDataUrl)).then((images) => setReviewImages((current) => [...current, ...images].slice(0, 3)))
    event.target.value = ''
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reviewRating) {
      setReviewError('Choose a star rating before posting your review.')
      return
    }
    const data = new FormData(event.currentTarget)
    const review: Review = {
      id: `${Date.now()}`,
      name: String(data.get('name')).trim(),
      title: String(data.get('title')).trim(),
      comment: String(data.get('comment')).trim(),
      rating: reviewRating,
      images: reviewImages,
      date: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
    }
    const nextReviews = [review, ...reviews]
    setReviews(nextReviews)
    try {
      localStorage.setItem(reviewStorageKey(product), JSON.stringify(nextReviews.filter((item) => !item.id.startsWith('sample-'))))
    } catch {
      setReviewError('Your review was posted for this session, but its photos were too large to save after refresh.')
    }
    setReviewRating(0)
    setReviewImages([])
    reviewForm.current?.reset()
  }

  return (
    <main className="bg-white">
      <div className="page-container py-6 sm:py-10">
        <a className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" href="#">
          <ChevronLeft size={16} /> Back to shopping
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-14">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-soft sm:aspect-[1.08/1]">
              <img alt={product.name} className="size-full object-cover transition-opacity duration-300" src={selectedImage} />
              {product.badge && <span className="absolute left-5 top-5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white">{product.badge}</span>}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <button
                  aria-label={`View image ${index + 1} of ${product.name}`}
                  aria-pressed={selectedImage === image}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-soft transition ${selectedImage === image ? 'border-primary opacity-100' : 'border-transparent opacity-65 hover:opacity-100'}`}
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  <img alt="" className="size-full object-cover" src={image} />
                </button>
              ))}
            </div>
          </section>

          <section className="lg:py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-dark">{product.category}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.045em] text-ink sm:text-4xl">{product.name}</h1>
            <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-primary-dark" onClick={() => onBrandOpen(product.brand ?? 'SOVA Select')} type="button">
              Visit the official {product.brand ?? 'SOVA Select'} store <ChevronRight size={14} />
            </button>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => <Star className={star <= Math.round(product.rating) ? 'fill-primary text-primary' : 'text-line'} key={star} size={16} />)}
              </div>
              <strong className="text-sm text-ink">{product.rating}</strong>
              <a className="text-xs text-muted underline-offset-4 hover:text-primary-dark hover:underline" href="#reviews">{customerRatingCount} customer reviews</a>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <strong className="text-2xl text-ink">{formatPrice(product.price)}</strong>
              {product.oldPrice && <span className="text-sm text-muted line-through">{formatPrice(product.oldPrice)}</span>}
            </div>

            <div className="mt-7 flex gap-3">
              <div className="flex h-12 items-center rounded-xl border border-line">
                <button aria-label="Decrease quantity" className="grid size-11 place-items-center text-muted hover:text-ink" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus size={16} /></button>
                <span className="w-7 text-center text-sm font-black">{quantity}</span>
                <button aria-label="Increase quantity" className="grid size-11 place-items-center text-muted hover:text-ink" onClick={() => setQuantity((value) => Math.min(stock, value + 1))} type="button"><Plus size={16} /></button>
              </div>
              <button className="auth-submit flex-1" onClick={() => onAddToCart(product, quantity)} type="button"><ShoppingBag size={17} /> Add to cart</button>
              <button aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'} className={`grid size-12 shrink-0 place-items-center rounded-xl border border-line transition hover:border-primary ${isFavorite ? 'bg-primary-light text-primary' : 'text-ink'}`} onClick={() => onToggleFavorite(product)} type="button">
                <Heart className={isFavorite ? 'fill-current' : ''} size={19} />
              </button>
            </div>

            <div className="mt-8 border-y border-line py-6">
              <h2 className="text-sm font-black text-ink">Product details</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{sellerDescription(product)}</p>
              <dl className="mt-5 divide-y divide-line rounded-xl border border-line px-4">
                {sellerDetails(product).map(([label, value]) => (
                  <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-xs" key={label}>
                    <dt className="font-bold text-ink">{label}</dt>
                    <dd className="text-muted">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted">
              <span className="flex items-center gap-2"><Truck className="text-primary-dark" size={18} /> Fast local delivery</span>
              <span className="flex items-center gap-2"><ShieldCheck className="text-primary-dark" size={18} /> Secure checkout</span>
            </div>
          </section>
        </div>
      </div>

      <section className="border-y border-line bg-soft/60 py-12 sm:py-16" id="reviews">
        <div className="page-container grid gap-10 lg:grid-cols-[minmax(300px,0.65fr)_minmax(0,1.35fr)]">
          <div>
            <p className="auth-eyebrow">Real customer feedback</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">Ratings &amp; reviews</h2>
            <div className="mt-6 flex items-end gap-4">
              <strong className="text-5xl font-black tracking-tight text-ink">{product.rating}</strong>
              <div className="pb-1">
                <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star className={star <= Math.round(product.rating) ? 'fill-primary text-primary' : 'text-line'} key={star} size={17} />)}</div>
                <p className="mt-1 text-xs text-muted">Based on {customerRatingCount} ratings</p>
              </div>
            </div>

            <form className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft" onSubmit={submitReview} ref={reviewForm}>
              <h3 className="text-lg font-black text-ink">Share your experience</h3>
              <p className="mt-1 text-xs text-muted">Your review helps other SOVA customers.</p>
              <div className="mt-5">
                <span className="text-xs font-bold text-ink">Your rating</span>
                <div className="mt-2 flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button aria-label={`${star} star rating`} key={star} onClick={() => setReviewRating(star)} onMouseEnter={() => setHoveredRating(star)} type="button">
                      <Star className={`${star <= (hoveredRating || reviewRating) ? 'fill-primary text-primary' : 'text-line'} transition`} size={25} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-ink">Display name</span>
                <input className="review-input" name="name" placeholder="Your name" required type="text" />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-ink">Review title</span>
                <input className="review-input" name="title" placeholder="Summarize your experience" required type="text" />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-ink">Your comment</span>
                <textarea className="review-input min-h-28 resize-y" name="comment" placeholder="What did you like? How did it fit or perform?" required />
              </label>
              <div className="mt-4">
                <span className="text-xs font-bold text-ink">Add photos <span className="font-normal text-muted">(up to 3)</span></span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reviewImages.map((image, index) => (
                    <span className="relative size-16 overflow-hidden rounded-xl bg-soft" key={image}>
                      <img alt={`Review upload ${index + 1}`} className="size-full object-cover" src={image} />
                      <button aria-label={`Remove photo ${index + 1}`} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-ink text-white" onClick={() => setReviewImages((images) => images.filter((_, imageIndex) => imageIndex !== index))} type="button"><X size={11} /></button>
                    </span>
                  ))}
                  {reviewImages.length < 3 && (
                    <label className="grid size-16 cursor-pointer place-items-center rounded-xl border border-dashed border-ink/25 text-muted transition hover:border-primary hover:text-primary-dark">
                      <Camera size={20} />
                      <input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={readImages} type="file" />
                    </label>
                  )}
                </div>
              </div>
              {reviewError && <p className="mt-3 text-xs font-semibold text-red-600" role="alert">{reviewError}</p>}
              <button className="auth-submit mt-5" type="submit">Post review</button>
            </form>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <article className="rounded-2xl border border-line bg-white p-5 sm:p-6" key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => <Star className={star <= review.rating ? 'fill-primary text-primary' : 'text-line'} key={star} size={14} />)}
                    </div>
                    <h3 className="mt-2 text-sm font-black text-ink">{review.title}</h3>
                  </div>
                  <span className="text-[11px] text-muted">{review.date}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{review.comment}</p>
                {review.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.images.map((image, index) => <img alt={`Photo from ${review.name}'s review ${index + 1}`} className="size-24 rounded-xl object-cover" key={image} src={image} />)}
                  </div>
                )}
                <p className="mt-4 text-xs font-bold text-ink">{review.name} <span className="ml-2 font-medium text-green-700">Verified customer</span></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-12 sm:py-16">
        <p className="auth-eyebrow">You may also like</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">Related products</h2>
        <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:gap-5">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard
              isFavorite={favoriteProductNames.includes(relatedProduct.name)}
              key={relatedProduct.name}
              onAdd={(item) => onAddToCart(item)}
              onFavorite={onToggleFavorite}
              onOpen={onProductOpen}
              product={relatedProduct}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

function reviewStorageKey(product: Product) {
  return `sova-product-reviews-${product.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
}

function loadReviews(product: Product): Review[] {
  try {
    const saved = JSON.parse(localStorage.getItem(reviewStorageKey(product)) || '[]') as Review[]
    return [...saved, ...sampleReviews]
  } catch {
    return sampleReviews
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function stockFor(product: Product) {
  return 3 + (product.name.length % 8)
}

function sizeOptions(product: Product) {
  if (product.category === 'Fashion') return ['38', '39', '40', '41', '42', '43']
  if (product.category === 'Home') return ['Small', 'Medium', 'Large']
  if (product.category === 'Beauty') return ['Travel', 'Full size']
  return ['Standard']
}

function fitGuide(product: Product) {
  if (product.category === 'Fashion') return 'Choose your usual EU size. If you are between sizes, select the larger size for a more relaxed fit.'
  if (product.category === 'Home') return 'Small suits shelves and side tables, Medium suits most rooms, and Large works best as a statement piece.'
  if (product.category === 'Beauty') return 'Travel is ideal for trial and carry-on use. Full size is designed for a complete daily routine.'
  return 'This product comes in a universal standard size. Check the product features below for compatibility information.'
}

function galleryFor(product: Product) {
  const galleryByCategory: Record<string, string[]> = {
    Electronics: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1100&q=88',
    ],
    Fashion: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1100&q=88',
    ],
    Home: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1100&q=88',
    ],
    Beauty: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1100&q=88',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1100&q=88',
    ],
  }
  return [product.image.replace('w=700', 'w=1100'), ...(galleryByCategory[product.category] ?? galleryByCategory.Home)]
}

function sellerDescription(product: Product) {
  const descriptions: Record<string, string> = {
    Electronics: `${product.brand} designed this item for dependable everyday performance, straightforward setup, and comfortable long-term use.`,
    Fashion: `${product.brand} created this piece with an easy everyday fit, durable construction, and versatile styling in mind.`,
    Home: `${product.brand} selected this piece to bring warmth, function, and a clean contemporary finish to everyday spaces.`,
    Beauty: `${product.brand} developed this coordinated routine to make daily care gentle, effective, and simple to maintain.`,
  }
  return descriptions[product.category] ?? `The seller selected ${product.name} for its practical design, dependable quality, and easy everyday use.`
}

function sellerDetails(product: Product): [string, string][] {
  const details: Record<string, [string, string][]> = {
    Electronics: [['Condition', 'Brand new'], ['Connectivity', 'Wireless / standard compatible'], ['What’s included', 'Product, charging cable, and user guide'], ['Warranty', '12-month seller warranty'], ['Care', 'Keep dry and clean with a soft cloth']],
    Fashion: [['Fit', 'Regular, true-to-size fit'], ['Material', 'Breathable mixed upper with cushioned lining'], ['Sole', 'Flexible, high-grip rubber'], ['Care', 'Spot clean and air dry'], ['Origin', `Designed by ${product.brand}`]],
    Home: [['Material', 'Seller-selected, durable household materials'], ['Finish', 'Easy-care contemporary finish'], ['Placement', 'Suitable for dry indoor spaces'], ['Care', 'Wipe gently with a clean, soft cloth'], ['Packed by', product.brand ?? 'SOVA Select']],
    Beauty: [['Routine', 'Suitable for daily use'], ['Skin feel', 'Lightweight and hydrating'], ['Package', 'Coordinated full-size set'], ['Storage', 'Store in a cool, dry place'], ['Seller', product.brand ?? 'SOVA Select']],
  }
  return details[product.category] ?? [['Condition', 'Brand new'], ['Seller', product.brand ?? 'SOVA Select'], ['Quality', 'Inspected before dispatch'], ['Care', 'Follow the included care instructions']]
}