import { contact, enquiryTopics, mailto } from "@/lib/content/site";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * Shared contact block (id="contact"). Renders only configured, verified
 * details. With nothing configured it renders a neutral note rather than a
 * form that pretends to submit.
 */
export function ContactSection() {
  const hasAny = Boolean(contact.email || contact.phone || contact.address?.length || contact.social.length);

  return (
    <section id="contact" aria-labelledby="contact-title" className="container-site scroll-mt-6 py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow eyebrow-rule">Contact</p>
          <h2 id="contact-title" className="text-section mt-5">
            Write to us.
          </h2>
          <p className="mt-5 max-w-md text-muted">
            For consultancy, workshops, research collaboration, orders and Anaadi Vastras enquiries.
          </p>
        </div>

        <div className="md:col-span-7 md:pt-2">
          {!hasAny && (
            <p className="text-muted">Contact details will be published here shortly.</p>
          )}

          {contact.email && (
            <>
              <p className="eyebrow">Email</p>
              <a
                href={mailto()}
                className="mt-2 inline-block font-display text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] text-forest underline decoration-hairline decoration-1 underline-offset-[0.2em] hover:decoration-brand"
              >
                {contact.email}
              </a>

              <p className="eyebrow mt-10">Start an enquiry</p>
              <ul className="mt-3 border-t border-hairline">
                {enquiryTopics.map((topic) => (
                  <li key={topic} className="border-b border-hairline">
                    <a
                      href={mailto(topic)}
                      className="group flex min-h-12 items-center justify-between gap-4 py-2 text-forest hover:text-brand"
                    >
                      <span>{topic}</span>
                      <ArrowUpRight className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">(opens your email app)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {contact.phone && (
            <p className="mt-8">
              <span className="eyebrow block">Phone</span>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-quiet">
                {contact.phone}
              </a>
            </p>
          )}

          {contact.address?.length ? (
            <address className="mt-8 not-italic">
              <span className="eyebrow block">Address</span>
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : null}

          {contact.social.length > 0 && (
            <ul className="mt-8 flex gap-6">
              {contact.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="link-quiet" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
