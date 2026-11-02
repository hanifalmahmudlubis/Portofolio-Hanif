import { ArrowUpRight } from "lucide-react";
import type { Certificate as CertificateType } from "@/types/project";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { safeUrl } from "@/lib/urls";
export default function Certificate({
  certificates,
}: {
  certificates: CertificateType[];
}) {
  return (
    <section id="certificates" className="section">
      <Container>
        <SectionHeading title="Certificates" />
        <div className="grid gap-x-12 md:grid-cols-2">
          {certificates.map((item, index) => (
            <Reveal key={item.id} delay={(index % 2) * 0.06}>
              <article className="flex h-full items-start justify-between gap-5 border-t border-border py-7">
                <div>
                  <p className="muted mb-2 text-xs">
                    {item.issuer} · {item.year}
                  </p>
                  <h3 className="text-base font-medium leading-7">
                    {item.title}
                  </h3>
                </div>
                {safeUrl(item.credentialUrl) && (
                  <a
                    href={safeUrl(item.credentialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View credential: ${item.title}`}
                    className="icon-button shrink-0"
                  >
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
        {!certificates.length && (
          <p className="muted text-sm">No certificates yet.</p>
        )}
      </Container>
    </section>
  );
}
