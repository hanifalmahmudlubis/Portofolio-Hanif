import { ArrowUpRight } from "lucide-react";
import type { Certificate as CertificateType } from "@/types/project";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { safeUrl } from "@/lib/urls";
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
          {certificates.map((item) => (
            <div key={item.id} className="h-full">
              <article className="certificate-card">
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
            </div>
          ))}
        </div>
        {!certificates.length && (
          <p className="muted text-sm">Certificates will be added soon</p>
        )}
      </Container>
    </section>
  );
}
