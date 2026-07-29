import { ChevronLeft, LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";

export function SellerApplicationHero({ onBack, onTrack, renewing, tracking }: { onBack: () => void; onTrack: (event: FormEvent<HTMLFormElement>) => void; renewing: boolean; tracking: boolean }) {
  return (
    <section className="border-b border-line bg-soft/60">
      <div className="page-container py-8 sm:py-12">
        <button className="inline-flex items-center gap-2 text-xs font-bold text-cream transition hover:text-primary-dark" onClick={onBack} type="button">
          <ChevronLeft size={16} /> Back to shopping
        </button>
        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="auth-eyebrow text-2xl">Sell on SOVA</h1>
            <p className="mt-2 text-sm text-cream">{renewing ? "Correct the requested details and resubmit for review" : "Complete one application to open your shop on the marketplace"}</p>
          </div>
          <form className="flex h-9 w-full items-stretch gap-2 sm:max-w-sm" onSubmit={onTrack}>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Application code</span>
              <span className="seller-input !mt-0 h-9 !min-h-0 rounded-lg bg-white px-3"><input className="h-full !py-0 text-xs" name="applicationCode" placeholder="Application code" required /></span>
            </label>
            <button className="primary-button h-9 min-w-20 justify-center rounded-lg px-3 py-0" disabled={tracking} type="submit">
              {tracking ? <><LoaderCircle className="animate-spin" size={15} /> Tracking…</> : "Track"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
