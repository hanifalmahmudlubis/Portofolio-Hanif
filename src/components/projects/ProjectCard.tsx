import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";
import { initials, projectCover } from "@/lib/project-cover";
import Reveal from "../ui/Reveal";
import BrowserFrame from "./BrowserFrame";
export default function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  const cover = projectCover(project);
  return (
    <Reveal delay={(index % 2) * 0.08} from="up" className="project-reveal">
      <article className={`project-card ${cover ? "has-cover" : ""}`}>
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`Preview ${project.title}`}
          className="project-visual"
          tabIndex={-1}
        >
          <BrowserFrame
            src={cover}
            alt={project.title}
            url={`/projects/${project.slug}`}
            sizes="(max-width: 767px) 100vw, 600px"
            fallback={initials(project.title)}
          />
        </Link>
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
            <span>{project.projectType}</span>
            <Link href={`/projects/${project.slug}`} className="project-open">
              View project <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
