import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github, Linkedin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ProjectSlider from "@/components/projects/ProjectSlider";
import { getPublicProject } from "@/lib/services/portfolio";
import { getPublicProfile } from "@/lib/services/content";
import { safeUrl } from "@/lib/urls";
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
  const [project, profile] = await Promise.all([
    getPublicProject((await params).slug),
    getPublicProfile(),
  ]);
  if (!project) notFound();
  const repository = safeUrl(project.githubUrl);
  const demo = safeUrl(project.liveDemoUrl);
  return (
    <>
      <Header profile={profile} />
      <main id="main" className="project-detail pb-24">
        <Container>
          <Reveal from="left" className="pb-10 pt-12 md:pt-16">
            <Link
              href="/projects"
              className="muted mb-10 inline-flex items-center gap-2 text-xs hover:text-[#91a6df]"
            >
              <ArrowLeft size={14} /> All projects
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">{project.category}</span>
              <span className="font-mono text-[12px] text-[#8997ae]">
                / {project.year}
              </span>
            </div>
            <h1 className="detail-title">{project.title}</h1>
            <p className="muted mt-5 max-w-2xl text-sm leading-7 md:text-base">
              {project.shortDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
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
          {!!project.images.length && (
            <Reveal delay={0.1}>
              <ProjectSlider images={project.images} title={project.title} />
            </Reveal>
          )}
          <div className="mt-14 grid gap-12 border-t border-[#212a39] pt-12 md:grid-cols-[1fr_2fr]">
            <Reveal>
              <p className="eyebrow mb-6">Details</p>
              <dl className="grid grid-cols-2 gap-6 text-sm md:grid-cols-1">
                <div>
                  <dt className="muted mb-2 text-xs">Project type</dt>
                  <dd>{project.projectType}</dd>
                </div>
                <div>
                  <dt className="muted mb-2 text-xs">Year</dt>
                  <dd>{project.year}</dd>
                </div>
              </dl>
              {!!project.technologies.length && (
                <div className="mt-8">
                  <h2 className="muted mb-3 text-xs">Built with</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map(({ technology }) => (
                      <span key={technology.id} className="tag">
                        {technology.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
            <div className="space-y-10">
              {[
                ["Overview", project.fullDescription],
                ["Challenge", project.problem],
                ["Solution", project.solution],
              ]
                .filter(([, content]) => content)
                .map(([title, content]) => (
                  <Reveal key={title}>
                    <h2 className="mb-4 text-xl font-medium tracking-tight">
                      {title}
                    </h2>
                    <p className="muted whitespace-pre-line text-sm leading-8">
                      {content}
                    </p>
                  </Reveal>
                ))}
            </div>
          </div>
          <Reveal className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-[#212a39] pt-8">
            <Link href="/projects" className="button button-secondary">
              <ArrowLeft size={16} />
              More projects
            </Link>
            <Link
              href="/#contact"
              className="flex items-center gap-3 text-sm text-[#91a6df]"
            >
              Contact <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </Container>
      </main>
      <Footer profile={profile} />
    </>
  );
}
