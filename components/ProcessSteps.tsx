/**
 * Reusable numbered process. Populate only with verified steps.
 */
export function ProcessSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-10 md:grid-cols-3 md:gap-0">
      {steps.map((step, i) => (
        <li key={step.title} className="relative border-t border-forest pt-6 md:pr-10">
          {/* Small circuit-pad marker on the rule. */}
          <span
            aria-hidden="true"
            className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full border border-gold bg-paper"
          />
          <p className="font-label text-sm font-semibold tracking-[0.14em] text-muted">
            <span className="sr-only">Step </span>0{i + 1}
          </p>
          <h3 className="text-card mt-2">{step.title}</h3>
          <p className="mt-3 max-w-sm text-ink">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
