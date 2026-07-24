import { ArrowRight } from 'lucide-react'

export function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">{eyebrow}</p>}
        <h2 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">{title}</h2>
      </div>
      <a className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary-dark hover:underline" href="#">View all <ArrowRight size={13} /></a>
    </div>
  )
}
