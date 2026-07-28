import { ArrowRight, Play } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { homeVideos, type HomeVideo } from '../../data/homeVideos'
import { appPaths } from '../../router/paths'

const previewVideos = Array.from({ length: 25 }, (_, index) => homeVideos[index % homeVideos.length])

export function Hero() {
  return (
    <section className="border-b border-line bg-[#fafafa] py-10 sm:py-14">
      <div className="page-container">
        <div className="mb-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Watch. Discover. Shop.</p>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Explore shops through video</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">See products in motion and discover stories from shops across SOVA.</p>
        </div>
      </div>

      <div className="page-container">
        <div className="relative max-h-[1520px] overflow-hidden">
          <div className="video-pin-grid">
            {previewVideos.map((video, index) => <VideoPin index={index} key={`${video.id}-${index}`} video={video} />)}
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

function VideoPin({ index, video }: { index: number; video: HomeVideo }) {
  const previewTimer = useRef<number | null>(null)
  const shape = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/6]'][index % 4]
  return (
    <Link
      aria-label={`Watch ${video.title}`}
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
        <video className="size-full object-cover transition duration-500 group-hover:scale-[1.02]" loop muted playsInline poster={video.poster} preload="metadata" src={video.videoUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur"><Play fill="currentColor" size={13} /></span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
          <h2 className="text-sm font-bold leading-tight sm:text-base">{video.title}</h2>
          <p className="mt-1 text-[10px] font-semibold text-white/70">{video.creator}</p>
        </div>
      </div>
    </Link>
  )
}
