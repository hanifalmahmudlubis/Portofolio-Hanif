import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import ProjectGrid from "../projects/ProjectGrid";
import type { Project } from "@/types/project";
export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="section">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 [&>div]:mb-0">
          <SectionHeading title="Selected projects" />
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-primary"
          >
            All projects <ArrowUpRight size={15} />
          </Link>
        </div>
        <ProjectGrid projects={projects} />
      </Container>
    </section>
  );
}
