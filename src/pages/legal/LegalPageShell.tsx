import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../router/paths'

interface LegalPageShellProps {
  children: ReactNode
  intro?: string
  title: string
  version?: string | null
}

export function LegalPageShell({ children, intro, title, version }: LegalPageShellProps) {
  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container max-w-3xl">
        <Link className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted transition hover:text-primary-dark" to={appPaths.home}>
          <ChevronLeft size={14} /> Back to SOVA
        </Link>

        <article className="mt-3 rounded-2xl border border-line bg-white p-5 sm:p-7">
          <header className="border-b border-line pb-4">
            <h1 className="text-lg font-black tracking-[-0.02em] text-ink sm:text-xl">{title}</h1>
            <p className="mt-1 text-[11px] text-muted">
              {intro}
              {version && <span className="ml-1">Version {version}.</span>}
            </p>
          </header>
          <div className="mt-5">{children}</div>
        </article>
      </div>
    </main>
  )
}
