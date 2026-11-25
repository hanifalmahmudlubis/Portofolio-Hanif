import { ArrowUpRight } from "lucide-react";
import type { Certificate as CertificateType } from "@/types/project";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { safeUrl } from "@/lib/urls";

const initials = (text: string) =>
  text
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Certificate({
  certificates,
}: {
  certificates: CertificateType[];
}) {
  return (
    <section id="certificates" className="section">
      <Container>
        <SectionHeading title="Certificates" from="up" />
        <div className="certificate-grid">
          {certificates.map((item, i) => (
            <Reveal
              key={item.id}
              from="up"
              delay={(i % 3) * 0.08}
              className="h-full"
            >
              <article className="certificate-card">
                <div className="cert-stub" aria-hidden="true">
                  <span className="cert-seal">{initials(item.issuer)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="certificate-issuer">{item.issuer}</p>
                  <h3 className="certificate-title">{item.title}</h3>
                  <p className="certificate-year">{item.year}</p>
                </div>
                {safeUrl(item.credentialUrl) && (
                  <a
                    href={safeUrl(item.credentialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View credential: ${item.title}`}
                    className="certificate-link shrink-0"
                  >
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
        {!certificates.length && (
          <p className="muted text-sm">Certificates will be added soon</p>
        )}
      </Container>
    </section>
  );
}
