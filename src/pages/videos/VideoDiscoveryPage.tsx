import { ArrowDown, ArrowUp, Heart, MessageCircle, Play, Send, ShoppingBag, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { homeVideos } from '../../data/homeVideos'
import { formatPrice } from '../../lib/formatPrice'
import { appPaths } from '../../router/paths'

export function VideoDiscoveryPage() {
  const [params] = useSearchParams()
  const requested = Math.max(0, homeVideos.findIndex((video) => video.id === params.get('video')))
  const [active, setActive] = useState(requested)
  const [muted, setMuted] = useState(true)
  const [liked, setLiked] = useState<string[]>([])
  const [commentsOpen, setCommentsOpen] = useState(false)
  const slides = useRef<Array<HTMLElement | null>>([])
  const players = useRef<Array<HTMLVideoElement | null>>([])

  const move = useCallback((direction: -1 | 1) => {
    const next = Math.min(homeVideos.length - 1, Math.max(0, active + direction))
    slides.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(next)
  }, [active])

  useEffect(() => {
    slides.current[requested]?.scrollIntoView({ block: 'start' })
  }, [requested])

  useEffect(() => {
    players.current.forEach((player, index) => {
      if (!player) return
      if (index === active) void player.play().catch(() => undefined)
      else player.pause()
    })
  }, [active])

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
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
  }, [])

  const video = homeVideos[active]
  const isLiked = liked.includes(video.id)
  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#090909] text-white">
      <header className={`pointer-events-none fixed left-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-4 transition-[right] sm:p-6 ${commentsOpen ? 'right-0 sm:right-96' : 'right-0'}`}>
        <Link className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-ink shadow-sm" to={appPaths.home}><img alt="SOVA" className="h-5 w-auto" src="/sova-logo-horizontal.png" /></Link>
        <strong className="text-sm tracking-tight">Shop videos</strong>
        <Link aria-label="Close video viewer" className="pointer-events-auto grid size-9 place-items-center rounded-full bg-black/40 backdrop-blur hover:bg-black/60" to={appPaths.home}><X size={18} /></Link>
      </header>

      <div className="video-discovery-scroll h-full snap-y snap-mandatory overflow-y-auto">
        {homeVideos.map((item, index) => (
          <section className={`relative grid h-[100dvh] snap-start place-items-center px-3 py-16 transition-[padding] sm:px-16 ${commentsOpen ? 'sm:pr-[26rem]' : ''}`} data-index={index} key={item.id} ref={(node) => { slides.current[index] = node }}>
            <div className="relative h-full max-h-[820px] w-full max-w-[470px] overflow-hidden rounded-2xl bg-black shadow-2xl">
              <video className="size-full object-cover" loop muted={muted} playsInline poster={item.poster} preload={Math.abs(active - index) <= 1 ? 'metadata' : 'none'} ref={(node) => { players.current[index] = node }} src={item.videoUrl} />
              <button aria-label="Play or pause" className="absolute inset-0 grid place-items-center" onClick={() => { const player = players.current[index]; if (player?.paused) void player.play(); else player?.pause() }} type="button">
                {index !== active && <span className="grid size-14 place-items-center rounded-full bg-black/35 backdrop-blur"><Play fill="white" size={22} /></span>}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-5 pb-6 pt-24">
                <a className="pointer-events-auto mb-4 flex max-w-xs items-center gap-3 rounded-xl bg-white/95 p-2 text-ink shadow-lg backdrop-blur transition hover:bg-white" href={`/#product/${encodeURIComponent(item.productName)}`}>
                  <img alt="" className="size-12 rounded-lg object-cover" src={item.poster} />
                  <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.productName}</strong><small className="mt-1 block font-bold text-primary-dark">{formatPrice(item.price)}</small></span>
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-white"><ShoppingBag size={14} /></span>
                </a>
                <p className="text-xs font-bold text-white/75">@{item.creator.toLowerCase().replaceAll(' ', '')}</p>
                <h1 className="mt-2 max-w-sm text-lg font-bold">{item.title}</h1>
              </div>
            </div>
          </section>
        ))}
      </div>

      <aside className={`fixed bottom-24 z-30 flex flex-col gap-4 transition-[right] sm:bottom-20 ${commentsOpen ? 'right-4 sm:right-[25rem]' : 'right-4 sm:right-[max(2rem,calc(50%-300px))]'}`}>
        <SocialButton active={isLiked} icon={<Heart fill={isLiked ? 'currentColor' : 'none'} />} label={isLiked ? '13.5K' : '13.4K'} onClick={() => setLiked((items) => isLiked ? items.filter((id) => id !== video.id) : [...items, video.id])} />
        <SocialButton icon={<MessageCircle />} label="328" onClick={() => setCommentsOpen(true)} />
        <SocialButton icon={<Send />} label="Share" onClick={() => void navigator.clipboard?.writeText(window.location.href)} />
        <SocialButton icon={muted ? <VolumeX /> : <Volume2 />} label={muted ? 'Muted' : 'Sound'} onClick={() => setMuted((value) => !value)} />
      </aside>

      <nav className={`fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 transition-[right] sm:flex ${commentsOpen ? 'right-[29rem]' : 'right-4'}`}>
        <ArrowButton disabled={active === 0} label="Previous video" onClick={() => move(-1)}><ArrowUp size={18} /></ArrowButton>
        <ArrowButton disabled={active === homeVideos.length - 1} label="Next video" onClick={() => move(1)}><ArrowDown size={18} /></ArrowButton>
      </nav>

      {commentsOpen && <CommentsPanel onClose={() => setCommentsOpen(false)} />}
    </main>
  )
}

function SocialButton({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={`flex flex-col items-center gap-1 text-[10px] font-bold ${active ? 'text-red-500' : 'text-white'}`} onClick={onClick} type="button"><span className="grid size-11 place-items-center rounded-full bg-black/45 backdrop-blur [&_svg]:size-5">{icon}</span>{label}</button>
}

function ArrowButton({ children, disabled, label, onClick }: { children: ReactNode; disabled: boolean; label: string; onClick: () => void }) {
  return <button aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 disabled:opacity-25" disabled={disabled} onClick={onClick} type="button">{children}</button>
}

function CommentsPanel({ onClose }: { onClose: () => void }) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 w-[88%] max-w-sm border-l border-line bg-white p-5 text-ink shadow-2xl">
      <div className="flex items-center justify-between"><h2 className="font-bold">Comments · 328</h2><button aria-label="Close comments" className="grid size-8 place-items-center rounded-full hover:bg-soft" onClick={onClose}><X size={17} /></button></div>
      <div className="mt-6 h-[calc(100%-7rem)] space-y-5 overflow-y-auto pb-6 pr-1">
        {commentThreads.map((comment) => <CommentThread comment={comment} key={comment.id} onReply={setReplyingTo} replyingTo={replyingTo} />)}
      </div>
      <form className="absolute bottom-0 left-0 right-0 flex gap-2 border-t border-line bg-white p-4" onSubmit={(event) => { event.preventDefault(); setReplyingTo(null) }}>
        <input className="min-w-0 flex-1 rounded-full bg-soft px-4 text-xs outline-none" placeholder={replyingTo ? 'Write a reply…' : 'Add a comment…'} />
        <button className="rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white" type="submit">{replyingTo ? 'Reply' : 'Post'}</button>
      </form>
    </aside>
  )
}

interface VideoComment {
  author: string
  avatar: string
  id: string
  message: string
  replies?: VideoComment[]
  time: string
}

const commentThreads: VideoComment[] = [
  {
    id: 'comment-1', author: 'shopper1', avatar: 'AM', message: 'This looks even better in motion!', time: '2h',
    replies: [{
      id: 'reply-1', author: 'nuruhome', avatar: 'NH', message: 'Thank you! It is available in three finishes.', time: '1h',
      replies: [{ id: 'reply-1-1', author: 'shopper1', avatar: 'AM', message: 'Perfect, I will check the lighter finish.', time: '48m' }],
    }],
  },
  {
    id: 'comment-2', author: 'shopper2', avatar: 'IK', message: 'Where can I find the price?', time: '3h',
    replies: [{ id: 'reply-2', author: 'shopper3', avatar: 'DN', message: 'Tap the product card above the caption.', time: '2h' }],
  },
  { id: 'comment-3', author: 'shopper4', avatar: 'JO', message: 'Love this shop and their collection.', time: '5h' },
]

function CommentThread({ comment, onReply, replyingTo, depth = 0 }: {
  comment: VideoComment
  depth?: number
  onReply: (commentId: string) => void
  replyingTo: string | null
}) {
  return (
    <div className={depth ? 'ml-5 border-l border-line pl-3' : ''}>
      <div className="flex gap-3 py-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-soft text-[10px] font-bold">{comment.avatar}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-5"><strong className="mr-2">@{comment.author}</strong>{comment.message}</p>
          <div className="mt-1 flex items-center gap-3 text-[10px] font-semibold text-muted">
            <span>{comment.time}</span>
            <button className={replyingTo === comment.id ? 'text-primary-dark' : 'hover:text-ink'} onClick={() => onReply(comment.id)} type="button">Reply</button>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => <CommentThread comment={reply} depth={depth + 1} key={reply.id} onReply={onReply} replyingTo={replyingTo} />)}
    </div>
  )
}
