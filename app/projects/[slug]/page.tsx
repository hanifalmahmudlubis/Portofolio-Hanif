import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github, Linkedin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import BrowserBar from "@/components/ui/BrowserBar";
import Wireframe from "@/components/ui/Wireframe";
import ProjectSlider from "@/components/projects/ProjectSlider";
import { getPublicProject } from "@/lib/services/portfolio";
import { getPublicProfile } from "@/lib/services/content";
import { imageUrl, safeUrl } from "@/lib/urls";
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
  const cover = imageUrl(
    project.images.find((image) => image.isThumbnail)?.imageUrl ??
      project.images[0]?.imageUrl,
  );
  const sections = [
    ["Overview", project.fullDescription],
    ["Challenge", project.problem],
    ["Solution", project.solution],
  ].filter(([, content]) => content);
  const stack = project.technologies.map(({ technology }) => technology.name);
  return (
    <>
      <Header profile={profile} />
      <main id="main" className="project-detail pb-24">
        <Container>
          <div className="detail-hero">
            <Reveal from="left" className="detail-copy">
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
            <Reveal from="right" delay={0.15} className="detail-mockup">
              <div className="tilt-frame">
                <BrowserBar />
                <div className="detail-screen">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      preload
                      sizes="(max-width: 1023px) 100vw, 560px"
                      className="object-cover"
                    />
                  ) : (
                    <Wireframe />
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          <dl className="detail-stats">
            <div>
              <dt>Type</dt>
              <dd>{project.projectType}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{stack.length} tools</dd>
            </div>
          </dl>

          {!!project.images.length && (
            <Reveal delay={0.1} className="detail-gallery">
              <ProjectSlider images={project.images} title={project.title} />
            </Reveal>
          )}

          <div className="detail-body">
            <Reveal className="detail-aside">
              {!!stack.length && (
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
            <div className="detail-sections">
              {sections.map(([title, content], i) => (
                <Reveal key={title} from="up" className="detail-section">
                  <span className="detail-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="detail-section-title">{title}</h2>
                    <p className="muted whitespace-pre-line text-sm leading-8">
                      {content}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="detail-next">
            <Link href="/projects" className="button button-secondary">
              <ArrowLeft size={16} />
              More projects
            </Link>
            <Link href="/#contact" className="detail-cta magnetic">
              Let&apos;s talk about your project <ArrowUpRight size={20} />
            </Link>
          </Reveal>
        </Container>
      </main>
      <Footer profile={profile} />
    </>
  );
}
