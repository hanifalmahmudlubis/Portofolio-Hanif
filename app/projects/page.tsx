import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Scene3D from "@/components/ui/Scene3D";
import SplitText from "@/components/ui/SplitText";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { listProjects } from "@/lib/services/portfolio";
import { getPublicProfile } from "@/lib/services/content";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };
export default async function ProjectsPage() {
  const [projects, profile] = await Promise.all([
    listProjects(),
    getPublicProfile(),
  ]);
  const technologies = new Set(
    projects.flatMap((project) =>
      project.technologies.map(({ technology }) => technology.name),
    ),
  );
  const counts = [
    ["Projects", projects.length],
    ["Categories", new Set(projects.map((project) => project.category)).size],
    ["Technologies", technologies.size],
  ] as const;
  return (
    <>
      <Header profile={profile} />
      <main id="main" className="pb-28">
        <section className="archive-hero">
          <Scene3D variant="light" className="opacity-70" />
          <Container>
            <div className="archive-heading">
              <Reveal from="up">
                <span className="eyebrow">Web, mobile & machine learning</span>
                <h1 className="archive-title">
                  <SplitText text="Projects" />
                </h1>
              </Reveal>
              <Reveal from="up" delay={0.1}>
                <dl className="archive-count">
                  {counts.map(([label, value]) => (
                    <div key={label} className="flex flex-col-reverse">
                      <dt>{label}</dt>
                      <dd>{String(value).padStart(2, "0")}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </Container>
        </section>
        <Container className="pt-14">
          <ProjectGrid projects={projects} searchable />
        </Container>
      </main>
      <Footer profile={profile} />
    </>
  );
}
