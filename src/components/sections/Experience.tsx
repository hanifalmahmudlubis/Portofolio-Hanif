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
        <SectionHeading number="03" label="The journey" title="Experience" />
        <div className="md:ml-[33.333%]">
          {experiences.length ? (
            experiences.map((item, index) => (
              <Reveal
                key={item.id}
                delay={index * 0.05}
                className="relative border-l border-[#2c3e60] pb-12 pl-8 last:pb-0"
              >
                <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-[#91a6df] ring-4 ring-[#07090e]" />
                <p className="mb-4 font-mono text-[12px] uppercase tracking-widest text-[#a5b5d8]">
                  {formatMonth(item.startDate)} —{" "}
                  {item.endDate ? formatMonth(item.endDate) : "Present"}
                </p>
                <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                  {item.position}
                </h3>
                <p className="mt-2 text-sm text-[#91a6df]">{item.company}</p>
                {item.location && (
                  <p className="muted mt-3 flex items-center gap-2 text-xs">
                    <MapPin size={12} />
                    {item.location}
                  </p>
                )}
                <p className="muted mt-5 whitespace-pre-line text-sm leading-7">
                  {item.description}
                </p>
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
              </Reveal>
            ))
          ) : (
            <div className="empty-state">No experience added yet.</div>
          )}
        </div>
      </Container>
    </section>
  );
}
