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
    <Reveal delay={(index % 2) * 0.06} from="up" className="project-reveal">
      <article className={`project-card ${cover ? "has-cover" : ""}`}>
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
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 410px"
              className="object-cover"
            />
          </Link>
        )}
        <div className="project-card-content">
          <div className="project-meta">
            <span className="project-category">{project.category}</span>
            <span className="project-year">{project.year}</span>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`View project: ${project.title}`}
            className="project-title-link"
            title={project.title}
          >
            <h3 className="project-title">{project.title}</h3>
          </Link>
          <p className="project-description">{project.shortDescription}</p>
          {!!project.technologies.length && (
            <div className="project-technologies">
              {project.technologies.map(({ technology }) => (
                <span key={technology.id} className="tag">
                  {technology.name}
                </span>
              ))}
            </div>
          )}
          <div className="project-card-footer">
            <span className="text-xs text-[#94a3bd]">
              {project.projectType}
            </span>
            <Link href={`/projects/${project.slug}`} className="project-open">
              View project <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
