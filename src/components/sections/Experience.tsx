import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import type { Experience as ExperienceType } from "@/types/project";
import { formatMonth } from "@/lib/site";
import { imageUrl } from "@/lib/urls";
export default function Experience({
  experiences,
}: {
  experiences: ExperienceType[];
}) {
  return (
    <section id="experience" className="section">
      <Container>
        <SectionHeading title="Experience" />
        <div className="experience-list">
          {experiences.length ? (
            experiences.map((item, index) => (
              <Reveal
                key={item.id}
                delay={index * 0.05}
                className="experience-item"
              >
                <div className="experience-date">
                  <p>
                    {formatMonth(item.startDate)}{" "}
                    <span aria-hidden="true">—</span>
                    <br className="hidden md:block" />{" "}
                    {item.endDate ? formatMonth(item.endDate) : "Present"}
                  </p>
                  {!item.endDate && (
                    <span className="experience-current">Current</span>
                  )}
                </div>
                <div className="experience-content">
                  <span className="timeline-point" aria-hidden="true" />
                  <h3 className="experience-position">{item.position}</h3>
                  <p className="experience-company">{item.company}</p>
                  {item.location && (
                    <p className="muted mt-3 flex items-center gap-2 text-xs">
                      <MapPin size={12} />
                      {item.location}
                    </p>
                  )}
                  <p className="experience-description">{item.description}</p>
                  {!!item.images.length && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {item.images
                        .filter((image) => imageUrl(image.url))
                        .map((image, i) => (
                          <a
                            key={image.id}
                            href={imageUrl(image.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#263146]"
                          >
                            <Image
                              src={imageUrl(image.url)!}
                              alt={`${item.company} — experience photo ${i + 1}`}
                              fill
                              sizes="200px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 p-1">
                              <ArrowUpRight size={12} />
                            </span>
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))
          ) : (
            <div className="empty-state">Experience will be added soon</div>
          )}
        </div>
      </Container>
    </section>
  );
}
