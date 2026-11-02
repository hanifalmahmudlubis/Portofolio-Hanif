import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";
import { imageUrl } from "@/lib/urls";
import Reveal from "../ui/Reveal";
export default function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  const cover = imageUrl(
    project.images.find((image) => image.isThumbnail)?.imageUrl ??
      project.images[0]?.imageUrl,
  );
  return (
    <Reveal delay={(index % 2) * 0.06} className="h-full">
      <article className="project-card">
        {cover && (
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`Preview ${project.title}`}
            className="project-visual"
          >
            <Image
              src={cover}
              alt={project.title}
              fill
              sizes="(max-width: 767px) 100vw, 560px"
              className="object-cover"
            />
          </Link>
        )}
        <div className="project-card-content">
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="text-xs text-primary">{project.category}</span>
            <span className="text-xs text-[#7887a1]">{project.year}</span>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`View project: ${project.title}`}
            className="group"
          >
            <h3 className="text-xl font-medium leading-snug tracking-[-.025em] transition-colors group-hover:text-primary md:text-2xl">
              {project.title}
            </h3>
          </Link>
          <p className="muted mt-4 line-clamp-2 text-sm leading-7">
            {project.shortDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map(({ technology }) => (
              <span key={technology.id} className="tag">
                {technology.name}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs text-[#7887a1]">
              {project.projectType}
            </span>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-xs text-primary"
            >
              View project <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
