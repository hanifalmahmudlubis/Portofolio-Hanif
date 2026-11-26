import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import BrowserFrame from "../projects/BrowserFrame";
import BarChart from "../charts/BarChart";
import type { Project } from "@/types/project";
import { initials, projectCover } from "@/lib/project-cover";
import { safeUrl } from "@/lib/urls";
import { projectsByCategory, projectsByYear } from "@/lib/insights";

export default function Projects({ projects }: { projects: Project[] }) {
  // Featured work leads; the rest keep their curated order.
  const ordered = [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );
  const technologies = new Set(
    projects.flatMap((project) =>
      project.technologies.map(({ technology }) => technology.name),
    ),
  );
  return (
    <section id="projects" className="section">
      <Container>
        <div className="section-heading-row">
          <SectionHeading index="01" title="Selected projects" />
          <Reveal from="fade">
            <Link href="/projects" className="text-link">
              All projects <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>
        {ordered.length ? (
          <div className="showcase">
            {ordered.map((project, index) => {
              const cover = projectCover(project);
              const repository = safeUrl(project.githubUrl);
              return (
                <article key={project.id} className="showcase-item">
                  <Reveal
                    from={index % 2 ? "right" : "left"}
                    className="showcase-media"
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      aria-label={`Preview ${project.title}`}
                      className="showcase-visual"
                    >
                      <BrowserFrame
                        src={cover}
                        alt={project.title}
                        url={`/projects/${project.slug}`}
                        sizes="(max-width: 1023px) 100vw, 680px"
                        fallback={initials(project.title)}
                      />
                    </Link>
                  </Reveal>
                  <Reveal from="up" delay={0.1}>
                    <span className="showcase-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="showcase-meta">
                      <span>{project.category}</span>
                      <span>{project.projectType}</span>
                      <span>{project.year}</span>
                    </p>
                    <h3>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="showcase-title block"
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <p className="showcase-description">
                      {project.shortDescription}
                    </p>
                    {!!project.technologies.length && (
                      <div className="showcase-stack">
                        {project.technologies.map(({ technology }) => (
                          <span key={technology.id} className="tag">
                            {technology.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="showcase-actions">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="button button-primary"
                      >
                        View case study <ArrowUpRight size={16} />
                      </Link>
                      {repository && (
                        <a
                          href={repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <Github size={17} /> Source
                        </a>
                      )}
                    </div>
                  </Reveal>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Projects will be added soon</div>
        )}
        {!!projects.length && (
          <div className="insights">
            <Reveal
              from="up"
              className="panel flex flex-col justify-between gap-10"
            >
              <p className="panel-title">Projects shipped</p>
              <div>
                <p className="panel-number">{projects.length}</p>
                <p className="muted mt-3 text-sm">
                  {technologies.size} technologies ·{" "}
                  {projects.filter((project) => project.featured).length}{" "}
                  featured
                </p>
              </div>
            </Reveal>
            <Reveal from="up" delay={0.08} className="panel">
              <BarChart
                title="By category"
                data={projectsByCategory(projects)}
                unit={["project", "projects"]}
              />
            </Reveal>
            <Reveal from="up" delay={0.16} className="panel">
              <BarChart
                title="By year"
                data={projectsByYear(projects)}
                unit={["project", "projects"]}
              />
            </Reveal>
          </div>
        )}
      </Container>
    </section>
  );
}
