import Link from 'next/link';

type StepCardProps = {
  step: number | string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
};

export function StepCard({ step, title, description, ctaLabel, ctaHref, ctaExternal = false }: StepCardProps) {
  const ctaClassName = 'mt-4 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10';

  return (
    <article className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 px-2 text-xs font-semibold text-sky-200">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>

          {ctaLabel && ctaHref ? (
            ctaExternal ? (
              <a href={ctaHref} target="_blank" rel="noreferrer" className={ctaClassName}>
                {ctaLabel}
              </a>
            ) : (
              <Link href={ctaHref} className={ctaClassName}>
                {ctaLabel}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
