import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { listProjects } from "@/lib/services/portfolio";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };
export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <>
      <Header />
      <main id="main" className="pb-24">
        <Container>
          <Reveal className="pb-12 pt-16">
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
              Projects
            </h1>
            <p className="muted mt-4 text-sm">
              Web, mobile, and machine learning
            </p>
          </Reveal>
          <ProjectGrid projects={projects} searchable />
        </Container>
      </main>
      <Footer />
    </>
  );
}
