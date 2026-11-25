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
        <div className="section-heading-row">
          <SectionHeading title="Projects" />
          <Link href="/projects" className="text-link">
            All projects <ArrowUpRight size={15} />
          </Link>
        </div>
        <ProjectGrid projects={projects} />
      </Container>
    </section>
  );
}
