import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
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
  return (
    <>
      <Header profile={profile} />
      <main id="main" className="pb-24">
        <Container>
          <Reveal from="down" className="archive-heading">
            <span className="archive-ghost" aria-hidden="true">
              PROJECTS
            </span>
            <div>
              <p className="section-cmd" aria-hidden="true">
                <span>$</span> ls -la ~/projects
              </p>
              <h1 className="archive-title">Projects</h1>
              <p className="muted mt-4 text-base">
                Web, mobile, and machine learning
              </p>
            </div>
            <p className="archive-count" aria-hidden="true">
              <b>{projects.length}</b> repositories
            </p>
          </Reveal>
          <ProjectGrid projects={projects} searchable />
        </Container>
      </main>
      <Footer profile={profile} />
    </>
  );
}
