import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SKIP_SECONDS, formatTime, seekBy } from '../../lib/videoSeek'

interface VideoControlsProps {
  player: HTMLVideoElement | null
}

export function VideoControls({ player }: VideoControlsProps) {
  const [{ current, duration, paused }, setState] = useState({
    current: 0,
    duration: 0,
    paused: true,
  })

  useEffect(() => {
    if (!player) return
    const sync = () => setState({
      current: player.currentTime,
      duration: Number.isFinite(player.duration) ? player.duration : 0,
      paused: player.paused,
    })
    sync()
    const events = [
      'durationchange',
      'loadedmetadata',
      'pause',
      'play',
      'seeked',
      'timeupdate',
    ]
    events.forEach((event) => player.addEventListener(event, sync))
    return () => events.forEach((event) => player.removeEventListener(event, sync))
  }, [player])

  const scrubbable = duration > 0

  return (
    <div className="pointer-events-auto">
      <input
        aria-label="Seek"
        className="video-scrubber w-full"
        disabled={!scrubbable}
        max={scrubbable ? duration : 1}
        min={0}
        onChange={(event) => {
          if (player) player.currentTime = Number(event.target.value)
        }}
        step={0.1}
        style={{ '--played': `${scrubbable ? (current / duration) * 100 : 0}%` } as React.CSSProperties}
        type="range"
        value={scrubbable ? Math.min(current, duration) : 0}
      />
      <div className="mt-1.5 flex items-center gap-3 text-white">
        <ControlButton
          label={`Back ${SKIP_SECONDS} seconds`}
          onClick={() => seekBy(player, -SKIP_SECONDS)}
        >
          <RotateCcw size={16} />
        </ControlButton>
        <ControlButton
          label={paused ? 'Play' : 'Pause'}
          onClick={() => {
            if (!player) return
            if (player.paused) void player.play().catch(() => undefined)
            else player.pause()
          }}
        >
          {paused ? <Play fill="currentColor" size={16} /> : <Pause fill="currentColor" size={16} />}
        </ControlButton>
        <ControlButton
          label={`Forward ${SKIP_SECONDS} seconds`}
          onClick={() => seekBy(player, SKIP_SECONDS)}
        >
          <RotateCw size={16} />
        </ControlButton>
        <span className="ml-auto text-[11px] font-bold tabular-nums text-white/80">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

function ControlButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}
