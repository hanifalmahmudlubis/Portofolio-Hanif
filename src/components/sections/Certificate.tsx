import { ArrowUpRight, Award } from "lucide-react";
import type { Certificate as CertificateType } from "@/types/project";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { safeUrl } from "@/lib/urls";
import { initialPublicProfile } from "@/lib/site";

/** Each certificate is drawn like the printed document: frame, recipient, seal. */
export default function Certificate({
  certificates,
  name = initialPublicProfile.fullName,
}: {
  certificates: CertificateType[];
  name?: string;
}) {
  return (
    <section id="certificates" className="section section-alt">
      <Container>
        <SectionHeading index="04" title="Certificates" />
        <div className="certificate-grid">
          {certificates.map((item, index) => {
            const credential = safeUrl(item.credentialUrl);
            return (
              <Reveal
                key={item.id}
                from="up"
                delay={(index % 2) * 0.08}
                className="h-full"
              >
                <article className="certificate-paper">
                  <div className="certificate-frame">
                    <p className="certificate-kicker">Certificate</p>
                    <p className="certificate-sub">of Completion</p>
                    <p className="certificate-presented">Presented to</p>
                    <p className="certificate-name">{name}</p>
                    <h3 className="certificate-title">{item.title}</h3>
                    <div className="certificate-foot">
                      <div className="certificate-sign">
                        <span>{item.issuer}</span>
                        <small>Issued by</small>
                      </div>
                      <span className="certificate-seal" aria-hidden="true">
                        <Award size={22} strokeWidth={1.6} />
                      </span>
                      <div className="certificate-sign">
                        <span>{item.year}</span>
                        <small>Year</small>
                      </div>
                    </div>
                    {credential && (
                      <a
                        href={credential}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View credential: ${item.title}`}
                        className="certificate-link"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        {!certificates.length && (
          <p className="muted text-sm">Certificates will be added soon</p>
        )}
      </Container>
    </section>
  );
}
