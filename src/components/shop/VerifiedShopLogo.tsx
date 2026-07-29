import { BadgeCheck } from 'lucide-react'
import type { CSSProperties } from 'react'

interface VerifiedShopLogoProps {
  badgeClassName?: string
  className?: string
  logoClassName?: string
  logoUrl?: string
  name: string
  style?: CSSProperties
}

export function VerifiedShopLogo({
  badgeClassName = 'size-6',
  className = '',
  logoClassName = '',
  logoUrl,
  name,
  style,
}: VerifiedShopLogoProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className={`relative inline-grid shrink-0 ${className}`}>
      <span
        className={`grid size-full place-items-center overflow-hidden rounded-full font-black ${logoClassName}`}
        style={style}
      >
        {logoUrl
          ? <img alt={`${name} shop logo`} className="size-full object-cover" src={logoUrl} />
          : initials}
      </span>
      <span
        aria-label={`${name} is a verified SOVA shop`}
        className={`absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-white p-0.5 shadow-sm ${badgeClassName}`}
        role="img"
      >
        <BadgeCheck aria-hidden="true" className="size-full fill-primary text-white" />
      </span>
    </span>
  )
}
