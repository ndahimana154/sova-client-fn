export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <a className="flex items-center gap-2" href="#" aria-label="SOVA home">
      <span className="brand-mark"><i /><i /></span>
      {!compact && <span className={`text-xl font-black tracking-[-0.05em] ${light ? 'text-white' : 'text-ink'}`}>SOVA</span>}
    </a>
  )
}
