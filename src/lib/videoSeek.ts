export const SKIP_SECONDS = 10

export function seekBy(player: HTMLVideoElement | null, seconds: number): void {
  if (!player || !Number.isFinite(player.duration)) return
  player.currentTime = Math.min(
    player.duration,
    Math.max(0, player.currentTime + seconds),
  )
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const rest = whole % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`
}
