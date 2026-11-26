import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import JourneyChart from "../charts/JourneyChart";
import type { Experience as ExperienceType } from "@/types/project";
import { formatMonth } from "@/lib/site";
import { imageUrl } from "@/lib/urls";
import { lifeJourney } from "@/lib/insights";
import type { Education } from "@/types/cv";

export default function Experience({
  experiences,
  education = [],
}: {
  experiences: ExperienceType[];
  education?: Education[];
}) {
  const journey = lifeJourney(experiences, education, formatMonth);
  return (
    <section id="experience" className="section section-alt">
      <Container>
        <SectionHeading index="02" title="Experience" />
        {!!journey.length && <JourneyChart stops={journey} />}
        <div className="experience-list">
          {experiences.length ? (
            experiences.map((item, index) => (
              <Reveal
                key={item.id}
                delay={index * 0.05}
                from="up"
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
                    <p className="muted mt-3 flex items-center gap-2 text-sm">
                      <MapPin size={14} />
                      {item.location}
                    </p>
                  )}
                  <p className="experience-description">{item.description}</p>
                  {!!item.images.length && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {item.images
                        .filter((image) => imageUrl(image.url))
                        .map((image, i) => (
                          <a
                            key={image.id}
                            href={imageUrl(image.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-4/3 overflow-hidden rounded-xl border border-line"
                          >
                            <Image
                              src={imageUrl(image.url)!}
                              alt={`${item.company} — experience photo ${i + 1}`}
                              fill
                              sizes="220px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 right-2 rounded-full bg-surface/90 p-1.5 text-ink">
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
