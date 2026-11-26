import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Scene3D from "@/components/ui/Scene3D";
import SplitText from "@/components/ui/SplitText";
import ProjectSlider from "@/components/projects/ProjectSlider";
import BrowserFrame from "@/components/projects/BrowserFrame";
import { getPublicProject, listProjects } from "@/lib/services/portfolio";
import { getPublicProfile } from "@/lib/services/content";
import { safeUrl } from "@/lib/urls";
import { initials } from "@/lib/project-cover";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublicProject((await params).slug);
  return {
    title: project?.title || "Project not found",
    description: project?.shortDescription,
  };
}
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, profile, projects] = await Promise.all([
    getPublicProject(slug),
    getPublicProfile(),
    listProjects(),
  ]);
  if (!project) notFound();
  const repository = safeUrl(project.githubUrl);
  const demo = safeUrl(project.liveDemoUrl);
  const position = projects.findIndex((item) => item.id === project.id);
  const previous =
    projects.length > 1
      ? projects[(position - 1 + projects.length) % projects.length]
      : null;
  const next =
    projects.length > 1 ? projects[(position + 1) % projects.length] : null;
  const chapters = [
    ["Overview", project.fullDescription],
    ["Challenge", project.problem],
    ["Solution", project.solution],
  ].filter((chapter): chapter is [string, string] => Boolean(chapter[1]));
  const facts = [
    ["Type", project.projectType],
    ["Year", String(project.year)],
    ["Category", project.category],
    ["Stack", `${project.technologies.length} tools`],
  ];
  return (
    <>
      <Header profile={profile} />
      <main id="main" className="project-detail pb-28">
        <section className="detail-hero">
          <Scene3D variant="light" className="opacity-45" />
          <div className="hero-veil" aria-hidden="true" />
          <Container>
            <Reveal from="up">
              <Link href="/projects" className="detail-back">
                <ArrowLeft size={16} /> All projects
              </Link>
              <p className="mt-12">
                <span className="eyebrow">
                  {project.category} · {project.year}
                </span>
              </p>
              <h1 className="detail-title">
                <SplitText text={project.title} />
              </h1>
              <p className="detail-summary">{project.shortDescription}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={repository || profile.githubUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                >
                  <Github size={16} />
                  {repository ? "View source code" : "GitHub repositories"}
                  <ArrowUpRight size={14} />
                </a>
                {demo && (
                  <a
                    href={demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-secondary"
                  >
                    Live project <ArrowUpRight size={16} />
                  </a>
                )}
                <a
                  href={profile.linkedinUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-secondary"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
              </div>
            </Reveal>
            <Reveal from="up" delay={0.1}>
              <dl className="detail-facts">
                {facts.map(([label, value]) => (
                  <div key={label} className="detail-fact">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        </section>
        <Container>
          <Reveal from="up" delay={0.12} className="detail-gallery">
            {project.images.length ? (
              <div className="browser">
                <div className="browser-bar" aria-hidden="true">
                  <span className="browser-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="browser-url">/projects/{project.slug}</span>
                </div>
                <div className="p-3 md:p-5">
                  <ProjectSlider
                    images={project.images}
                    title={project.title}
                  />
                </div>
              </div>
            ) : (
              <BrowserFrame
                alt={project.title}
                url={`/projects/${project.slug}`}
                sizes="100vw"
                fallback={initials(project.title)}
              />
            )}
          </Reveal>
          <div className="detail-body">
            <Reveal from="up" className="detail-aside">
              {!!project.technologies.length && (
                <div className="panel">
                  <h2 className="panel-title">Built with</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.technologies.map(({ technology }) => (
                      <span key={technology.id} className="tag">
                        {technology.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link href="/#contact" className="text-link mt-8">
                Discuss a project <ArrowUpRight size={15} />
              </Link>
            </Reveal>
            <div>
              {chapters.map(([title, content], index) => (
                <Reveal key={title} from="up" className="detail-chapter">
                  <span className="detail-chapter-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>{title}</h2>
                    <p>{content}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          {previous && next && (
            <nav aria-label="More projects" className="detail-next">
              <Link
                href={`/projects/${previous.slug}`}
                className="detail-next-card"
              >
                <ArrowLeft size={20} className="shrink-0" />
                <span className="min-w-0 flex-1 text-right">
                  <small>Previous</small>
                  <strong>{previous.title}</strong>
                </span>
              </Link>
              <Link
                href={`/projects/${next.slug}`}
                className="detail-next-card"
              >
                <span className="min-w-0 flex-1">
                  <small>Next</small>
                  <strong>{next.title}</strong>
                </span>
                <ArrowRight size={20} className="shrink-0" />
              </Link>
            </nav>
          )}
        </Container>
      </main>
      <Footer profile={profile} />
    </>
  );
}
