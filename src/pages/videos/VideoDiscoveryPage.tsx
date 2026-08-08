import { ArrowDown, ArrowUp, Heart, MessageCircle, Play, Send, ShoppingBag, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SignInPrompt } from '../../components/ui/SignInPrompt'
import { VideoComments } from '../../features/videos/VideoComments'
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos'
import { marketplaceApi } from '../../lib/marketplaceApi'
import { useAppSelector } from '../../store/hooks'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceVideoProduct } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { appPaths } from '../../router/paths'

export function VideoDiscoveryPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { hasNextPage, loadNext, loading, videos } = useInfiniteVideos(8)
  const requestedId = params.get('video')
  const [active, setActive] = useState(0)
  const [jumped, setJumped] = useState(false)
  const [muted, setMuted] = useState(false)
  const [soundBlocked, setSoundBlocked] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [signInFor, setSignInFor] = useState('')
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({})
  const session = useAppSelector((state) => state.auth.session)
  const authenticated = Boolean(session)

  async function toggleLike() {
    if (!video) return
    if (!authenticated) { setSignInFor('like this video'); return }
    const current = likes[video.id] ?? { count: video.likeCount, liked: video.liked }
    const next = !current.liked
    // Optimistic: the tap should feel instant, and we reconcile on the response.
    setLikes((state) => ({
      ...state,
      [video.id]: { count: current.count + (next ? 1 : -1), liked: next },
    }))
    try {
      const result = await marketplaceApi.setVideoLike(video.id, next)
      setLikes((state) => ({ ...state, [video.id]: { count: result.likeCount, liked: result.liked } }))
    } catch {
      setLikes((state) => ({ ...state, [video.id]: current }))
    }
  }
  const slides = useRef<Array<HTMLElement | null>>([])
  const players = useRef<Array<HTMLVideoElement | null>>([])

  const move = useCallback((direction: -1 | 1) => {
    const next = Math.min(videos.length - 1, Math.max(0, active + direction))
    slides.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(next)
  }, [active, videos.length])

  // Jump to the video the visitor clicked, once it has arrived.
  useEffect(() => {
    if (jumped || !requestedId || !videos.length) return
    const index = videos.findIndex((video) => video.id === requestedId)
    if (index < 0) return
    slides.current[index]?.scrollIntoView({ block: 'start' })
    setActive(index)
    setJumped(true)
  }, [jumped, requestedId, videos])

  // Pull the next page as the viewer nears the end of the loaded reel.
  useEffect(() => {
    if (videos.length && active >= videos.length - 3) loadNext()
  }, [active, loadNext, videos.length])

  // Play the video in view with sound. `videos.length` matters: the first page
  // arrives after mount, so without it the opening video would never start.
  useEffect(() => {
    players.current.forEach((player, index) => {
      if (!player) return
      if (index !== active) { player.pause(); return }
      player.muted = muted
      void player.play().catch(() => {
        // Browsers refuse unmuted autoplay until the visitor interacts with the
        // page, so drop to silent playback rather than showing a frozen frame.
        player.muted = true
        setMuted(true)
        setSoundBlocked(true)
        void player.play().catch(() => undefined)
      })
    })
  }, [active, muted, videos.length])

  // Once that first interaction happens, give the sound back.
  useEffect(() => {
    if (!soundBlocked) return
    function restoreSound(event: Event) {
      // Typing is not the "first interaction" that should unmute the video.
      if (event.type === 'keydown' && isTypingTarget(event.target)) return
      setMuted(false)
      setSoundBlocked(false)
    }
    // Not `once`: a keystroke in a text field must not consume the listener.
    window.addEventListener('pointerdown', restoreSound)
    window.addEventListener('keydown', restoreSound)
    return () => {
      window.removeEventListener('pointerdown', restoreSound)
      window.removeEventListener('keydown', restoreSound)
    }
  }, [soundBlocked])

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      // Never steal keys from a field: space, j/k, m and the arrows all belong
      // to whoever is typing.
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); move(1) }
      if (event.key === 'ArrowUp' || event.key === 'k') { event.preventDefault(); move(-1) }
      if (event.key === ' ') {
        event.preventDefault()
        const player = players.current[active]
        if (player?.paused) void player.play()
        else player?.pause()
      }
      if (event.key === 'm') setMuted((value) => !value)
      if (event.key === 'Escape') setCommentsOpen(false)
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [active, move])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting && entry.intersectionRatio > .65)
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.index))
    }, { threshold: [.65] })
    slides.current.forEach((slide) => { if (slide) observer.observe(slide) })
    return () => observer.disconnect()
  }, [videos.length])

  const video = videos[active]
  const likeState = video
    ? likes[video.id] ?? { count: video.likeCount, liked: video.liked }
    : { count: 0, liked: false }

  if (!videos.length) {
    return (
      <main className="grid h-[100dvh] place-items-center bg-[#090909] text-white">
        <div className="text-center">
          <p className="text-sm text-white/70">{loading ? 'Loading videos…' : 'No videos have been posted yet.'}</p>
          <Link className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold text-ink" to={appPaths.home}>Back to shopping</Link>
        </div>
      </main>
    )
  }
  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#090909] text-white">
      <header className={`pointer-events-none fixed left-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-4 transition-[right] sm:p-6 ${commentsOpen ? 'right-0 sm:right-96' : 'right-0'}`}>
        <Link className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-ink shadow-sm" to={appPaths.home}><img alt="SOVA" className="h-5 w-auto" src="/sova-logo-horizontal.png" /></Link>
        <strong className="text-sm tracking-tight">The FLOW</strong>
        <Link aria-label="Close video viewer" className="pointer-events-auto grid size-9 place-items-center rounded-full bg-black/40 backdrop-blur hover:bg-black/60" to={appPaths.home}><X size={18} /></Link>
      </header>

      <div className="video-discovery-scroll h-full snap-y snap-mandatory overflow-y-auto">
        {videos.map((item, index) => (
          <section className={`relative grid h-[100dvh] snap-start place-items-center px-3 py-16 transition-[padding] sm:px-16 ${commentsOpen ? 'sm:pr-[26rem]' : ''}`} data-index={index} key={item.id} ref={(node) => { slides.current[index] = node }}>
            <div className="relative h-full max-h-[820px] w-full max-w-[470px] overflow-hidden rounded-2xl bg-black shadow-2xl">
              <video className="size-full object-cover" loop muted={muted} playsInline preload={Math.abs(active - index) <= 1 ? 'metadata' : 'none'} ref={(node) => { players.current[index] = node }} src={mediaUrl(item.url)} />
              <button aria-label="Play or pause" className="absolute inset-0 grid place-items-center" onClick={() => { const player = players.current[index]; if (player?.paused) void player.play(); else player?.pause() }} type="button">
                {index !== active && <span className="grid size-14 place-items-center rounded-full bg-black/35 backdrop-blur"><Play fill="white" size={22} /></span>}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-5 pb-6 pt-24">
                <ProductCard product={item.product} />
                {item.altText && <h1 className="mt-3 max-w-sm text-lg font-bold">{item.altText}</h1>}
              </div>
            </div>
          </section>
        ))}
      </div>

      <aside className={`fixed bottom-24 z-30 flex flex-col gap-4 transition-[right] sm:bottom-20 ${commentsOpen ? 'right-4 sm:right-[25rem]' : 'right-4 sm:right-[max(2rem,calc(50%-300px))]'}`}>
        <SocialButton active={likeState.liked} icon={<Heart fill={likeState.liked ? 'currentColor' : 'none'} />} label={likeState.count ? String(likeState.count) : 'Like'} onClick={() => void toggleLike()} />
        <SocialButton icon={<MessageCircle />} label={commentCount ? String(commentCount) : 'Comment'} onClick={() => setCommentsOpen(true)} />
        <SocialButton icon={<Send />} label="Share" onClick={() => void navigator.clipboard?.writeText(window.location.href)} />
        <SocialButton icon={muted ? <VolumeX /> : <Volume2 />} label={soundBlocked ? 'Tap for sound' : muted ? 'Muted' : 'Sound'} onClick={() => { setSoundBlocked(false); setMuted((value) => !value) }} />
      </aside>

      <nav className={`fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 transition-[right] sm:flex ${commentsOpen ? 'right-[29rem]' : 'right-4'}`}>
        <ArrowButton disabled={active === 0} label="Previous video" onClick={() => move(-1)}><ArrowUp size={18} /></ArrowButton>
        <ArrowButton disabled={active === videos.length - 1 && !hasNextPage} label="Next video" onClick={() => move(1)}><ArrowDown size={18} /></ArrowButton>
      </nav>

      {commentsOpen && video && (
        <VideoComments
          authenticated={authenticated}
          onSignIn={() => setSignInFor('join the conversation')}
          key={video.id}
          mediaId={video.id}
          onClose={() => setCommentsOpen(false)}
          onCountChange={setCommentCount}
        />
      )}

      {signInFor && (
        <SignInPrompt
          action={signInFor}
          onClose={() => setSignInFor('')}
          onSignIn={() => navigate(appPaths.login)}
        />
      )}
    </main>
  )
}

/** The shoppable card under each video: cover image, name, shop and live pricing. */
function ProductCard({ product }: { product: MarketplaceVideoProduct }) {
  const inStock = product.stockStatus === 'IN_STOCK'
  return (
    <Link className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl bg-white/95 p-2 text-ink shadow-lg backdrop-blur transition hover:bg-white" to={appPaths.productDetails(product.slug)}>
      {product.imageUrl
        ? <img alt="" className="size-14 shrink-0 rounded-lg border border-line object-cover" src={mediaUrl(product.imageUrl)} />
        : <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-soft text-muted"><ShoppingBag size={18} /></span>}
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-xs leading-tight">{product.name}</strong>
        <small className="mt-0.5 block truncate text-[10px] font-bold text-muted">{product.shop.name}</small>
        <span className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <strong className="text-xs font-black text-primary-dark">{formatPrice(product.finalPrice)}</strong>
          {product.discount > 0 && <s className="text-[10px] text-muted">{formatPrice(product.price)}</s>}
          {product.discount > 0 && <span className="rounded-full bg-primary-dark/10 px-1.5 py-px text-[9px] font-black text-primary-dark">-{product.discount}%</span>}
          {!inStock && <span className="text-[9px] font-black uppercase tracking-wide text-red-600">Out of stock</span>}
        </span>
      </span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white"><ShoppingBag size={14} /></span>
    </Link>
  )
}

function SocialButton({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={`flex flex-col items-center gap-1 text-[10px] font-bold ${active ? 'text-red-500' : 'text-white'}`} onClick={onClick} type="button"><span className="grid size-11 place-items-center rounded-full bg-black/45 backdrop-blur [&_svg]:size-5">{icon}</span>{label}</button>
}

function ArrowButton({ children, disabled, label, onClick }: { children: ReactNode; disabled: boolean; label: string; onClick: () => void }) {
  return <button aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 disabled:opacity-25" disabled={disabled} onClick={onClick} type="button">{children}</button>
}

/** True when the key belongs to a text field rather than a page shortcut. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}
