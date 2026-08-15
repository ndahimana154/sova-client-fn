import { ArrowRight, Play } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceVideo } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { appPaths } from '../../router/paths'

export function Hero() {
  const { loading, videos } = useInfiniteVideos(25)

  if (!loading && !videos.length) return null

  return (
    <section className="border-b border-line bg-[#fafafa] py-10 sm:py-14">
      <div className="page-container">
        <div className="mb-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Watch. Discover. Shop.</p>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">The SOVA FLOW</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">See products in motion and discover stories from shops across SOVA.</p>
        </div>
      </div>

      <div className="page-container">
        <div className="relative max-h-[1520px] overflow-hidden">
          <div className="video-pin-grid">
            {videos.map((video, index) => <VideoPin index={index} key={video.id} video={video} />)}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#fafafa] to-transparent" />
        </div>
        <div className="mt-10 flex justify-center">
          <Link className="primary-button" to={appPaths.videos}>Explore marketplace videos <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  )
}

function VideoPin({ index, video }: { index: number; video: MarketplaceVideo }) {
  const previewTimer = useRef<number | null>(null)
  const shape = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/6]'][index % 4]
  return (
    <Link
      aria-label={`Watch video for ${video.product.name}`}
      className="video-pin group mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-ink sm:mb-4"
      onMouseEnter={(event) => {
        const player = event.currentTarget.querySelector('video')
        previewTimer.current = window.setTimeout(() => void player?.play(), 3000)
      }}
      onMouseLeave={(event) => {
        if (previewTimer.current) window.clearTimeout(previewTimer.current)
        const player = event.currentTarget.querySelector('video')
        if (player) { player.pause(); player.currentTime = 0 }
      }}
      to={`${appPaths.videos}?video=${video.id}`}
    >
      <div className={`relative ${shape}`}>
        <video className="size-full object-cover transition duration-500 group-hover:scale-[1.02]" loop muted playsInline preload="metadata" src={mediaUrl(video.url)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur"><Play fill="currentColor" size={13} /></span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
          {video.altText && <h2 className="text-sm font-bold leading-tight sm:text-base">{video.altText}</h2>}
          <p className="mt-1 truncate text-xs font-bold leading-tight text-white/85">{video.product.name}</p>
          <p className="mt-0.5 flex items-baseline gap-1.5 text-xs">
            <strong className="font-black">{formatPrice(video.product.price)}</strong>
            {video.product.discountPercent > 0 && (
              <s className="text-[10px] text-white/60">{formatPrice(video.product.listPrice)}</s>
            )}
          </p>
        </div>
      </div>
    </Link>
  )
}
