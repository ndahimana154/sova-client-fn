import { ArrowRight } from 'lucide-react'

export function Newsletter() {
  return (
    <section className="page-container section-space">
      <div className="overflow-hidden rounded-3xl bg-ink px-7 py-10 text-white sm:px-12 sm:py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">The good stuff, first</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Deals worth opening your inbox for.</h2>
            <p className="mt-2 text-sm text-white/55">New drops, thoughtful picks and member-only prices.</p>
          </div>
          <form className="flex w-full max-w-md rounded-full bg-white p-1.5" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Email address" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink outline-none" placeholder="Your email address" type="email" />
            <button aria-label="Subscribe" className="grid size-11 place-items-center rounded-full bg-primary text-white hover:bg-primary-dark"><ArrowRight size={17} /></button>
          </form>
        </div>
      </div>
    </section>
  )
}
